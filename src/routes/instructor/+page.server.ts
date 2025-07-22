import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// Get recent courses
	const recentCourses = await db.course.findMany({
		where: { createdById: user.id },
		orderBy: { createdAt: 'desc' },
		take: 5,
		include: {
			_count: {
				select: {
					enrollments: true,
					lessons: true
				}
			}
		}
	});

	// Get recent enrollments
	const recentEnrollments = await db.enrollment.findMany({
		where: {
			course: {
				createdById: user.id
			}
		},
		orderBy: { startedAt: 'desc' },
		take: 10,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					profileImage: true
				}
			},
			course: {
				select: {
					id: true,
					title: true,
					language: true
				}
			}
		}
	});

	// Calculate monthly stats (last 30 days)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [monthlyEnrollments, completedCourses] = await Promise.all([
		db.enrollment.count({
			where: {
				course: {
					createdById: user.id
				},
				startedAt: {
					gte: thirtyDaysAgo
				}
			}
		}),
		
		db.enrollment.count({
			where: {
				course: {
					createdById: user.id
				},
				isCompleted: true
			}
		})
	]);

	return {
		recentCourses,
		recentEnrollments,
		monthlyStats: {
			enrollments: monthlyEnrollments,
			completions: completedCourses
		}
	};
};
