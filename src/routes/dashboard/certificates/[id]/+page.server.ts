import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'User not authenticated');
	}

	try {
		// Get certificate with course and user details
		const certificate = await db.certificate.findFirst({
			where: { 
				id: params.id,
				userId: user.id // Ensure user can only view their own certificates
			},
			include: {
				course: {
					include: {
						createdBy: {
							select: {
								name: true
							}
						}
					}
				},
				user: {
					select: {
						name: true,
						email: true
					}
				}
			}
		});

		if (!certificate) {
			throw error(404, 'Certificate not found or access denied');
		}

		return {
			certificate
		};
	} catch (err) {
		console.error('Error loading certificate:', err);
		throw error(500, 'Failed to load certificate');
	}
};