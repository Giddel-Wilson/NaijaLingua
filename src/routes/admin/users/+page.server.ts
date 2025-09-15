import { db } from '$lib/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const role = url.searchParams.get('role') || '';
  const status = url.searchParams.get('status') || '';
  
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'ALL') {
      where.role = role;
    }
    
    if (status === 'SUSPENDED') {
      where.suspended = true;
    } else if (status === 'BANNED') {
      where.banned = true;
    } else if (status === 'ACTIVE') {
      where.suspended = false;
      where.banned = false;
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              courses: true,
              enrollments: true,
              certificates: true
            }
          }
        }
      }),
      db.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      users,
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
        role,
        status
      }
    };
  } catch (error) {
    console.error('Error loading users:', error);
    return {
      users: [],
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
        role: '',
        status: ''
      }
    };
  }
};

export const actions: Actions = {
  suspend: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: { suspended: true }
      });

      return { success: true, message: 'User suspended successfully' };
    } catch (error) {
      console.error('Error suspending user:', error);
      return fail(500, { error: 'Failed to suspend user' });
    }
  },

  unsuspend: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: { suspended: false }
      });

      return { success: true, message: 'User unsuspended successfully' };
    } catch (error) {
      console.error('Error unsuspending user:', error);
      return fail(500, { error: 'Failed to unsuspend user' });
    }
  },

  ban: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: { banned: true, suspended: true }
      });

      return { success: true, message: 'User banned successfully' };
    } catch (error) {
      console.error('Error banning user:', error);
      return fail(500, { error: 'Failed to ban user' });
    }
  },

  unban: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;

    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: { banned: false, suspended: false }
      });

      return { success: true, message: 'User unbanned successfully' };
    } catch (error) {
      console.error('Error unbanning user:', error);
      return fail(500, { error: 'Failed to unban user' });
    }
  },

  changeRole: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const newRole = formData.get('role') as 'STUDENT' | 'TUTOR' | 'ADMIN';

    if (!userId || !newRole) {
      return fail(400, { error: 'User ID and role are required' });
    }

    if (!['STUDENT', 'TUTOR', 'ADMIN'].includes(newRole)) {
      return fail(400, { error: 'Invalid role' });
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: { role: newRole }
      });

      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error updating user role:', error);
      return fail(500, { error: 'Failed to update user role' });
    }
  }
};
