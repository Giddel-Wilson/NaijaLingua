import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const courses = await db.course.findMany({
			where: {
				isPublished: true
			},
			include: {
				createdBy: {
					select: {
						name: true
					}
				},
				lessons: {
					where: {
						isPublished: true
					},
					select: {
						id: true
					}
				},
				enrollments: {
					select: {
						userId: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		
		return {
			courses
		};
	} catch (error) {
		console.error('Error loading courses:', error);
		// Return empty array if database is not available or has no data
		return {
			courses: []
		};
	}
};
