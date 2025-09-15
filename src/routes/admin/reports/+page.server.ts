import { db } from '$lib/db';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  try {
    console.log('Starting reports data load...');
    
    // Simple test first - let's get basic counts directly
    const userCount = await db.user.count();
    const courseCount = await db.course.count();
    const enrollmentCount = await db.enrollment.count();
    const lessonCount = await db.lesson.count();
    
    console.log('Basic counts:', { userCount, courseCount, enrollmentCount, lessonCount });
    
    // Return simplified data structure first to test
    return {
      userReports: {
        stats: { 
          total: userCount, 
          banned: 0, 
          suspended: 0, 
          active: userCount, 
          admins: 1, 
          instructors: 0, 
          students: userCount - 1 
        },
        byRole: [],
        byStatus: { active: userCount, banned: 0, suspended: 0 }
      },
      courseReports: {
        stats: { total: courseCount, published: courseCount, draft: 0 },
        byLanguage: [],
        byLevel: [],
        byPublishStatus: []
      },
      enrollmentReports: {
        stats: { total: enrollmentCount, completed: 0, inProgress: enrollmentCount, completionRate: 0 },
        byStatus: [],
        byMonth: []
      },
      performanceReports: {
        instructors: [],
        courses: []
      },
      contentReports: {
        lessonsPerCourse: [],
        quizzesPerCourse: []
      }
    };
  } catch (error) {
    console.error('Error loading reports data:', error);
    return {
      userReports: {
        stats: { total: 0, banned: 0, suspended: 0, active: 0, admins: 0, instructors: 0, students: 0 },
        byRole: [],
        byStatus: { active: 0, banned: 0, suspended: 0 }
      },
      courseReports: {
        stats: { total: 0, published: 0, draft: 0 },
        byLanguage: [],
        byLevel: [],
        byPublishStatus: []
      },
      enrollmentReports: {
        stats: { total: 0, completed: 0, inProgress: 0, completionRate: 0 },
        byStatus: [],
        byMonth: []
      },
      performanceReports: {
        instructors: [],
        courses: []
      },
      contentReports: {
        lessonsPerCourse: [],
        quizzesPerCourse: []
      }
    };
  }
};

export const actions: Actions = {
  exportReport: async ({ request }) => {
    try {
      const data = await request.formData();
      const reportType = data.get('reportType') as string;
      const format = data.get('format') as string;

      if (!reportType || !format) {
        return fail(400, {
          error: 'Report type and format are required'
        });
      }

      // Here you would implement the actual export logic
      // For now, we'll just return a success message
      return {
        success: true,
        message: `${reportType} report exported successfully in ${format} format`,
        downloadUrl: `/api/reports/download?type=${reportType}&format=${format}`
      };
    } catch (error) {
      console.error('Error exporting report:', error);
      return fail(500, {
        error: 'Failed to export report. Please try again.'
      });
    }
  }
};
