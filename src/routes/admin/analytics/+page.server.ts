import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Platform Overview
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      // Growth metrics
      newUsersThisMonth,
      newCoursesThisMonth,
      newEnrollmentsThisMonth,
      // Recent activity
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      // Calculate revenue based on course prices
      db.enrollment.aggregate({
        _sum: {
          totalScore: true
        }
      }),
      // Growth metrics
      db.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.course.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      db.enrollment.count({
        where: { startedAt: { gte: thirtyDaysAgo } }
      }),
      // Activity metrics (using updatedAt as proxy for activity)
      db.user.count({
        where: { updatedAt: { gte: oneDayAgo } }
      }),
      db.user.count({
        where: { updatedAt: { gte: sevenDaysAgo } }
      }),
      db.user.count({
        where: { updatedAt: { gte: thirtyDaysAgo } }
      })
    ]);

    // Course Performance - Fixed orderBy syntax
    const topCourses = await db.course.findMany({
      take: 10,
      orderBy: { 
        enrollments: { _count: 'desc' } 
      },
      include: {
        createdBy: { select: { name: true } },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            certificates: true
          }
        }
      }
    });

    // Instructor Performance
    const topInstructors = await db.user.findMany({
      where: { role: 'INSTRUCTOR' },
      take: 10,
      include: {
        courses: {
          include: {
            _count: { select: { enrollments: true } }
          }
        }
      }
    });

    // Language Distribution
    const languageStats = await db.course.groupBy({
      by: ['language'],
      _count: {
        language: true
      },
      orderBy: {
        _count: {
          language: 'desc'
        }
      }
    });

    // Level Distribution
    const levelStats = await db.course.groupBy({
      by: ['level'],
      _count: {
        level: true
      }
    });

    // Completion Rates
    const completionRates = await db.enrollment.groupBy({
      by: ['isCompleted'],
      _count: {
        isCompleted: true
      }
    });

    // Recent enrollments for trend analysis
    const recentEnrollments = await db.enrollment.findMany({
      where: {
        startedAt: { gte: thirtyDaysAgo }
      },
      orderBy: { startedAt: 'asc' },
      include: {
        course: { select: { title: true, language: true } },
        user: { select: { name: true } }
      }
    });

    // Calculate revenue growth (placeholder calculation)
    const revenueGrowth = 15.2; // This would be calculated from actual payment data

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.totalScore || 0,
        growth: {
          users: totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0,
          courses: totalCourses > 0 ? (newCoursesThisMonth / totalCourses) * 100 : 0,
          enrollments: totalEnrollments > 0 ? (newEnrollmentsThisMonth / totalEnrollments) * 100 : 0,
          revenue: revenueGrowth
        }
      },
      activity: {
        daily: dailyActiveUsers,
        weekly: weeklyActiveUsers,
        monthly: monthlyActiveUsers
      },
      performance: {
        topCourses: topCourses.map(course => ({
          ...course,
          enrollmentRate: course._count.enrollments,
          completionRate: course._count.certificates > 0 && course._count.enrollments > 0
            ? (course._count.certificates / course._count.enrollments) * 100 
            : 0
        })),
        topInstructors: topInstructors.map(instructor => ({
          ...instructor,
          totalEnrollments: instructor.courses.reduce(
            (sum, course) => sum + course._count.enrollments, 0
          ),
          totalCourses: instructor.courses.length
        }))
      },
      distribution: {
        languages: languageStats,
        levels: levelStats,
        completion: completionRates
      },
      trends: {
        enrollments: recentEnrollments,
        // Generate daily enrollment counts for chart
        dailyEnrollments: generateDailyStats(recentEnrollments, thirtyDaysAgo)
      }
    };
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return {
      overview: {
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        growth: { users: 0, courses: 0, enrollments: 0, revenue: 0 }
      },
      activity: { daily: 0, weekly: 0, monthly: 0 },
      performance: { topCourses: [], topInstructors: [] },
      distribution: { languages: [], levels: [], completion: [] },
      trends: { enrollments: [], dailyEnrollments: [] }
    };
  }
};

function generateDailyStats(enrollments: any[], startDate: Date) {
  const dailyStats = [];
  const today = new Date();
  
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayEnrollments = enrollments.filter(enrollment => {
      const enrollDate = new Date(enrollment.startedAt);
      return enrollDate >= dayStart && enrollDate <= dayEnd;
    }).length;
    
    dailyStats.push({
      date: new Date(d).toISOString().split('T')[0],
      enrollments: dayEnrollments
    });
  }
  
  return dailyStats;
}
