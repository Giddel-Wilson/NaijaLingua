import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enhancedContentGenerator } from '$lib/content-generation';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { language, level, topic, courseId, preview } = await request.json();
        
        if (!language || !level || !topic) {
            return json({ error: 'Missing required parameters' }, { status: 400 });
        }
        
        // If this is a preview request, don't require courseId
        if (!preview && !courseId) {
            return json({ error: 'Missing courseId parameter' }, { status: 400 });
        }
        
        console.log(`Generating detailed content for ${preview ? 'preview' : 'course ' + courseId}: ${language} - ${level} - ${topic}`);
        
        const result = await enhancedContentGenerator.generateCourseContent(
            language,
            level,
            topic
        );
        
        // Only save to database if not in preview mode
        if (!preview && result.success && result.lessons && courseId !== 'preview') {
            console.log(`Generated ${result.lessons.length} lessons, saving to database...`);
            
            // Save lessons to database
            for (const lessonData of result.lessons) {
                // Ensure content is a string
                const contentString = typeof lessonData.content === 'string' 
                    ? lessonData.content 
                    : JSON.stringify(lessonData.content);
                
                const lesson = await db.lesson.create({
                    data: {
                        title: lessonData.title || `Lesson ${lessonData.lessonNumber || 1}`,
                        contentHtml: contentString,
                        order: lessonData.lessonNumber || lessonData.order || 1,
                        courseId: courseId,
                        duration: lessonData.estimatedDuration || lessonData.duration || 15,
                        isPublished: false
                    }
                });

                console.log(`✅ Created lesson: ${lesson.title} (ID: ${lesson.id})`);

                // Save vocabulary items to the general vocabulary table
                if (lessonData.vocabulary && lessonData.vocabulary.length > 0) {
                    console.log(`📝 Saving ${lessonData.vocabulary.length} vocabulary items`);
                    for (const vocabItem of lessonData.vocabulary) {
                        try {
                            await db.vocabulary.create({
                                data: {
                                    language: language.toUpperCase() as any,
                                    word: vocabItem.word || vocabItem.igbo || 'Unknown',
                                    translation: vocabItem.translation || vocabItem.english || 'No translation',
                                    pronunciation: vocabItem.pronunciation || '',
                                    audioUrl: vocabItem.audioUrl || '',
                                    category: topic,
                                    source: 'AI_GENERATED'
                                }
                            });
                        } catch (vocabError) {
                            // Skip if vocabulary already exists (unique constraint)
                            console.log(`Skipped duplicate vocabulary: ${vocabItem.word}`);
                        }
                    }
                    console.log(`✅ Saved vocabulary for lesson: ${lesson.title}`);
                }

                // Save cultural content if it exists
                if (lessonData.culturalContent) {
                    try {
                        await db.culturalContent.create({
                            data: {
                                language: language.toUpperCase() as any,
                                topic: topic,
                                title: lessonData.culturalContent.title || `Cultural Notes for ${topic}`,
                                content: lessonData.culturalContent.content,
                                source: 'AI_GENERATED'
                            }
                        });
                    } catch (culturalError) {
                        console.log(`Cultural content creation skipped:`, culturalError);
                    }
                }

                // Save quiz questions as individual quiz entries if they exist
                if (lessonData.quiz && lessonData.quiz.questions && lessonData.quiz.questions.length > 0) {
                    console.log(`📝 Saving ${lessonData.quiz.questions.length} quiz questions for lesson ${lesson.id}`);
                    for (let i = 0; i < lessonData.quiz.questions.length; i++) {
                        const quizQuestion = lessonData.quiz.questions[i];
                        await db.quiz.create({
                            data: {
                                lessonId: lesson.id,
                                type: 'MCQ',
                                question: quizQuestion.question || `Question ${i + 1}`,
                                options: quizQuestion.options || [],
                                correctAnswer: quizQuestion.correctAnswer || '',
                                explanation: quizQuestion.explanation || '',
                                order: i + 1,
                                points: 10
                            }
                        });
                    }
                    console.log(`✅ Saved ${lessonData.quiz.questions.length} quiz questions`);
                }
            }
            
            console.log(`Successfully saved ${result.lessons.length} lessons to database for course ${courseId}`);
        } else if (preview) {
            console.log(`Generated ${result.lessons?.length || 0} lessons for preview (not saved to database)`);
        }
        
        return json(result);
        
    } catch (error) {
        console.error('Content generation API error:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to generate content' 
        }, { status: 500 });
    }
};
