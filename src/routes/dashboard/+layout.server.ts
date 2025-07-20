import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}
	
	// Get user's enrollments and progress
	const enrollments = await db.enrollment.findMany({
		where: {
			userId: locals.user.id
		},
		include: {
			course: {
				include: {
					lessons: {
						where: {
							isPublished: true
						},
						select: {
							id: true
						}
					}
				}
			}
		}
	});
	
	// Get user's certificates
	const certificates = await db.certificate.findMany({
		where: {
			userId: locals.user.id
		},
		include: {
			course: {
				select: {
					title: true,
					language: true
				}
			}
		},
		orderBy: {
			dateIssued: 'desc'
		}
	});
	
	return {
		user: locals.user,
		enrollments,
		certificates
	};
};
