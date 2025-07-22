import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const lessonId = params.lessonId;

		const quizzes = await db.quiz.findMany({
			where: { lessonId },
			orderBy: { order: 'asc' }
		});

		// Verify user has access to this lesson
		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						id: true,
						createdById: true,
						isPublished: true
					}
				}
			}
		});

		if (!lesson) {
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check permissions
		const isCreator = lesson.course.createdById === user.id;
		const isAdmin = user.role === 'ADMIN';
		
		let isEnrolled = false;
		if (!isCreator && !isAdmin) {
			const enrollment = await db.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: lesson.course.id
					}
				}
			});
			isEnrolled = Boolean(enrollment);
		}

		if (!isCreator && !isAdmin && !isEnrolled && !lesson.course.isPublished) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		return json(quizzes);
	} catch (error) {
		console.error('Quizzes fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const lessonId = params.lessonId;
		const quizData = await request.json();

		// Verify lesson exists and user has permission
		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						id: true,
						createdById: true
					}
				}
			}
		});

		if (!lesson) {
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (lesson.course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Validate quiz data
		const { type, question, options, correctAnswer, explanation, points, order } = quizData;

		if (!type || !question?.trim()) {
			return json({ error: 'Quiz type and question are required' }, { status: 400 });
		}

		if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'DRAG_DROP', 'AUDIO_MATCH'].includes(type)) {
			return json({ error: 'Invalid quiz type' }, { status: 400 });
		}

		if (!correctAnswer?.trim()) {
			return json({ error: 'Correct answer is required' }, { status: 400 });
		}

		// Create quiz
		const quiz = await db.quiz.create({
			data: {
				lessonId,
				type,
				question: question.trim(),
				options: options || {},
				correctAnswer: correctAnswer.trim(),
				explanation: explanation?.trim() || null,
				points: points || 10,
				order: order || 1
			}
		});

		return json(quiz);
	} catch (error) {
		console.error('Quiz creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
