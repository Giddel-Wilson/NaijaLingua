import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function verifySession5() {
    try {
        const courseId = 'cm25crc000dn3baxb9a7da';
        const currentSession = 5;
        
        console.log('🔍 Verifying Session 5 After Fix...\n');
        
        // Get the course details exactly as the server does
        const course = await db.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    where: {
                        isPublished: true
                    },
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        quizzes: true
                    }
                }
            }
        });

        if (!course) {
            console.log('❌ Course not found');
            return;
        }

        console.log(`📚 Course: ${course.title}`);
        console.log(`📝 Total Published Lessons: ${course.lessons.length}`);
        console.log(`🎯 Requested Session: ${currentSession}`);
        
        // Show the lesson array indexing
        console.log('\n📋 Lesson Array Indexing:');
        course.lessons.forEach((lesson, index) => {
            console.log(`  Array Index [${index}] = Session ${index + 1}`);
            console.log(`    Order: ${lesson.order}`);
            console.log(`    Title: ${lesson.title}`);
            console.log(`    ID: ${lesson.id}`);
            console.log(`    Quizzes: ${lesson.quizzes.length}`);
            if (index + 1 === currentSession) {
                console.log(`    ⭐ THIS IS SESSION ${currentSession} ⭐`);
            }
            console.log('');
        });
        
        // Get the current lesson based on session number (as the server does)
        const currentLesson = course.lessons[currentSession - 1];
        
        console.log('🎯 Session 5 Analysis:');
        if (currentLesson) {
            console.log(`✅ Lesson for Session 5:`);
            console.log(`   Title: ${currentLesson.title}`);
            console.log(`   ID: ${currentLesson.id}`);
            console.log(`   Order: ${currentLesson.order}`);
            console.log(`   Has Quizzes: ${currentLesson.quizzes.length > 0}`);
            console.log(`   Quiz Count: ${currentLesson.quizzes.length}`);
            
            if (currentLesson.quizzes.length > 0) {
                console.log(`\n🧪 Quiz Details:`);
                currentLesson.quizzes.forEach((quiz, idx) => {
                    console.log(`     ${idx + 1}. Question: ${quiz.question}`);
                    console.log(`        Type: ${quiz.type}`);
                    console.log(`        Correct Answer: ${quiz.correctAnswer}`);
                    console.log(`        Options: ${quiz.options}`);
                    console.log('');
                });
            }
        } else {
            console.log(`❌ No lesson found for session ${currentSession}`);
        }
        
    } catch (error) {
        console.error('Error verifying session 5:', error);
    } finally {
        await db.$disconnect();
    }
}

verifySession5();
