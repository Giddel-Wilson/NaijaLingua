import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLessonOrder() {
    try {
        console.log('🔧 Fixing lesson order in Basic Business course...\n');

        // Get all lessons in the Basic Business course ordered by creation date
        const lessons = await prisma.lesson.findMany({
            where: {
                course: {
                    title: 'Basic Business'
                }
            },
            select: {
                id: true,
                title: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'  // Order by creation date to maintain logical sequence
            }
        });

        console.log(`Found ${lessons.length} lessons to reorder:\n`);

        // Update each lesson with the correct order
        for (let i = 0; i < lessons.length; i++) {
            const newOrder = i + 1;
            console.log(`Setting lesson "${lessons[i].title}" to order: ${newOrder}`);
            
            await prisma.lesson.update({
                where: { id: lessons[i].id },
                data: { order: newOrder }
            });
        }

        console.log('\n✅ Lesson order fixed successfully!');
        
        // Verify the fix
        console.log('\n🔍 Verifying the updated order...');
        const updatedLessons = await prisma.lesson.findMany({
            where: {
                course: {
                    title: 'Basic Business'
                }
            },
            select: {
                title: true,
                order: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        updatedLessons.forEach((lesson, index) => {
            console.log(`Order: ${lesson.order} | Title: ${lesson.title}`);
        });

    } catch (error) {
        console.error('Error fixing lesson order:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixLessonOrder();
