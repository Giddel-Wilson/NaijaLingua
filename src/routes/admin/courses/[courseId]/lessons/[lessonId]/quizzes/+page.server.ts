import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { courseId, lessonId } = params;

	try {
		// Fetch course
		const course = await db.course.findUnique({
			where: { id: courseId },
			select: {
				id: true,
				title: true,
				description: true
			}
		});

		if (!course) {
			throw error(404, 'Course not found');
		}

		// Fetch lesson
		const lesson = await db.lesson.findUnique({
			where: { 
				id: lessonId,
				courseId: courseId 
			},
			select: {
				id: true,
				title: true,
				description: true,
				courseId: true
			}
		});

		if (!lesson) {
			throw error(404, 'Lesson not found');
		}

		// Fetch quizzes for this lesson
		const quizzes = await db.quiz.findMany({
			where: { lessonId: lessonId },
			orderBy: { order: 'asc' },
			select: {
				id: true,
				type: true,
				question: true,
				options: true,
				correctAnswer: true,
				explanation: true,
				points: true,
				order: true,
				createdAt: true,
				updatedAt: true
			}
		});

		return {
			course,
			lesson,
			quizzes
		};
	} catch (err) {
		console.error('Error loading quiz management page:', err);
		if (err.status) {
			throw err; // Re-throw SvelteKit errors (like 404)
		}
		throw error(500, 'Failed to load quiz data');
	}
};
