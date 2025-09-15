import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { answer } = await request.json();
		const quizId = params.quizId;

		// Get the quiz
		const quiz = await db.quiz.findUnique({
			where: { id: quizId }
		});

		if (!quiz) {
			return json({ error: 'Quiz not found' }, { status: 404 });
		}

		// Check if answer is correct
		const isCorrect = answer === quiz.correctAnswer;

		// Record the quiz attempt
		await db.quizAttempt.create({
			data: {
				userId: user.id,
				quizId: quizId,
				answer: answer,
				isCorrect: isCorrect
			}
		});

		return json({
			correct: isCorrect,
			correctAnswer: quiz.correctAnswer,
			explanation: quiz.explanation
		});

	} catch (error) {
		console.error('Error submitting quiz:', error);
		return json({ error: 'Failed to submit quiz' }, { status: 500 });
	}
};
