import { db } from '$lib/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const lessonId = params.id;
	const { timeSpent } = await request.json();

	try {
		// Update lesson progress
		await db.lessonProgress.updateMany({
			where: {
				userId: user.id,
				lessonId: lessonId
			},
			data: {
				timeSpent: {
					increment: timeSpent
				}
			}
		});

		return json({ success: true });
	} catch (err) {
		console.error('Error updating lesson progress:', err);
		throw error(500, 'Failed to update progress');
	}
};
