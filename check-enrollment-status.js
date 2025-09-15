import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnrollmentStatus() {
    try {
        console.log('🔍 Checking enrollment status for Basic Business course...\n');

        // Find the Demo Student user
        const demoUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Demo' } },
                    { email: { contains: 'demo' } }
                ]
            }
        });

        if (!demoUser) {
            console.log('❌ Demo user not found!');
            return;
        }

        console.log(`✅ Found Demo User: ${demoUser.name} (${demoUser.email})`);

        // Find the Basic Business course
        const basicBusinessCourse = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            }
        });

        if (!basicBusinessCourse) {
            console.log('❌ Basic Business course not found!');
            return;
        }

        console.log(`✅ Found Basic Business course: ${basicBusinessCourse.id}`);

        // Check if user is enrolled
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId: demoUser.id,
                courseId: basicBusinessCourse.id
            }
        });

        if (enrollment) {
            console.log('✅ User is enrolled in Basic Business course!');
            console.log(`   Enrolled on: ${enrollment.startedAt}`);
            console.log(`   Completed: ${enrollment.completedAt || 'Not completed'}`);
        } else {
            console.log('❌ User is NOT enrolled in Basic Business course!');
            console.log('   This is why the course content is not showing.');
            
            // Enroll the user
            console.log('\n🔧 Enrolling user in Basic Business course...');
            const newEnrollment = await prisma.enrollment.create({
                data: {
                    userId: demoUser.id,
                    courseId: basicBusinessCourse.id,
                    startedAt: new Date()
                }
            });
            console.log('✅ Successfully enrolled user in Basic Business course!');
        }

        // Also check lessons count for verification
        const lessonsCount = await prisma.lesson.count({
            where: {
                courseId: basicBusinessCourse.id,
                isPublished: true
            }
        });
        console.log(`\n📚 Basic Business course has ${lessonsCount} published lessons`);

    } catch (error) {
        console.error('Error checking enrollment:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnrollmentStatus();
