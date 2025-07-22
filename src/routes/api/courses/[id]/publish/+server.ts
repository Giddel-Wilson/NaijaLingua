import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const courseId = params.id;
		const { isPublished } = await request.json();

		// Verify course exists and user has permission
		const course = await db.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			return json({ error: 'Course not found' }, { status: 404 });
		}

		// Check if user is the course creator or admin
		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Update course publish status
		const updatedCourse = await db.course.update({
			where: { id: courseId },
			data: { isPublished: Boolean(isPublished) }
		});

		return json(updatedCourse);
	} catch (error) {
		console.error('Course publish error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
