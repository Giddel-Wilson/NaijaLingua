import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { jwt } from '$lib/auth';
import { db } from '$lib/db';
import { contentGenerator } from '$lib/content-generation';

export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('auth_token');
    if (!token) {
        throw redirect(302, '/auth/login');
    }
    
    try {
        const decoded = jwt.verify(token) as any;
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
            throw redirect(302, '/dashboard');
        }
        
        // Get available languages and topics for content generation
        const supportedLanguages = [
            { code: 'igbo', name: 'Igbo', flag: '🇳🇬' },
            { code: 'yoruba', name: 'Yoruba', flag: '🇳🇬' },
            { code: 'hausa', name: 'Hausa', flag: '🇳🇬' },
            { code: 'swahili', name: 'Swahili', flag: '🇹🇿' },
            { code: 'amharic', name: 'Amharic', flag: '🇪🇹' },
            { code: 'wolof', name: 'Wolof', flag: '🇸🇳' },
            { code: 'akan', name: 'Akan', flag: '🇬🇭' },
            { code: 'zulu', name: 'Zulu', flag: '🇿🇦' }
        ];
        
        const contentTopics = [
            'greetings', 'family', 'food', 'travel', 'business', 
            'education', 'health', 'culture', 'traditions', 'daily_life'
        ];
        
        return {
            user,
            supportedLanguages,
            contentTopics
        };
    } catch (error) {
        throw redirect(302, '/auth/login');
    }
};

export const actions: Actions = {
    createCourse: async ({ request, cookies }) => {
        const token = cookies.get('auth_token');
        if (!token) {
            return fail(401, { error: 'Not authenticated' });
        }
        
        try {
            const decoded = jwt.verify(token) as any;
            const formData = await request.formData();
            
            const title = formData.get('title') as string;
            const description = formData.get('description') as string;
            const language = formData.get('language') as string;
            const level = formData.get('level') as string;
            const category = formData.get('category') as string;
            const price = parseFloat(formData.get('price') as string) || 0;
            const useAIGeneration = formData.get('useAIGeneration') === 'true';
            const contentTopic = formData.get('contentTopic') as string;
            
            if (!title || !language || !level) {
                return fail(400, { error: 'Title, language, and level are required' });
            }
            
            // Create the course
            const course = await db.course.create({
                data: {
                    title,
                    description,
                    language: language.toUpperCase() as any,
                    level: level.toUpperCase() as any,
                    category,
                    price,
                    createdById: decoded.userId,
                    isPublished: false,
                    isApproved: false
                }
            });
            
            // Generate AI content if requested
            if (useAIGeneration && contentTopic) {
                console.log(`Generating AI content for ${language} course: ${title}`);
                
                const contentResult = await contentGenerator.generateCourseContent(
                    language,
                    level,
                    contentTopic
                );
                
                if (contentResult.success && contentResult.lessons.length > 0) {
                    // Create lessons from generated content
                    for (let i = 0; i < contentResult.lessons.length; i++) {
                        const lessonData = contentResult.lessons[i];
                        
                        const lesson = await db.lesson.create({
                            data: {
                                title: lessonData.title,
                                description: lessonData.description,
                                content: JSON.stringify(lessonData.content),
                                orderIndex: i + 1,
                                courseId: course.id
                            }
                        });
                        
                        // Create quizzes from exercises
                        if (lessonData.content.exercises) {
                            for (let j = 0; j < lessonData.content.exercises.length; j++) {
                                const exercise = lessonData.content.exercises[j];
                                
                                await db.quiz.create({
                                    data: {
                                        title: `${lessonData.title} - Exercise ${j + 1}`,
                                        description: exercise.question,
                                        questions: JSON.stringify([exercise]),
                                        lessonId: lesson.id
                                    }
                                });
                            }
                        }
                    }
                    
                    console.log(`Successfully generated ${contentResult.lessons.length} lessons for course: ${title}`);
                }
            }
            
            return {
                success: true,
                courseId: course.id,
                message: useAIGeneration 
                    ? 'Course created with AI-generated content from African language datasets!'
                    : 'Course created successfully!'
            };
            
        } catch (error) {
            console.error('Course creation error:', error);
            return fail(500, { 
                error: error instanceof Error ? error.message : 'Failed to create course' 
            });
        }
    },
    
    generateContent: async ({ request, cookies }) => {
        const token = cookies.get('auth_token');
        if (!token) {
            return fail(401, { error: 'Not authenticated' });
        }
        
        try {
            const formData = await request.formData();
            const language = formData.get('language') as string;
            const level = formData.get('level') as string;
            const topic = formData.get('topic') as string;
            
            if (!language || !level || !topic) {
                return fail(400, { error: 'Language, level, and topic are required' });
            }
            
            const contentResult = await contentGenerator.generateCourseContent(
                language,
                level,
                topic
            );
            
            return {
                success: true,
                content: contentResult,
                message: 'Content generated successfully from African language datasets!'
            };
            
        } catch (error) {
            console.error('Content generation error:', error);
            return fail(500, { 
                error: error instanceof Error ? error.message : 'Failed to generate content' 
            });
        }
    }
};
