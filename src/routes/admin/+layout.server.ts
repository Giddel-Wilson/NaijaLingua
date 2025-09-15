import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { db } from '$lib/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  // Check if user is authenticated and is an admin
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  if (locals.user.role !== 'ADMIN') {
    throw redirect(302, '/dashboard');
  }

  // Get additional admin data
  const [usersCount, coursesCount, enrollmentsCount] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count()
  ]);

  return {
    user: locals.user,
    stats: {
      usersCount,
      coursesCount,
      enrollmentsCount
    }
  };
};
