import { db } from '$lib/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const language = url.searchParams.get('language') || '';
  const level = url.searchParams.get('level') || '';
  
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { createdBy: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (status === 'PUBLISHED') {
      where.isPublished = true;
    } else if (status === 'DRAFT') {
      where.isPublished = false;
    } else if (status === 'APPROVED') {
      where.isApproved = true;
    } else if (status === 'PENDING') {
      where.isApproved = false;
    }
    
    if (language && language !== 'ALL') {
      where.language = language;
    }
    
    if (level && level !== 'ALL') {
      where.level = level;
    }

    const [courses, totalCount] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              certificates: true
            }
          }
        }
      }),
      db.course.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get summary stats
    const [totalCourses, publishedCourses, pendingApproval, totalRevenue] = await Promise.all([
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.course.count({ where: { isApproved: false, isPublished: true } }),
      // Calculate revenue from course prices and enrollments
      db.course.aggregate({
        _sum: { price: true }
      })
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        status,
        language,
        level
      },
      stats: {
        total: totalCourses,
        published: publishedCourses,
        pending: pendingApproval,
        revenue: totalRevenue._sum.price || 0
      }
    };
  } catch (error) {
    console.error('Error loading courses:', error);
    return {
      courses: [],
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      filters: {
        search: '',
        status: '',
        language: '',
        level: ''
      },
      stats: {
        total: 0,
        published: 0,
        pending: 0,
        revenue: 0
      }
    };
  }
};

export const actions: Actions = {
  approve: async ({ request }) => {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;

    if (!courseId) {
      return fail(400, { error: 'Course ID is required' });
    }

    try {
      await db.course.update({
        where: { id: courseId },
        data: { isApproved: true }
      });

      return { success: true, message: 'Course approved successfully' };
    } catch (error) {
      console.error('Error approving course:', error);
      return fail(500, { error: 'Failed to approve course' });
    }
  },

  reject: async ({ request }) => {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;

    if (!courseId) {
      return fail(400, { error: 'Course ID is required' });
    }

    try {
      await db.course.update({
        where: { id: courseId },
        data: { isApproved: false, isPublished: false }
      });

      return { success: true, message: 'Course rejected successfully' };
    } catch (error) {
      console.error('Error rejecting course:', error);
      return fail(500, { error: 'Failed to reject course' });
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;

    if (!courseId) {
      return fail(400, { error: 'Course ID is required' });
    }

    try {
      // Delete course and all related data (cascading)
      await db.course.delete({
        where: { id: courseId }
      });

      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      console.error('Error deleting course:', error);
      return fail(500, { error: 'Failed to delete course' });
    }
  },

  togglePublish: async ({ request }) => {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;

    if (!courseId) {
      return fail(400, { error: 'Course ID is required' });
    }

    try {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { isPublished: true }
      });

      if (!course) {
        return fail(404, { error: 'Course not found' });
      }

      await db.course.update({
        where: { id: courseId },
        data: { isPublished: !course.isPublished }
      });

      return { 
        success: true, 
        message: `Course ${course.isPublished ? 'unpublished' : 'published'} successfully` 
      };
    } catch (error) {
      console.error('Error toggling course publish status:', error);
      return fail(500, { error: 'Failed to update course status' });
    }
  }
};
