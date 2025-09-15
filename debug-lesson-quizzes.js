import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLessonQuizzes() {
    try {
        console.log('🔍 Checking quizzes in Basic Business course lessons...\n');

        const lessons = await prisma.lesson.findMany({
            where: {
                course: {
                    title: 'Basic Business'
                }
            },
            include: {
                quizzes: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        console.log(`Found ${lessons.length} lessons in Basic Business course:\n`);

        lessons.forEach((lesson, index) => {
            console.log(`Lesson ${lesson.order}: ${lesson.title}`);
            console.log(`   Published: ${lesson.isPublished}`);
            console.log(`   Quizzes: ${lesson.quizzes.length}`);
            
            if (lesson.quizzes.length > 0) {
                lesson.quizzes.forEach((quiz, qIndex) => {
                    console.log(`     Quiz ${qIndex + 1}: ${quiz.type} - ${quiz.question}`);
                });
            }
            console.log('');
        });

        // Summary
        const lessonsWithQuizzes = lessons.filter(l => l.quizzes.length > 0);
        console.log(`📊 Summary:`);
        console.log(`   Total lessons: ${lessons.length}`);
        console.log(`   Lessons with quizzes: ${lessonsWithQuizzes.length}`);
        console.log(`   Lessons without quizzes: ${lessons.length - lessonsWithQuizzes.length}`);

    } catch (error) {
        console.error('Error checking lesson quizzes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLessonQuizzes();
