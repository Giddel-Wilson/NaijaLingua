import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugBasicBusinessCourse() {
    try {
        console.log('🔍 Debugging Basic Business course...\n');

        // Find the Basic Business course
        const course = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            },
            include: {
                lessons: {
                    include: {
                        quizzes: true
                    }
                },
                enrollments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!course) {
            console.log('❌ No Basic Business course found!');
            return;
        }

        console.log('✅ Found Basic Business course:');
        console.log(`ID: ${course.id}`);
        console.log(`Title: ${course.title}`);
        console.log(`Description: ${course.description}`);
        console.log(`Language: ${course.language}`);
        console.log(`Level: ${course.level}`);
        console.log(`Created by: ${course.createdBy.name} (${course.createdBy.email})`);
        console.log(`Created at: ${course.createdAt}`);
        console.log(`Is Published: ${course.isPublished}`);
        console.log(`\n📚 Lessons (${course.lessons.length}):`);

        if (course.lessons.length === 0) {
            console.log('❌ NO LESSONS FOUND - This is the problem!');
        } else {
            course.lessons.forEach((lesson, index) => {
                console.log(`  ${index + 1}. ${lesson.title}`);
                console.log(`     - ID: ${lesson.id}`);
                console.log(`     - Published: ${lesson.isPublished}`);
                console.log(`     - Order: ${lesson.order}`);
                console.log(`     - Content: ${lesson.content ? 'Yes' : 'No'}`);
                console.log(`     - Quizzes: ${lesson.quizzes.length}`);
                console.log('');
            });
        }

        console.log(`\n👥 Enrollments (${course.enrollments.length}):`);
        course.enrollments.forEach((enrollment, index) => {
            console.log(`  ${index + 1}. ${enrollment.user.name} (${enrollment.user.email})`);
            console.log(`     - Enrolled: ${enrollment.startedAt}`);
            console.log(`     - Completed: ${enrollment.completedAt || 'Not completed'}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error debugging Basic Business course:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugBasicBusinessCourse();
