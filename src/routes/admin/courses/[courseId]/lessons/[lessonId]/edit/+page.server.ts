import { db } from '$lib/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params }) => {
    const lesson = await db.lesson.findUnique({
        where: { id: params.lessonId },
        include: {
            course: {
                select: { id: true, title: true, language: true }
            },
            quizzes: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!lesson) {
        throw error(404, 'Lesson not found');
    }

    return {
        lesson
    };
}) satisfies PageServerLoad;

export const actions = {
    updateLesson: async ({ request, params }) => {
        const data = await request.formData();
        
        const title = data.get('title') as string;
        const description = data.get('description') as string;
        const contentHtml = data.get('contentHtml') as string;
        const videoUrl = data.get('videoUrl') as string;
        const audioUrl = data.get('audioUrl') as string;
        const imageUrl = data.get('imageUrl') as string;
        const duration = parseInt(data.get('duration') as string) || null;
        const culturalNotes = data.get('culturalNotes') as string;
        const isPublished = data.get('isPublished') === 'on';
        
        // Parse vocabulary JSON
        let vocabulary = null;
        const vocabularyStr = data.get('vocabulary') as string;
        if (vocabularyStr) {
            try {
                vocabulary = JSON.parse(vocabularyStr);
            } catch (e) {
                return fail(400, { error: 'Invalid vocabulary JSON format' });
            }
        }

        try {
            await db.lesson.update({
                where: { id: params.lessonId },
                data: {
                    title,
                    description: description || null,
                    contentHtml: contentHtml || null,
                    videoUrl: videoUrl || null,
                    audioUrl: audioUrl || null,
                    imageUrl: imageUrl || null,
                    duration,
                    culturalNotes: culturalNotes || null,
                    vocabulary,
                    isPublished
                }
            });

            return { success: true };
        } catch (e) {
            console.error('Update lesson error:', e);
            return fail(500, { error: 'Failed to update lesson' });
        }
    },

    addVocabulary: async ({ request, params }) => {
        const data = await request.formData();
        
        const igbo = data.get('igbo') as string;
        const english = data.get('english') as string;
        const pronunciation = data.get('pronunciation') as string;
        const partOfSpeech = data.get('partOfSpeech') as string;
        const difficulty = data.get('difficulty') as string;
        const topic = data.get('topic') as string;

        if (!igbo || !english) {
            return fail(400, { error: 'Igbo and English translations are required' });
        }

        try {
            const lesson = await db.lesson.findUnique({
                where: { id: params.lessonId },
                select: { vocabulary: true }
            });

            if (!lesson) {
                return fail(404, { error: 'Lesson not found' });
            }

            const currentVocab = (lesson.vocabulary as any) || [];
            const newId = Math.max(0, ...currentVocab.map((v: any) => v.id || 0)) + 1;

            const newVocabItem = {
                id: newId,
                igbo,
                english,
                pronunciation: pronunciation || null,
                partOfSpeech: partOfSpeech || 'noun',
                difficulty: difficulty || 'beginner',
                topic: topic || 'general'
            };

            const updatedVocab = [...currentVocab, newVocabItem];

            await db.lesson.update({
                where: { id: params.lessonId },
                data: {
                    vocabulary: updatedVocab
                }
            });

            return { success: true, added: newVocabItem };
        } catch (e) {
            console.error('Add vocabulary error:', e);
            return fail(500, { error: 'Failed to add vocabulary' });
        }
    },

    updateVocabulary: async ({ request, params }) => {
        const data = await request.formData();
        
        const vocabId = parseInt(data.get('vocabId') as string);
        const igbo = data.get('igbo') as string;
        const english = data.get('english') as string;
        const pronunciation = data.get('pronunciation') as string;
        const partOfSpeech = data.get('partOfSpeech') as string;
        const difficulty = data.get('difficulty') as string;
        const topic = data.get('topic') as string;

        try {
            const lesson = await db.lesson.findUnique({
                where: { id: params.lessonId },
                select: { vocabulary: true }
            });

            if (!lesson) {
                return fail(404, { error: 'Lesson not found' });
            }

            const currentVocab = (lesson.vocabulary as any) || [];
            const updatedVocab = currentVocab.map((item: any) => {
                if (item.id === vocabId) {
                    return {
                        ...item,
                        igbo,
                        english,
                        pronunciation: pronunciation || null,
                        partOfSpeech: partOfSpeech || 'noun',
                        difficulty: difficulty || 'beginner',
                        topic: topic || 'general'
                    };
                }
                return item;
            });

            await db.lesson.update({
                where: { id: params.lessonId },
                data: {
                    vocabulary: updatedVocab
                }
            });

            return { success: true };
        } catch (e) {
            console.error('Update vocabulary error:', e);
            return fail(500, { error: 'Failed to update vocabulary' });
        }
    },

    deleteVocabulary: async ({ request, params }) => {
        const data = await request.formData();
        const vocabId = parseInt(data.get('vocabId') as string);

        try {
            const lesson = await db.lesson.findUnique({
                where: { id: params.lessonId },
                select: { vocabulary: true }
            });

            if (!lesson) {
                return fail(404, { error: 'Lesson not found' });
            }

            const currentVocab = (lesson.vocabulary as any) || [];
            const updatedVocab = currentVocab.filter((item: any) => item.id !== vocabId);

            await db.lesson.update({
                where: { id: params.lessonId },
                data: {
                    vocabulary: updatedVocab
                }
            });

            return { success: true };
        } catch (e) {
            console.error('Delete vocabulary error:', e);
            return fail(500, { error: 'Failed to delete vocabulary' });
        }
    },

    addQuiz: async ({ request, params }) => {
        const data = await request.formData();
        
        const type = data.get('type') as string;
        const question = data.get('question') as string;
        const optionsStr = data.get('options') as string;
        const correctAnswer = data.get('correctAnswer') as string;
        const explanation = data.get('explanation') as string;

        if (!question || !correctAnswer) {
            return fail(400, { error: 'Question and correct answer are required' });
        }

        let options;
        try {
            options = JSON.parse(optionsStr);
        } catch (e) {
            return fail(400, { error: 'Invalid options JSON format' });
        }

        try {
            await db.quiz.create({
                data: {
                    lessonId: params.lessonId,
                    type: type as any,
                    question,
                    options,
                    correctAnswer,
                    explanation: explanation || null
                }
            });

            return { success: true };
        } catch (e) {
            console.error('Add quiz error:', e);
            return fail(500, { error: 'Failed to add quiz' });
        }
    },

    deleteQuiz: async ({ request, params }) => {
        const data = await request.formData();
        const quizId = data.get('quizId') as string;

        try {
            await db.quiz.delete({
                where: { id: quizId }
            });

            return { success: true };
        } catch (e) {
            console.error('Delete quiz error:', e);
            return fail(500, { error: 'Failed to delete quiz' });
        }
    }
} satisfies Actions;
