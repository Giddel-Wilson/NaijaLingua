import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('User not authenticated');
	}

	try {
		// Get user's enrolled courses
		const enrolledCourses = await db.enrollment.findMany({
			where: { userId: user.id },
			include: {
				course: {
					include: {
						createdBy: {
							select: {
								name: true
							}
						},
						_count: {
							select: {
								lessons: true,
								enrollments: true
							}
						}
					}
				}
			},
			orderBy: {
				startedAt: 'desc'
			}
		});

		// Get completed courses (certificates)
		const certificates = await db.certificate.findMany({
			where: { userId: user.id },
			include: {
				course: {
					select: {
						title: true,
						language: true
					}
				}
			},
			orderBy: { dateIssued: 'desc' }
		});

		// Get full user data
		const fullUser = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				bio: true,
				profileImage: true,
				createdAt: true
			}
		});

		return {
			enrolledCourses,
			certificates,
			user: fullUser || user
		};
	} catch (error) {
		console.error('Error loading dashboard courses:', error);
		return {
			enrolledCourses: [],
			certificates: [],
			user
		};
	}
};
