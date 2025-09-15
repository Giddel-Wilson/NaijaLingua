import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Please log in first to enroll in courses' }, { status: 401 });
	}

	try {
		const { courseId } = await request.json();

		if (!courseId) {
			return json({ error: 'Course ID is required' }, { status: 400 });
		}

		// Check if course exists
		const course = await db.course.findUnique({
			where: { id: courseId },
			select: { id: true, title: true, isPublished: true }
		});

		if (!course || !course.isPublished) {
			return json({ error: 'Course not found or not published' }, { status: 404 });
		}

		// Check if already enrolled
		const existingEnrollment = await db.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId: user.id,
					courseId: courseId
				}
			}
		});

		if (existingEnrollment) {
			return json({ error: 'Already enrolled in this course' }, { status: 400 });
		}

		// Create enrollment
		const enrollment = await db.enrollment.create({
			data: {
				userId: user.id,
				courseId: courseId,
				progress: 0
			},
			include: {
				course: {
					select: {
						title: true
					}
				}
			}
		});

		return json({ 
			success: true, 
			message: `Successfully enrolled in ${enrollment.course.title}!`,
			enrollment 
		});

	} catch (error) {
		console.error('Enrollment error:', error);
		return json({ error: 'Failed to enroll in course' }, { status: 500 });
	}
};
