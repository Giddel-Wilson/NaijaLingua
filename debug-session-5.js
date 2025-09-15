import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function debugSession5() {
    try {
        const courseId = 'cm25crc000dn3baxb9a7da';
        const currentSession = 5;
        
        console.log('🔍 Debugging Session 5 Issue...\n');
        
        // Get the course details
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
        
        // Check each lesson
        course.lessons.forEach((lesson, index) => {
            const sessionNumber = index + 1;
            console.log(`\nSession ${sessionNumber} (Order: ${lesson.order})`);
            console.log(`  ID: ${lesson.id}`);
            console.log(`  Title: ${lesson.title}`);
            console.log(`  Quizzes: ${lesson.quizzes.length}`);
            if (lesson.quizzes.length > 0) {
                lesson.quizzes.forEach(quiz => {
                    console.log(`    - Quiz: ${quiz.question}`);
                });
            }
            
            if (sessionNumber === currentSession) {
                console.log(`  ⭐ THIS IS SESSION ${currentSession} (Current)`);
            }
        });
        
        // Get the current lesson based on session number
        const currentLesson = course.lessons[currentSession - 1];
        
        console.log('\n🔍 Current Lesson Analysis:');
        if (currentLesson) {
            console.log(`✅ Current Lesson Found:`);
            console.log(`   Title: ${currentLesson.title}`);
            console.log(`   ID: ${currentLesson.id}`);
            console.log(`   Has Quizzes: ${currentLesson.quizzes.length > 0}`);
            console.log(`   Quiz Count: ${currentLesson.quizzes.length}`);
            if (currentLesson.quizzes.length > 0) {
                console.log(`   Quiz Details:`);
                currentLesson.quizzes.forEach((quiz, idx) => {
                    console.log(`     ${idx + 1}. ${quiz.question} (${quiz.type})`);
                });
            }
        } else {
            console.log(`❌ No lesson found for session ${currentSession}`);
            console.log(`   Available sessions: 1-${course.lessons.length}`);
        }
        
        // Check for Demo Student progress
        const demoUser = await db.user.findFirst({
            where: { email: 'demo@student.com' }
        });
        
        if (demoUser) {
            console.log(`\n👤 Demo Student (${demoUser.name}) Progress:`);
            
            const lessonProgress = await db.lessonProgress.findMany({
                where: {
                    userId: demoUser.id,
                    lesson: {
                        courseId: courseId
                    }
                },
                include: {
                    lesson: true
                }
            });
            
            lessonProgress.forEach(progress => {
                const sessionNum = course.lessons.findIndex(l => l.id === progress.lessonId) + 1;
                console.log(`   Session ${sessionNum}: ${progress.completed ? '✅ Completed' : '⏳ In Progress'} (${Math.floor(progress.timeSpent / 60)}m)`);
            });
            
            // Check quiz attempts
            if (currentLesson) {
                const quizAttempts = await db.quizAttempt.findMany({
                    where: {
                        userId: demoUser.id,
                        quiz: {
                            lessonId: currentLesson.id
                        }
                    },
                    include: {
                        quiz: true
                    }
                });
                
                console.log(`\n🧪 Quiz Attempts for Session ${currentSession}:`);
                if (quizAttempts.length === 0) {
                    console.log(`   No quiz attempts yet`);
                } else {
                    quizAttempts.forEach(attempt => {
                        console.log(`   Quiz: ${attempt.quiz.question}`);
                        console.log(`     Answer: ${attempt.answer}`);
                        console.log(`     Correct: ${attempt.isCorrect}`);
                        console.log(`     Points: ${attempt.pointsEarned}`);
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('Error debugging session 5:', error);
    } finally {
        await db.$disconnect();
    }
}

debugSession5();
