const { PrismaClient } = require('@prisma/client');

async function testServerSideQuizLogic() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== TESTING SERVER-SIDE QUIZ LOGIC ===\n');
    
    // Test with session 5 lesson
    const lessonId = 'cmf25cusq000nkn3b29w7woe0';
    console.log('Testing lesson ID:', lessonId);
    
    // Get lesson with quizzes
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { quizzes: true }
    });
    
    if (!lesson) {
      console.log('❌ Lesson not found');
      return;
    }
    
    console.log(`✅ Lesson found: ${lesson.title}`);
    console.log(`Quizzes: ${lesson.quizzes.length}`);
    lesson.quizzes.forEach((quiz, index) => {
      console.log(`  ${index + 1}. ${quiz.question}`);
    });
    console.log('');
    
    // Get a test user
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log(`Testing with user: ${user.name} (${user.email})`);
    console.log('');
    
    // Get quiz attempts for this lesson and user
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quiz: {
          lessonId: lessonId
        }
      },
      include: {
        quiz: true
      }
    });
    
    console.log(`Found ${quizAttempts.length} quiz attempts`);
    if (quizAttempts.length > 0) {
      quizAttempts.forEach((attempt, index) => {
        console.log(`  ${index + 1}. ${attempt.quiz.question} - ${attempt.isCorrect ? 'Correct' : 'Incorrect'} (${attempt.attemptedAt})`);
      });
    }
    console.log('');
    
    // Calculate quiz attempt summary (same logic as server)
    const currentLessonQuizzes = lesson.quizzes || [];
    let quizAttemptSummary = {
      hasQuizzes: currentLessonQuizzes.length > 0,
      attemptsUsed: 0,
      attemptsRemaining: 3,
      canTakeQuiz: currentLessonQuizzes.length > 0,
      bestScore: 0,
      hasPassed: false
    };

    if (currentLessonQuizzes.length > 0 && quizAttempts.length > 0) {
      // Group attempts by time (5-minute windows to count as one attempt)
      const attemptGroups = new Map();
      
      for (const attempt of quizAttempts) {
        const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
        if (!attemptGroups.has(timeKey)) {
          attemptGroups.set(timeKey, new Set());
        }
        attemptGroups.get(timeKey).add(attempt.quizId);
      }

      // Count complete attempts
      let completeAttempts = 0;
      let bestScore = 0;
      let hasPassed = false;

      for (const [timeKey, quizIds] of attemptGroups) {
        if (quizIds.size === currentLessonQuizzes.length) {
          completeAttempts++;
          
          // Calculate score for this attempt
          const attemptTime = new Date(timeKey * 5 * 60 * 1000);
          const attemptResults = quizAttempts.filter(a => 
            Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
          );
          
          const correctCount = attemptResults.filter(a => a.isCorrect).length;
          const scorePercentage = Math.round((correctCount / currentLessonQuizzes.length) * 100);
          
          console.log(`Attempt ${completeAttempts}: ${correctCount}/${currentLessonQuizzes.length} correct (${scorePercentage}%)`);
          
          if (scorePercentage > bestScore) {
            bestScore = scorePercentage;
          }
          
          if (scorePercentage >= 50) {
            hasPassed = true;
          }
        }
      }

      quizAttemptSummary = {
        hasQuizzes: true,
        attemptsUsed: completeAttempts,
        attemptsRemaining: Math.max(0, 3 - completeAttempts),
        canTakeQuiz: completeAttempts < 3,
        bestScore: bestScore,
        hasPassed: hasPassed
      };
    }
    
    console.log('\n=== QUIZ ATTEMPT SUMMARY ===');
    console.log('Has Quizzes:', quizAttemptSummary.hasQuizzes);
    console.log('Attempts Used:', quizAttemptSummary.attemptsUsed);
    console.log('Attempts Remaining:', quizAttemptSummary.attemptsRemaining);
    console.log('Can Take Quiz:', quizAttemptSummary.canTakeQuiz);
    console.log('Best Score:', quizAttemptSummary.bestScore + '%');
    console.log('Has Passed:', quizAttemptSummary.hasPassed);
    
    console.log('\n✅ Server-side logic test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testServerSideQuizLogic();
