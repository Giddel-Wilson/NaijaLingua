import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBasicBusinessLessonsPublished() {
    try {
        console.log('🔧 Checking and fixing lesson publication status...\n');

        // Find Basic Business course
        const course = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            }
        });

        if (!course) {
            console.log('❌ Basic Business course not found!');
            return;
        }

        // Get all lessons for this course
        const lessons = await prisma.lesson.findMany({
            where: {
                courseId: course.id
            },
            select: {
                id: true,
                title: true,
                isPublished: true,
                order: true
            },
            orderBy: {
                order: 'asc'
            }
        });

        console.log(`Found ${lessons.length} lessons for Basic Business:`);
        lessons.forEach((lesson, index) => {
            console.log(`  ${index + 1}. ${lesson.title} - Published: ${lesson.isPublished ? '✅' : '❌'}`);
        });

        // Count unpublished lessons
        const unpublishedLessons = lessons.filter(l => !l.isPublished);
        console.log(`\n📊 Summary:`);
        console.log(`Total lessons: ${lessons.length}`);
        console.log(`Published: ${lessons.length - unpublishedLessons.length}`);
        console.log(`Unpublished: ${unpublishedLessons.length}`);

        if (unpublishedLessons.length > 0) {
            console.log(`\n🔧 Publishing all ${unpublishedLessons.length} unpublished lessons...`);
            
            const result = await prisma.lesson.updateMany({
                where: {
                    courseId: course.id,
                    isPublished: false
                },
                data: {
                    isPublished: true
                }
            });

            console.log(`✅ Published ${result.count} lessons!`);
        } else {
            console.log('\n✅ All lessons are already published!');
        }

        // Verify the fix
        const publishedCount = await prisma.lesson.count({
            where: {
                courseId: course.id,
                isPublished: true
            }
        });

        console.log(`\n🎉 Basic Business course now has ${publishedCount} published lessons!`);

    } catch (error) {
        console.error('Error fixing lesson publication:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixBasicBusinessLessonsPublished();
