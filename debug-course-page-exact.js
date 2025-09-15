import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCoursePageLoad() {
    try {
        console.log('🔍 Debugging exactly what the course page sees...\n');

        // Find Demo Student
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Demo' } },
                    { email: { contains: 'demo' } }
                ]
            }
        });

        // Find Basic Business course
        const basicBusinessCourse = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            }
        });

        const courseId = basicBusinessCourse.id;
        const userId = user.id;

        console.log(`User ID: ${userId}`);
        console.log(`Course ID: ${courseId}`);

        // Simulate EXACTLY what the course page does
        console.log('\n📋 Simulating course page load logic...\n');

        // Step 1: Check enrollment (exactly like the page does)
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId: userId,
                courseId: courseId
            },
            include: {
                course: {
                    include: {
                        lessons: {
                            where: {
                                isPublished: true
                            },
                            orderBy: {
                                order: 'asc'
                            },
                            include: {
                                quizzes: {
                                    include: {
                                        questions: true
                                    }
                                }
                            }
                        },
                        createdBy: {
                            select: {
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                lessons: true,
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        if (!enrollment) {
            console.log('❌ No enrollment found! This would cause 404 error.');
            return;
        }

        console.log('✅ Enrollment found!');
        console.log(`Course title: ${enrollment.course.title}`);
        console.log(`Total lessons in course: ${enrollment.course._count.lessons}`);
        console.log(`Published lessons loaded: ${enrollment.course.lessons.length}`);
        console.log(`Created by: ${enrollment.course.createdBy.name}`);

        if (enrollment.course.lessons.length === 0) {
            console.log('\n❌ PROBLEM FOUND: No published lessons are being loaded!');
            console.log('This is why the course shows "still being prepared"');
            
            // Let's check what lessons exist for this course
            console.log('\n🔍 Checking all lessons for this course:');
            const allLessons = await prisma.lesson.findMany({
                where: {
                    courseId: courseId
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

            console.log(`Found ${allLessons.length} total lessons:`);
            allLessons.forEach((lesson, index) => {
                console.log(`  ${index + 1}. ${lesson.title} (Published: ${lesson.isPublished}, Order: ${lesson.order})`);
            });

            const publishedCount = allLessons.filter(l => l.isPublished).length;
            console.log(`\nPublished lessons: ${publishedCount}`);
            console.log(`Unpublished lessons: ${allLessons.length - publishedCount}`);

        } else {
            console.log('\n✅ Lessons are being loaded correctly:');
            enrollment.course.lessons.forEach((lesson, index) => {
                console.log(`  ${index + 1}. ${lesson.title}`);
            });
        }

    } catch (error) {
        console.error('Error debugging course page:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugCoursePageLoad();
