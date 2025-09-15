const { PrismaClient } = require('@prisma/client');

async function checkCurrentUserQuizStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== CHECKING CURRENT USER QUIZ STATUS ===\n');
    
    // Find the Demo Student user (assuming that's who you're logged in as)
    const user = await prisma.user.findUnique({
      where: { email: 'student@naijalingua.com' },
      select: { id: true, name: true, email: true }
    });
    
    if (!user) {
      console.log('❌ Demo Student user not found');
      return;
    }
    
    console.log(`User: ${user.name} (${user.email})`);
    
    // Get lesson 5
    const lesson5 = await prisma.lesson.findFirst({
      where: { 
        course: { id: 'cmf25csrc000dkn3baxb9a7da' },
        order: 5
      },
      include: {
        quizzes: true
      }
    });
    
    if (!lesson5) {
      console.log('❌ Lesson 5 not found');
      return;
    }
    
    console.log(`\nLesson 5: ${lesson5.title} (${lesson5.id})`);
    console.log(`Quizzes: ${lesson5.quizzes.length}`);
    
    // Check quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quiz: {
          lessonId: lesson5.id
        }
      },
      include: {
        quiz: true
      },
      orderBy: { attemptedAt: 'desc' }
    });
    
    console.log(`\nQuiz attempts found: ${quizAttempts.length}`);
    
    if (quizAttempts.length > 0) {
      console.log('Attempts:');
      quizAttempts.forEach((attempt, i) => {
        console.log(`  ${i+1}. ${attempt.attemptedAt.toISOString()} - "${attempt.quiz.question}" = "${attempt.answer}" (${attempt.isCorrect ? 'CORRECT' : 'WRONG'})`);
      });
    } else {
      console.log('  No attempts found - user has not taken the quiz yet');
    }
    
    // Check lesson progress
    const lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
        lessonId: lesson5.id
      }
    });
    
    console.log(`\nLesson Progress:`);
    if (lessonProgress) {
      console.log(`  Completed: ${lessonProgress.completed}`);
      console.log(`  Time spent: ${lessonProgress.timeSpent} seconds`);
      if (lessonProgress.completedAt) {
        console.log(`  Completed at: ${lessonProgress.completedAt.toISOString()}`);
      }
    } else {
      console.log('  No lesson progress found');
    }
    
    // Simulate the server-side quiz status calculation
    console.log(`\n=== SIMULATING SERVER QUIZ STATUS CALCULATION ===`);
    
    let quizStatus = {
      hasQuizzes: lesson5.quizzes.length > 0,
      bestScore: 0,
      hasPassed: false,
      canTakeQuiz: lesson5.quizzes.length > 0,
      totalAttempts: 0
    };
    
    console.log(`Initial quiz status:`, quizStatus);
    
    if (lesson5.quizzes.length > 0 && quizAttempts.length > 0) {
      console.log('Processing quiz attempts...');
      
      // Group attempts by time (5-minute windows)
      const attemptGroups = new Map();
      
      for (const attempt of quizAttempts) {
        const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
        if (!attemptGroups.has(timeKey)) {
          attemptGroups.set(timeKey, new Set());
        }
        attemptGroups.get(timeKey).add(attempt.quizId);
      }
      
      console.log(`Attempt groups: ${attemptGroups.size}`);
      
      // Find the best score from complete attempts
      let bestScore = 0;
      let totalAttempts = 0;
      let hasPassed = false;
      
      for (const [timeKey, quizIds] of attemptGroups) {
        console.log(`  Group ${timeKey}: ${quizIds.size} quizzes answered (need ${lesson5.quizzes.length})`);
        
        if (quizIds.size === lesson5.quizzes.length) {
          totalAttempts++;
          
          const attemptTime = new Date(timeKey * 5 * 60 * 1000);
          const attemptResults = quizAttempts.filter(a => 
            Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
          );
          
          const correctCount = attemptResults.filter(a => a.isCorrect).length;
          const scorePercentage = Math.round((correctCount / lesson5.quizzes.length) * 100);
          
          console.log(`  Complete attempt ${totalAttempts}: ${correctCount}/${lesson5.quizzes.length} = ${scorePercentage}%`);
          
          if (scorePercentage > bestScore) {
            bestScore = scorePercentage;
          }
          
          if (scorePercentage >= 80) {
            hasPassed = true;
          }
        }
      }
      
      quizStatus = {
        hasQuizzes: true,
        bestScore: bestScore,
        hasPassed: hasPassed,
        canTakeQuiz: !hasPassed,
        totalAttempts: totalAttempts
      };
    } else {
      console.log('No quiz attempts to process');
    }
    
    console.log(`\nFinal quiz status:`, quizStatus);
    console.log(`\nExpected UI behavior:`);
    if (quizStatus.hasQuizzes && quizStatus.canTakeQuiz) {
      console.log('  → Should show "Ready for the Test?" with Take Test button');
    } else if (quizStatus.hasQuizzes && !quizStatus.canTakeQuiz) {
      console.log('  → Should show "Quiz Completed ✅" with passed status');
    } else {
      console.log('  → Should show lesson completion without quiz');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUserQuizStatus();