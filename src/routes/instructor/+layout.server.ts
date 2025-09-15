import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/db';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const user = locals.user;

	if (user.suspended || user.banned) {
		throw redirect(302, '/auth/login?error=Account suspended or banned');
	}

	// Check if user is instructor or admin
	if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
		throw redirect(302, '/dashboard');
	}

	try {
		// Get instructor statistics
		const [coursesCount, publishedCourses, totalStudents, totalRevenue] = await Promise.all([
			// Total courses created
			db.course.count({
				where: { createdById: user.id }
			}),
			
			// Published courses
			db.course.count({
				where: { 
					createdById: user.id,
					isPublished: true 
				}
			}),
			
			// Total students enrolled
			db.enrollment.count({
				where: {
					course: {
						createdById: user.id
					}
				}
			}),
			
			// Total revenue (placeholder - would need payment integration)
			0 // TODO: Calculate from payments when payment system is implemented
		]);

		return {
			user,
			stats: {
				coursesCount,
				publishedCourses,
				totalStudents,
				totalRevenue
			}
		};
	} catch (error) {
		console.error('Instructor layout load error:', error);
		throw redirect(302, '/auth/login');
	}
};
