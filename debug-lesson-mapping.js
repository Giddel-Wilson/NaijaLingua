import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugLessonMapping() {
    try {
        console.log('🔍 Debugging lesson mapping for Basic Business course...\n');
        
        // Get the course
        const course = await prisma.course.findFirst({
            where: { title: 'Basic Business' },
            include: {
                lessons: {
                    where: {
                        isPublished: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
        
        if (!course) {
            console.log('❌ Basic Business course not found');
            return;
        }
        
        console.log(`Course: ${course.title} (ID: ${course.id})`);
        console.log(`Total lessons: ${course.lessons.length}\n`);
        
        console.log('Lesson array order (as returned by database):');
        course.lessons.forEach((lesson, index) => {
            const sessionNumber = index + 1;
            console.log(`Array[${index}] → Session ${sessionNumber}: "${lesson.title}" (Order: ${lesson.order}, ID: ${lesson.id})`);
        });
        
        console.log('\nMapping verification:');
        for (let session = 1; session <= course.lessons.length; session++) {
            const currentLesson = course.lessons[session - 1]; // This is what the server code does
            console.log(`Session ${session} should show: "${currentLesson?.title || 'NULL'}" (Order: ${currentLesson?.order || 'NULL'})`);
            
            // Check if this matches what we expect
            const expectedLesson = course.lessons.find(l => l.order === session);
            if (expectedLesson && expectedLesson.id !== currentLesson?.id) {
                console.log(`  ❌ MISMATCH! Expected "${expectedLesson.title}" but got "${currentLesson?.title}"`);
            } else if (expectedLesson) {
                console.log(`  ✅ Correct mapping`);
            }
        }
        
        console.log('\nChecking if lessons are properly ordered by order field:');
        let properlyOrdered = true;
        for (let i = 0; i < course.lessons.length; i++) {
            const expectedOrder = i + 1;
            const actualOrder = course.lessons[i].order;
            if (actualOrder !== expectedOrder) {
                console.log(`❌ Position ${i}: Expected order ${expectedOrder}, got order ${actualOrder}`);
                properlyOrdered = false;
            }
        }
        
        if (properlyOrdered) {
            console.log('✅ All lessons are properly ordered');
        } else {
            console.log('❌ Lessons are NOT properly ordered in the array');
        }
        
        // Test specific session 5
        console.log('\n🎯 Testing Session 5 specifically:');
        const session5Lesson = course.lessons[5 - 1]; // Array index 4
        console.log(`Session 5 maps to: "${session5Lesson?.title || 'NULL'}" (Order: ${session5Lesson?.order || 'NULL'})`);
        
        const shouldBeLesson5 = course.lessons.find(l => l.order === 5);
        console.log(`Should be: "${shouldBeLesson5?.title || 'NULL'}" (Order: ${shouldBeLesson5?.order || 'NULL'})`);
        
        if (session5Lesson?.id === shouldBeLesson5?.id) {
            console.log('✅ Session 5 mapping is correct');
        } else {
            console.log('❌ Session 5 mapping is INCORRECT');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLessonMapping();
