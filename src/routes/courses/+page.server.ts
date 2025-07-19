import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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
};
