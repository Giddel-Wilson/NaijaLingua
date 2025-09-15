import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function generateLessonsForCourse() {
    try {
        // Find the "Basic Travel" course
        const course = await db.course.findFirst({
            where: { title: 'Basic Travel' }
        });
        
        if (!course) {
            console.log('❌ Course not found');
            return;
        }
        
        console.log('📚 Found course:', course.title, 'ID:', course.id);
        
        // Check if it already has lessons
        const existingLessons = await db.lesson.count({
            where: { courseId: course.id }
        });
        
        console.log('📖 Existing lessons:', existingLessons);
        
        if (existingLessons === 0) {
            console.log('🚀 Generating AI content for course...');
            
            // Manually create some basic lessons
            const lessons = [
                {
                    title: 'Ije na Njem - Travel and Journeys',
                    content: 'Learn essential travel vocabulary and phrases in Igbo. This lesson introduces basic concepts of journeys, transportation, and travel-related conversations.',
                    lessonNumber: 1
                },
                {
                    title: 'Ụgbọ na Ije - Vehicles and Transportation',
                    content: 'Explore different types of vehicles and transportation methods. Learn how to talk about cars, buses, trains, and other means of travel in Igbo.',
                    lessonNumber: 2
                },
                {
                    title: 'Ebe na Okporo Ụzọ - Places and Roads',
                    content: 'Master vocabulary for places, destinations, and roads. Learn to give and receive directions, and describe different locations.',
                    lessonNumber: 3
                }
            ];
            
            for (const lessonData of lessons) {
                const lesson = await db.lesson.create({
                    data: {
                        title: lessonData.title,
                        contentHtml: lessonData.content,
                        order: lessonData.lessonNumber,
                        courseId: course.id,
                        duration: 15,
                        isPublished: false
                    }
                });
                
                console.log(`✅ Created lesson: ${lesson.title}`);
                
                // Add some vocabulary
                const travelVocab = [
                    { word: 'ije', translation: 'journey/travel', pronunciation: 'i-je' },
                    { word: 'ụgbọ', translation: 'vehicle', pronunciation: 'u-gbo' },
                    { word: 'okporo ụzọ', translation: 'road', pronunciation: 'o-kpo-ro u-zo' },
                    { word: 'ebe', translation: 'place', pronunciation: 'e-be' },
                    { word: 'ọdụ ụgbọ', translation: 'bus stop', pronunciation: 'o-du u-gbo' }
                ];
                
                for (const vocab of travelVocab) {
                    await db.vocabulary.create({
                        data: {
                            language: 'IGBO',
                            word: vocab.word,
                            translation: vocab.translation,
                            pronunciation: vocab.pronunciation,
                            audioUrl: '',
                            category: 'travel',
                            source: 'MANUAL_GENERATED'
                        }
                    });
                }
                
                console.log(`📝 Added ${travelVocab.length} vocabulary items to ${lesson.title}`);
            }
            
            console.log('🎉 Successfully generated lessons for the course!');
        } else {
            console.log('ℹ️ Course already has lessons');
        }
        
        // Check final results
        const finalLessons = await db.lesson.findMany({
            where: { courseId: course.id },
            include: {
                quizzes: true
            }
        });
        
        // Get vocabulary count for this topic/language
        const vocabularyCount = await db.vocabulary.count({
            where: {
                language: 'IGBO',
                category: 'travel'
            }
        });
        
        console.log(`\n📊 Final result: ${finalLessons.length} lessons:`);
        finalLessons.forEach((lesson, idx) => {
            console.log(`  ${lesson.order}. ${lesson.title} - ${lesson.quizzes.length} quizzes`);
        });
        console.log(`📚 Total travel vocabulary in database: ${vocabularyCount} items`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.$disconnect();
    }
}

generateLessonsForCourse();
