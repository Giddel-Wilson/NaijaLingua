import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const token = cookies.get('token');
	if (!token) {
		throw redirect(302, '/auth/login');
	}

	const payload = verifyJWT(token);
	if (!payload) {
		throw redirect(302, '/auth/login');
	}

	const user = await db.user.findUnique({
		where: { id: payload.userId }
	});

	if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
		throw redirect(302, '/dashboard');
	}

	const courseId = params.id;

	try {
		// Verify course exists and user has permission
		const course = await db.course.findUnique({
			where: { id: courseId },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});

		if (!course) {
			throw redirect(302, '/instructor/courses');
		}

		if (course.createdById !== user.id && user.role !== 'ADMIN') {
			throw redirect(302, '/instructor/courses');
		}

		// Get course enrollments with student progress
		const enrollments = await db.enrollment.findMany({
			where: { courseId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						createdAt: true
					}
				}
			},
			orderBy: {
				startedAt: 'desc'
			}
		});

		// Get total lessons count for progress calculation
		const totalLessons = await db.lesson.count({
			where: { 
				courseId,
				isPublished: true
			}
		});

		// Calculate progress percentages
		const studentsWithProgress = enrollments.map(enrollment => ({
			...enrollment,
			progressPercentage: totalLessons > 0 ? Math.round((enrollment.lessonsCompleted / totalLessons) * 100) : 0,
			averageScore: enrollment.totalScore > 0 ? Math.round(enrollment.score || 0) : 0
		}));

		return {
			course,
			students: studentsWithProgress,
			totalLessons,
			stats: {
				totalStudents: enrollments.length,
				activeStudents: enrollments.filter(e => e.progress > 0).length,
				completedStudents: enrollments.filter(e => e.isCompleted).length,
				averageProgress: enrollments.length > 0 
					? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
					: 0
			}
		};
	} catch (error) {
		console.error('Error loading student data:', error);
		throw redirect(302, '/instructor/courses');
	}
};
