import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Check admin authentication
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const { courseId, lessonId } = params;

	try {
		const quizzes = await db.quiz.findMany({
			where: { 
				lessonId: lessonId,
				lesson: {
					courseId: courseId
				}
			},
			orderBy: { order: 'asc' }
		});

		return json(quizzes);
	} catch (err) {
		console.error('Error fetching quizzes:', err);
		throw error(500, 'Failed to fetch quizzes');
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	// Check admin authentication
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Access denied. Admin role required.');
	}

	const { courseId, lessonId } = params;

	try {
		const body = await request.json();
		const { type, question, options, correctAnswer, explanation, points, order } = body;

		// Validate required fields
		if (!type || !question || !correctAnswer) {
			throw error(400, 'Missing required fields');
		}

		// Validate quiz type
		const validTypes = ['MCQ', 'TRUE_FALSE', 'FILL_IN_BLANK', 'DRAG_DROP', 'AUDIO_MATCH', 'VOICE_MATCH'];
		if (!validTypes.includes(type)) {
			throw error(400, 'Invalid quiz type');
		}

		// Verify lesson belongs to course
		const lesson = await db.lesson.findFirst({
			where: {
				id: lessonId,
				courseId: courseId
			}
		});

		if (!lesson) {
			throw error(404, 'Lesson not found');
		}

		// Create the quiz
		const quiz = await db.quiz.create({
			data: {
				lessonId: lessonId,
				type: type,
				question: question,
				options: options || {},
				correctAnswer: correctAnswer,
				explanation: explanation || null,
				points: points || 10,
				order: order || 1
			}
		});

		return json(quiz, { status: 201 });
	} catch (err) {
		console.error('Error creating quiz:', err);
		if (err.status) {
			throw err;
		}
		throw error(500, 'Failed to create quiz');
	}
};
