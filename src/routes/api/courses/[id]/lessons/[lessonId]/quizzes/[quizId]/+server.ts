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

		const quizId = params.quizId;

		const quiz = await db.quiz.findUnique({
			where: { id: quizId },
			include: {
				lesson: {
					include: {
						course: {
							select: {
								id: true,
								createdById: true,
								isPublished: true
							}
						}
					}
				}
			}
		});

		if (!quiz) {
			return json({ error: 'Quiz not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check permissions
		const isCreator = quiz.lesson.course.createdById === user.id;
		const isAdmin = user.role === 'ADMIN';
		
		let isEnrolled = false;
		if (!isCreator && !isAdmin) {
			const enrollment = await db.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: quiz.lesson.course.id
					}
				}
			});
			isEnrolled = Boolean(enrollment);
		}

		if (!isCreator && !isAdmin && !isEnrolled && !quiz.lesson.course.isPublished) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		return json({
			...quiz,
			canEdit: isCreator || isAdmin
		});
	} catch (error) {
		console.error('Quiz fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const quizId = params.quizId;
		const updateData = await request.json();

		// Verify quiz exists
		const quiz = await db.quiz.findUnique({
			where: { id: quizId },
			include: {
				lesson: {
					include: {
						course: {
							select: {
								id: true,
								createdById: true
							}
						}
					}
				}
			}
		});

		if (!quiz) {
			return json({ error: 'Quiz not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (quiz.lesson.course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Validate update data
		const { type, question, options, correctAnswer, explanation, points, order } = updateData;

		if (question && !question.trim()) {
			return json({ error: 'Question cannot be empty' }, { status: 400 });
		}

		if (type && !['MULTIPLE_CHOICE', 'TRUE_FALSE', 'DRAG_DROP', 'AUDIO_MATCH'].includes(type)) {
			return json({ error: 'Invalid quiz type' }, { status: 400 });
		}

		if (correctAnswer && !correctAnswer.trim()) {
			return json({ error: 'Correct answer cannot be empty' }, { status: 400 });
		}

		// Update quiz
		const updatedQuiz = await db.quiz.update({
			where: { id: quizId },
			data: {
				type: type || quiz.type,
				question: question?.trim() || quiz.question,
				options: options !== undefined ? options : quiz.options,
				correctAnswer: correctAnswer?.trim() || quiz.correctAnswer,
				explanation: explanation !== undefined ? (explanation?.trim() || null) : quiz.explanation,
				points: points !== undefined ? points : quiz.points,
				order: order !== undefined ? order : quiz.order
			}
		});

		return json(updatedQuiz);
	} catch (error) {
		console.error('Quiz update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const quizId = params.quizId;

		// Verify quiz exists
		const quiz = await db.quiz.findUnique({
			where: { id: quizId },
			include: {
				lesson: {
					include: {
						course: {
							select: {
								id: true,
								createdById: true
							}
						}
					}
				}
			}
		});

		if (!quiz) {
			return json({ error: 'Quiz not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (quiz.lesson.course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Delete quiz
		await db.quiz.delete({
			where: { id: quizId }
		});

		return json({ message: 'Quiz deleted successfully' });
	} catch (error) {
		console.error('Quiz deletion error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
