import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLessonContent() {
    try {
        console.log('🔍 Checking actual lesson content in Basic Business course...\n');

        const lessons = await prisma.lesson.findMany({
            where: {
                course: {
                    title: 'Basic Business'
                },
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                description: true,
                content: true,
                order: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        console.log(`Found ${lessons.length} published lessons:\n`);

        lessons.forEach((lesson, index) => {
            console.log(`${index + 1}. ${lesson.title}`);
            console.log(`   Description: ${lesson.description}`);
            console.log(`   Content length: ${lesson.content ? lesson.content.length : 0} characters`);
            if (lesson.content) {
                console.log(`   Content preview: ${lesson.content.substring(0, 200)}...`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('Error checking lesson content:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLessonContent();
