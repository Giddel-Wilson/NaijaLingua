import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Check admin authentication
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const { courseId, lessonId, quizId } = params;

	try {
		// Verify quiz exists and belongs to the lesson/course
		const quiz = await db.quiz.findFirst({
			where: {
				id: quizId,
				lessonId: lessonId,
				lesson: {
					courseId: courseId
				}
			}
		});

		if (!quiz) {
			throw error(404, 'Quiz not found');
		}

		// Delete the quiz
		await db.quiz.delete({
			where: { id: quizId }
		});

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting quiz:', err);
		if (err.status) {
			throw err;
		}
		throw error(500, 'Failed to delete quiz');
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	// Check admin authentication
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const { courseId, lessonId, quizId } = params;

	try {
		const body = await request.json();
		const { type, question, options, correctAnswer, explanation, points, order } = body;

		// Verify quiz exists and belongs to the lesson/course
		const existingQuiz = await db.quiz.findFirst({
			where: {
				id: quizId,
				lessonId: lessonId,
				lesson: {
					courseId: courseId
				}
			}
		});

		if (!existingQuiz) {
			throw error(404, 'Quiz not found');
		}

		// Update the quiz
		const quiz = await db.quiz.update({
			where: { id: quizId },
			data: {
				type: type || existingQuiz.type,
				question: question || existingQuiz.question,
				options: options !== undefined ? options : existingQuiz.options,
				correctAnswer: correctAnswer || existingQuiz.correctAnswer,
				explanation: explanation !== undefined ? explanation : existingQuiz.explanation,
				points: points !== undefined ? points : existingQuiz.points,
				order: order !== undefined ? order : existingQuiz.order
			}
		});

		return json(quiz);
	} catch (err) {
		console.error('Error updating quiz:', err);
		if (err.status) {
			throw err;
		}
		throw error(500, 'Failed to update quiz');
	}
};
