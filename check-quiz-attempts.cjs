const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuizAttempts() {
  try {
    console.log('🔍 Checking quiz attempts...\n');
    
    // Get all quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      include: {
        quiz: {
          select: {
            question: true,
            lesson: {
              select: {
                title: true,
                order: true
              }
            }
          }
        }
      },
      orderBy: {
        attemptedAt: 'desc'
      }
    });
    
    console.log(`Total quiz attempts: ${attempts.length}\n`);
    
    if (attempts.length === 0) {
      console.log('✅ No quiz attempts found in the database.');
    } else {
      console.log('Quiz attempts found:');
      attempts.forEach((a, i) => {
        console.log(`\n${i + 1}. User ID: ${a.userId}`);
        console.log(`   Lesson: ${a.quiz.lesson.title}`);
        console.log(`   Question: ${a.quiz.question.substring(0, 50)}...`);
        console.log(`   Answer: ${a.answer}`);
        console.log(`   Correct: ${a.isCorrect}`);
        console.log(`   Attempted: ${a.attemptedAt}`);
      });
      
      console.log(`\n\n⚠️  Found ${attempts.length} quiz attempt(s). These might be causing the issue.`);
      console.log('Would you like to delete them? (Run: node delete-quiz-attempts.cjs)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizAttempts();
