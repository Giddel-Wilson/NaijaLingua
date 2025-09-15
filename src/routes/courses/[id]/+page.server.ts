import { db } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	const courseId = params.id;

	try {
		// Check if user is enrolled in this course
		const enrollment = await db.enrollment.findFirst({
			where: {
				userId: user.id,
				courseId: courseId
			},
			include: {
				course: {
					include: {
						lessons: {
							where: {
								isPublished: true
							},
							orderBy: {
								order: 'asc'
							},
							include: {
								quizzes: {
									include: {
										questions: true
									}
								}
							}
						},
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
			}
		});

		if (!enrollment) {
			throw error(404, 'Course not found or you are not enrolled in this course');
		}

		// Get user's progress for each lesson
		const lessonProgress = await db.lessonProgress.findMany({
			where: {
				userId: user.id,
				lesson: {
					courseId: courseId
				}
			}
		});

		// Get user's quiz attempts
		const quizAttempts = await db.quizAttempt.findMany({
			where: {
				userId: user.id,
				quiz: {
					lesson: {
						courseId: courseId
					}
				}
			},
			include: {
				quiz: {
					include: {
						lesson: true
					}
				}
			}
		});

		return {
			enrollment,
			course: enrollment.course,
			lessonProgress,
			quizAttempts,
			user
		};
	} catch (err) {
		console.error('Error loading course:', err);
		throw error(500, 'Failed to load course');
	}
};
