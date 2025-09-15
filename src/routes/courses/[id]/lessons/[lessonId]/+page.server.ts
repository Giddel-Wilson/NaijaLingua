import { db } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	const courseId = params.id;
	const lessonId = params.lessonId;

	try {
		// Check if user is enrolled in this course
		const enrollment = await db.enrollment.findFirst({
			where: {
				userId: user.id,
				courseId: courseId
			}
		});

		if (!enrollment) {
			throw error(404, 'Course not found or you are not enrolled in this course');
		}

		// Get the lesson
		const lesson = await db.lesson.findFirst({
			where: {
				id: lessonId,
				courseId: courseId,
				isPublished: true
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
							select: {
								id: true,
								title: true,
								order: true
							}
						}
					}
				},
				quizzes: {
					include: {
						questions: true
					}
				}
			}
		});

		if (!lesson) {
			throw error(404, 'Lesson not found');
		}

		// Get or create lesson progress
		let lessonProgress = await db.lessonProgress.findFirst({
			where: {
				userId: user.id,
				lessonId: lessonId
			}
		});

		if (!lessonProgress) {
			lessonProgress = await db.lessonProgress.create({
				data: {
					userId: user.id,
					lessonId: lessonId,
					completed: false,
					timeSpent: 0
				}
			});
		}

		// Get quiz attempts for this lesson
		const quizAttempts = await db.quizAttempt.findMany({
			where: {
				userId: user.id,
				quiz: {
					lessonId: lessonId
				}
			},
			include: {
				quiz: true
			}
		});

		// Find current lesson index and next/previous lessons
		const currentIndex = lesson.course.lessons.findIndex(l => l.id === lessonId);
		const previousLesson = currentIndex > 0 ? lesson.course.lessons[currentIndex - 1] : null;
		const nextLesson = currentIndex < lesson.course.lessons.length - 1 ? lesson.course.lessons[currentIndex + 1] : null;

		return {
			lesson,
			lessonProgress,
			quizAttempts,
			previousLesson,
			nextLesson,
			courseId,
			user
		};
	} catch (err) {
		console.error('Error loading lesson:', err);
		throw error(500, 'Failed to load lesson');
	}
};
