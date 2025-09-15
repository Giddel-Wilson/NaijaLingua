import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const course = await db.course.findUnique({
        where: { id: params.courseId },
        include: {
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    quizzes: true,
                    _count: {
                        select: { progress: true }
                    }
                }
            },
            createdBy: {
                select: { name: true, email: true }
            },
            _count: {
                select: { enrollments: true }
            }
        }
    });

    if (!course) {
        throw error(404, 'Course not found');
    }

    return {
        course
    };
}) satisfies PageServerLoad;
