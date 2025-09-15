import { db } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	const courseId = params.id;
	const sessionParam = url.searchParams.get('session');
	const currentSession = sessionParam ? parseInt(sessionParam) : 1;

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

		// Get the course details
		const course = await db.course.findUnique({
			where: { id: courseId },
			include: {
				lessons: {
					where: {
						isPublished: true
					},
					orderBy: {
						order: 'asc'
					},
					include: {
						quizzes: true
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
		});

		if (!course) {
			throw error(404, 'Course not found');
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

		// Get the current lesson based on session number
		const currentLesson = course.lessons[currentSession - 1];
		
		// Debug logging
		console.log('Debug info:', {
			courseTitle: course.title,
			totalLessons: course.lessons.length,
			publishedLessons: course.lessons.filter(l => l.isPublished).length,
			currentSession,
			hasCurrentLesson: !!currentLesson
		});
		
		// If no current lesson, handle gracefully
		if (!currentLesson) {
			if (course.lessons.length === 0) {
				console.log('No lessons found, showing empty state');
				// No lessons in course, return a default structure for empty course
				return {
					enrollment,
					course: course,
					currentLesson: null,
					currentSession: 1,
					totalSessions: 0,
					lessonProgress: [],
					currentLessonProgress: null,
					quizAttempts: [],
					courseProgress: 0,
					user,
					isEmpty: true
				};
			} else {
				// Invalid session number, redirect to session 1
				throw redirect(302, `/dashboard/courses/${courseId}?session=1`);
			}
		}

		// Get or create lesson progress for current lesson
		let currentLessonProgress = await db.lessonProgress.findFirst({
			where: {
				userId: user.id,
				lessonId: currentLesson.id
			}
		});

		if (!currentLessonProgress) {
			currentLessonProgress = await db.lessonProgress.create({
				data: {
					userId: user.id,
					lessonId: currentLesson.id,
					completed: false,
					timeSpent: 0
				}
			});
		}

		// Get quiz attempts for current lesson
		const quizAttempts = await db.quizAttempt.findMany({
			where: {
				userId: user.id,
				quiz: {
					lessonId: currentLesson.id
				}
			},
			include: {
				quiz: true
			}
		});

		// Calculate quiz status for current lesson (80% pass threshold, unlimited retakes)
		const currentLessonQuizzes = currentLesson.quizzes || [];
		let quizStatus = {
			hasQuizzes: currentLessonQuizzes.length > 0,
			bestScore: 0,
			hasPassed: false, // Default to false - only true if actually passed
			canTakeQuiz: currentLessonQuizzes.length > 0, // Can take if has quizzes and not passed
			totalAttempts: 0
		};

		if (currentLessonQuizzes.length > 0 && quizAttempts.length > 0) {
			// Group attempts by time (5-minute windows to count as one attempt)
			const attemptGroups = new Map();
			
			for (const attempt of quizAttempts) {
				const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
				if (!attemptGroups.has(timeKey)) {
					attemptGroups.set(timeKey, new Set());
				}
				attemptGroups.get(timeKey).add(attempt.quizId);
			}

			// Find the best score from complete attempts
			let bestScore = 0;
			let totalAttempts = 0;
			let hasPassed = false;

			for (const [timeKey, quizIds] of attemptGroups) {
				if (quizIds.size === currentLessonQuizzes.length) {
					totalAttempts++;
					
					// Calculate score for this attempt
					const attemptTime = new Date(timeKey * 5 * 60 * 1000);
					const attemptResults = quizAttempts.filter(a => 
						Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
					);
					
					const correctCount = attemptResults.filter(a => a.isCorrect).length;
					const scorePercentage = Math.round((correctCount / currentLessonQuizzes.length) * 100);
					
					if (scorePercentage > bestScore) {
						bestScore = scorePercentage;
					}
					
					// 80% pass threshold
					if (scorePercentage >= 80) {
						hasPassed = true;
					}
				}
			}

			quizStatus = {
				hasQuizzes: true,
				bestScore: bestScore,
				hasPassed: hasPassed,
				canTakeQuiz: !hasPassed, // Can only retake if not passed yet
				totalAttempts: totalAttempts
			};
		}

		// Calculate course progress
		const completedLessons = lessonProgress.filter(p => p.completed).length;
		const totalLessons = course.lessons.length;
		const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

		return {
			enrollment,
			course: course,
			currentLesson,
			currentSession,
			totalSessions: totalLessons,
			lessonProgress,
			currentLessonProgress,
			quizAttempts,
			quizStatus,
			courseProgress,
			user
		};
	} catch (err) {
		console.error('Error loading course session:', err);
		if (err instanceof Error && err.message.includes('redirect')) {
			throw err;
		}
		throw error(500, 'Failed to load course session');
	}
};
