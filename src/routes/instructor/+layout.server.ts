import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { verifyJWT } from '$lib/auth';
import { db } from '$lib/db';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	
	if (!token) {
		throw redirect(302, '/auth/login');
	}

	try {
		const payload = verifyJWT(token);
		const user = await db.user.findUnique({
			where: { id: payload.userId },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				profileImage: true,
				suspended: true,
				banned: true
			}
		});

		if (!user) {
			cookies.delete('token', { path: '/' });
			throw redirect(302, '/auth/login');
		}

		if (user.suspended || user.banned) {
			cookies.delete('token', { path: '/' });
			throw redirect(302, '/auth/login?error=Account suspended or banned');
		}

		// Check if user is instructor or admin
		if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
			throw redirect(302, '/dashboard');
		}

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
		cookies.delete('token', { path: '/' });
		throw redirect(302, '/auth/login');
	}
};
