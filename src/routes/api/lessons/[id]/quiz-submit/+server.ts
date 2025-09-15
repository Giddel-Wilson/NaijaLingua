import { json } from '@sveltejs/kit';
import { db, withRetry, safeDbOperation } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		console.log('Quiz status GET: No user found in locals');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const lessonId = params.id;
		console.log(`Quiz status GET: Checking lesson ${lessonId} for user ${user.id}`);

		// First, verify the lesson exists with retry logic
		const lesson = await safeDbOperation(async () => {
			return await db.lesson.findUnique({
				where: { id: lessonId },
				include: { quizzes: true }
			});
		});

		if (!lesson) {
			console.log(`Quiz status GET: Lesson ${lessonId} not found or database error`);
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		console.log(`Quiz status GET: Found lesson "${lesson.title}" with ${lesson.quizzes.length} quizzes`);

		// Get all quizzes for this lesson
		const quizzes = lesson.quizzes;

		if (quizzes.length === 0) {
			console.log(`Quiz status GET: No quizzes found for lesson ${lessonId}`);
			return json({
				hasQuizzes: false,
				attemptsUsed: 0,
				attemptsRemaining: 3,
				canTakeQuiz: false
			});
		}

		// Check existing attempts with retry logic
		console.log(`Quiz status GET: Checking attempts for user ${user.id} and lesson ${lessonId}`);
		const existingAttempts = await safeDbOperation(async () => {
			return await db.quizAttempt.findMany({
				where: {
					userId: user.id,
					quiz: {
						lessonId: lessonId
					}
				},
				select: {
					quizId: true,
					attemptedAt: true,
					isCorrect: true
				},
				orderBy: { attemptedAt: 'desc' }
			});
		}, []); // Fallback to empty array if DB fails

		console.log(`Quiz status GET: Found ${existingAttempts?.length || 0} quiz attempts`);

		// Group attempts by time (5-minute windows)
		const attemptGroups = new Map();
		
		// Handle case where database query failed
		if (!existingAttempts) {
			console.log('Quiz status GET: Database query failed, assuming no attempts');
		} else {
			for (const attempt of existingAttempts) {
				const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
				if (!attemptGroups.has(timeKey)) {
					attemptGroups.set(timeKey, new Set());
				}
				attemptGroups.get(timeKey).add(attempt.quizId);
			}
		}

		// Count complete attempts
		let completeAttempts = 0;
		let bestScore = 0;
		let hasPassed = false;

		for (const [timeKey, quizIds] of attemptGroups) {
			if (quizIds.size === quizzes.length) {
				completeAttempts++;
				
				// Calculate score for this attempt
				const attemptTime = new Date(timeKey * 5 * 60 * 1000);
				const attemptResults = existingAttempts?.filter(a => 
					Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
				) || [];
				
				const correctCount = attemptResults.filter(a => a.isCorrect).length;
				const scorePercentage = Math.round((correctCount / quizzes.length) * 100);
				
				if (scorePercentage > bestScore) {
					bestScore = scorePercentage;
				}
				
				if (scorePercentage >= 80) {
					hasPassed = true;
				}
			}
		}

		const canTakeQuiz = !hasPassed; // Can take quiz until passed with 80%

		const response = {
			hasQuizzes: true,
			totalAttempts: completeAttempts,
			bestScore: bestScore,
			canTakeQuiz: canTakeQuiz,
			hasPassed: hasPassed,
			totalQuestions: quizzes.length
		};

		console.log(`Quiz status GET: Returning response:`, response);

		return json(response);

	} catch (error) {
		console.error('Error checking quiz status for lesson', params.id, ':', error);
		return json({ 
			error: 'Failed to check quiz status',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { answers } = await request.json(); // answers is an array of { quizId, answer }
		const lessonId = params.id;

		// Get all quizzes for this lesson
		const quizzes = await db.quiz.findMany({
			where: { lessonId: lessonId },
			orderBy: { order: 'asc' }
		});

		if (quizzes.length === 0) {
			return json({ error: 'No quizzes found for this lesson' }, { status: 404 });
		}

		// Check existing attempts to calculate best score and pass status
		const existingAttempts = await db.quizAttempt.findMany({
			where: {
				userId: user.id,
				quiz: {
					lessonId: lessonId
				}
			},
			select: {
				quizId: true,
				attemptedAt: true,
				isCorrect: true
			}
		});

		// Group attempts by time (5-minute groups) to count total attempts
		const attemptGroups = new Map();
		for (const attempt of existingAttempts) {
			const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
			if (!attemptGroups.has(timeKey)) {
				attemptGroups.set(timeKey, new Set());
			}
			attemptGroups.get(timeKey).add(attempt.quizId);
		}

		// Count complete attempts and find best score
		let totalAttempts = 0;
		let bestPreviousScore = 0;
		let alreadyPassed = false;

		for (const [timeKey, quizIds] of attemptGroups) {
			if (quizIds.size === quizzes.length) {
				totalAttempts++;
				
				// Calculate score for this attempt
				const attemptTime = new Date(timeKey * 5 * 60 * 1000);
				const attemptResults = existingAttempts.filter(a => 
					Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
				);
				
				const correctCount = attemptResults.filter(a => a.isCorrect).length;
				const scorePercentage = Math.round((correctCount / quizzes.length) * 100);
				
				if (scorePercentage > bestPreviousScore) {
					bestPreviousScore = scorePercentage;
				}
				
				if (scorePercentage >= 80) {
					alreadyPassed = true;
				}
			}
		}

		// If user has already passed with 80%, prevent retaking
		if (alreadyPassed) {
			return json({ 
				error: 'Quiz already passed', 
				message: 'You have already passed this quiz with 80% or higher. No need to retake!',
				bestScore: bestPreviousScore,
				passed: true
			}, { status: 403 });
		}

		// Calculate score
		let correctAnswers = 0;
		const quizResults = [];

		// Process each answer
		for (const answerData of answers) {
			const quiz = quizzes.find(q => q.id === answerData.quizId);
			if (!quiz) continue;

			const isCorrect = answerData.answer === quiz.correctAnswer;
			if (isCorrect) correctAnswers++;

			// Record individual quiz attempt
			await db.quizAttempt.create({
				data: {
					userId: user.id,
					quizId: quiz.id,
					answer: answerData.answer,
					isCorrect: isCorrect,
					score: isCorrect ? quiz.points : 0
				}
			});

			quizResults.push({
				quizId: quiz.id,
				question: quiz.question,
				userAnswer: answerData.answer,
				correctAnswer: quiz.correctAnswer,
				isCorrect: isCorrect,
				explanation: quiz.explanation
			});
		}

		// Calculate percentage score (80% pass threshold)
		const totalQuestions = quizzes.length;
		const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
		const passed = scorePercentage >= 80;
		const newTotalAttempts = totalAttempts + 1;
		const newBestScore = Math.max(bestPreviousScore, scorePercentage);

		// If user passed the quiz, mark the lesson as completed
		if (passed) {
			try {
				// Find or create lesson progress
				let lessonProgress = await db.lessonProgress.findFirst({
					where: {
						userId: user.id,
						lessonId: lessonId
					}
				});

				if (lessonProgress) {
					// Update existing progress to completed
					await db.lessonProgress.update({
						where: { id: lessonProgress.id },
						data: {
							completed: true,
							completedAt: new Date()
						}
					});
				} else {
					// Create new lesson progress as completed
					await db.lessonProgress.create({
						data: {
							userId: user.id,
							lessonId: lessonId,
							completed: true,
							completedAt: new Date(),
							timeSpent: 0
						}
					});
				}

				console.log(`✅ Lesson ${lessonId} marked as completed for user ${user.id} after passing quiz with ${scorePercentage}%`);
				
				// Check if course is now completed and create certificate if needed
				const lesson = await db.lesson.findUnique({
					where: { id: lessonId },
					select: { courseId: true }
				});

				if (lesson) {
					// Get total lessons in course and user's completed lessons
					const totalLessons = await db.lesson.count({
						where: { courseId: lesson.courseId }
					});

					const completedLessons = await db.lessonProgress.count({
						where: {
							userId: user.id,
							completed: true,
							lesson: { courseId: lesson.courseId }
						}
					});

					// If all lessons are completed, check for certificate
					if (completedLessons >= totalLessons) {
						const existingCertificate = await db.certificate.findFirst({
							where: {
								userId: user.id,
								courseId: lesson.courseId
							}
						});

						if (!existingCertificate) {
							await db.certificate.create({
								data: {
									userId: user.id,
									courseId: lesson.courseId,
									score: 100, // Default score for completion
									dateIssued: new Date()
								}
							});
							console.log(`🏆 Certificate created for user ${user.id} completing course ${lesson.courseId}`);
						}
					}
				}
			} catch (error) {
				console.error('Error marking lesson as completed:', error);
				// Don't fail the quiz submission if lesson progress update fails
			}
		}

		return json({
			success: true,
			score: scorePercentage,
			correctAnswers: correctAnswers,
			totalQuestions: totalQuestions,
			passed: passed,
			totalAttempts: newTotalAttempts,
			bestScore: newBestScore,
			results: quizResults,
			lessonCompleted: passed // Add this flag to indicate lesson completion
		});

	} catch (error) {
		console.error('Error submitting lesson quiz:', error);
		return json({ error: 'Failed to submit quiz' }, { status: 500 });
	}
};
