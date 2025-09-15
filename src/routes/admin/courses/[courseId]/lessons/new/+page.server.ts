import { db } from '$lib/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, locals }) => {
    if (!locals.user || locals.user.role !== 'ADMIN') {
        throw redirect(302, '/auth/login');
    }

    const course = await db.course.findUnique({
        where: { id: params.courseId },
        select: { 
            id: true, 
            title: true, 
            language: true,
            level: true,
            lessons: {
                select: { order: true },
                orderBy: { order: 'desc' },
                take: 1
            }
        }
    });

    if (!course) {
        throw error(404, 'Course not found');
    }

    // Get the next lesson order number
    const nextOrder = (course.lessons[0]?.order || 0) + 1;

    return {
        course,
        nextOrder
    };
}) satisfies PageServerLoad;

export const actions = {
    create: async ({ request, params, locals }) => {
        if (!locals.user || locals.user.role !== 'ADMIN') {
            throw redirect(302, '/auth/login');
        }

        const data = await request.formData();
        
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const contentHtml = data.get('contentHtml') as string;
        const videoUrl = data.get('videoUrl') as string;
        const audioUrl = data.get('audioUrl') as string;
        const imageUrl = data.get('imageUrl') as string;
        const duration = parseInt(data.get('duration') as string) || null;
        const order = parseInt(data.get('order') as string) || 1;
        const culturalNotes = data.get('culturalNotes') as string;
        const isPublished = data.get('isPublished') === 'on';
        
        // Parse vocabulary JSON if provided
        let vocabulary = null;
        const vocabularyStr = data.get('vocabulary') as string;
        if (vocabularyStr) {
            try {
                vocabulary = JSON.parse(vocabularyStr);
            } catch (e) {
                return fail(400, { error: 'Invalid vocabulary JSON format' });
            }
        }

        // Validate required fields
        if (!title) {
            return fail(400, { error: 'Title is required' });
        }

        try {
            const lesson = await db.lesson.create({
                data: {
                    title,
                    description: description || null,
                    contentHtml: contentHtml || null,
                    videoUrl: videoUrl || null,
                    audioUrl: audioUrl || null,
                    imageUrl: imageUrl || null,
                    duration,
                    order,
                    culturalNotes: culturalNotes || null,
                    isPublished,
                    vocabulary: vocabulary || null,
                    courseId: params.courseId!
                }
            });

            throw redirect(302, `/admin/courses/${params.courseId}/lessons/${lesson.id}/edit`);
        } catch (err) {
            console.error('Error creating lesson:', err);
            return fail(500, { error: 'Failed to create lesson' });
        }
    }
} satisfies Actions;
