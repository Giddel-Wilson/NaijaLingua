import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLessonOrder() {
    try {
        console.log('🔍 Checking lesson order in Basic Business course...\n');

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
                contentHtml: true,
                order: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        console.log(`Found ${lessons.length} published lessons:\n`);

        lessons.forEach((lesson, index) => {
            console.log(`Order: ${lesson.order} | Session: ${index + 1} | Title: ${lesson.title}`);
            console.log(`   Description: ${lesson.description}`);
            console.log(`   Has content: ${lesson.contentHtml ? 'Yes' : 'No'}`);
            console.log('');
        });

        // Check if there are any gaps in the order
        const orders = lessons.map(l => l.order).sort((a, b) => a - b);
        console.log('Order sequence:', orders.join(', '));
        
        // Check for gaps
        for (let i = 0; i < orders.length - 1; i++) {
            if (orders[i + 1] - orders[i] > 1) {
                console.log(`⚠️  Gap detected between order ${orders[i]} and ${orders[i + 1]}`);
            }
        }

    } catch (error) {
        console.error('Error checking lesson order:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLessonOrder();
