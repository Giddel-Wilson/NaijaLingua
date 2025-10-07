import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Get comprehensive statistics
    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      completedEnrollments,
      totalLessons,
      totalQuizzes,
      recentUsers,
      recentCourses,
      recentEnrollments,
      topInstructors,
      topCourses
    ] = await Promise.all([
      // User statistics
      db.user.count(),
      db.user.count({ where: { role: 'INSTRUCTOR' } }),
      db.user.count({ where: { role: 'STUDENT' } }),
      
      // Course statistics
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.course.count({ where: { isPublished: false } }),
      
      // Enrollment statistics
      db.enrollment.count(),
      db.enrollment.count({ where: { isCompleted: true } }),
      
      // Content statistics
      db.lesson.count(),
      db.quiz.count(),
      
      // Recent activity
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      }),
      
      db.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } } }
      }),
      
      db.enrollment.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } }
        }
      }),
      
      // Top performers
      db.user.findMany({
        where: { role: 'INSTRUCTOR' },
        take: 5,
        include: {
          courses: {
            include: { _count: { select: { enrollments: true } } }
          }
        }
      }),
      
      db.course.findMany({
        take: 5,
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { enrollments: true } }
        },
        orderBy: {
          enrollments: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Calculate growth rates (simplified - you might want to compare with previous periods)
    const userGrowthRate = 12.5; // Placeholder
    const courseGrowthRate = 8.3;
    const enrollmentGrowthRate = 15.2;
    const revenueGrowthRate = 22.1;

    return {
      stats: {
        users: {
          total: totalUsers,
          instructors: totalInstructors,
          students: totalStudents,
          growthRate: userGrowthRate
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
          growthRate: courseGrowthRate
        },
        enrollments: {
          total: totalEnrollments,
          active: totalEnrollments - completedEnrollments,
          completed: completedEnrollments,
          completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
          growthRate: enrollmentGrowthRate
        },
        content: {
          lessons: totalLessons,
          quizzes: totalQuizzes
        },
        revenue: {
          total: 45680, // Placeholder - calculate from enrollments
          growthRate: revenueGrowthRate
        }
      },
      recent: {
        users: recentUsers,
        courses: recentCourses,
        enrollments: recentEnrollments
      },
      top: {
        instructors: topInstructors.map(instructor => ({
          ...instructor,
          totalEnrollments: instructor.courses.reduce(
            (sum: number, course: any) => sum + course._count.enrollments, 0
          )
        })),
        courses: topCourses
      }
    };
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    return {
      stats: {
        users: { total: 0, instructors: 0, students: 0, growthRate: 0 },
        courses: { total: 0, published: 0, draft: 0, growthRate: 0 },
        enrollments: { total: 0, active: 0, completed: 0, completionRate: 0, growthRate: 0 },
        content: { lessons: 0, quizzes: 0 },
        revenue: { total: 0, growthRate: 0 }
      },
      recent: { users: [], courses: [], enrollments: [] },
      top: { instructors: [], courses: [] }
    };
  }
};
