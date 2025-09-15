import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllCoursesAndLessons() {
    try {
        console.log('🔍 Checking all courses and their lessons...\n');

        const courses = await prisma.course.findMany({
            include: {
                lessons: {
                    select: {
                        id: true,
                        title: true,
                        isPublished: true,
                        order: true
                    }
                },
                _count: {
                    select: {
                        lessons: true,
                        enrollments: true
                    }
                }
            }
        });

        console.log(`Found ${courses.length} courses:\n`);

        courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.title}`);
            console.log(`   ID: ${course.id}`);
            console.log(`   Published: ${course.isPublished}`);
            console.log(`   Lessons: ${course._count.lessons}`);
            console.log(`   Enrollments: ${course._count.enrollments}`);
            
            if (course.lessons.length > 0) {
                console.log(`   Lesson details:`);
                course.lessons.forEach((lesson, lessonIndex) => {
                    console.log(`     ${lessonIndex + 1}. ${lesson.title} (Published: ${lesson.isPublished}, Order: ${lesson.order})`);
                });
            } else {
                console.log(`   ❌ NO LESSONS!`);
            }
            console.log('');
        });

        // Also check if there are any orphaned lessons
        const allLessons = await prisma.lesson.findMany({
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        console.log(`\n📚 Total lessons in database: ${allLessons.length}`);
        allLessons.forEach((lesson, index) => {
            console.log(`${index + 1}. ${lesson.title} (Course: ${lesson.course.title}, Published: ${lesson.isPublished})`);
        });

    } catch (error) {
        console.error('Error checking courses and lessons:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllCoursesAndLessons();
