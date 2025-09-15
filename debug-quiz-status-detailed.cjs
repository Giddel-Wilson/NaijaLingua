const { PrismaClient } = require('@prisma/client');

async function debugQuizStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== DEBUGGING QUIZ STATUS ===\n');
    
    const courseId = 'cmf25csrc000dkn3baxb9a7da';
    
    // Get the course and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    console.log(`Course: ${course.title}`);
    console.log(`Total lessons: ${course.lessons.length}\n`);
    
    // Get lesson 5 (session 5)
    const lesson5 = course.lessons[4]; // 0-indexed, so lesson 5 is index 4
    if (!lesson5) {
      console.log('❌ Lesson 5 not found');
      return;
    }
    
    console.log(`Lesson 5: ${lesson5.title} (ID: ${lesson5.id})`);
    
    // Get quizzes for lesson 5
    const quizzes = await prisma.quiz.findMany({
      where: { lessonId: lesson5.id },
      orderBy: { order: 'asc' }
    });
    
    console.log(`Quizzes in lesson 5: ${quizzes.length}`);
    quizzes.forEach(quiz => {
      console.log(`  - ${quiz.question} (ID: ${quiz.id})`);
    });
    
    // Get users to check attempts
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, email: true }
    });
    
    console.log(`\nUsers found: ${users.length}`);
    
    for (const user of users) {
      console.log(`\n--- User: ${user.name} (${user.email}) ---`);
      
      // Get quiz attempts for this lesson
      const attempts = await prisma.quizAttempt.findMany({
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
      
      console.log(`Quiz attempts: ${attempts.length}`);
      
      if (attempts.length > 0) {
        attempts.forEach(attempt => {
          console.log(`  ${attempt.attemptedAt.toISOString()} - ${attempt.quiz.question}: ${attempt.answer} (${attempt.isCorrect ? 'CORRECT' : 'WRONG'})`);
        });
        
        // Calculate score like the server does
        const attemptGroups = new Map();
        for (const attempt of attempts) {
          const timeKey = Math.floor(attempt.attemptedAt.getTime() / (5 * 60 * 1000));
          if (!attemptGroups.has(timeKey)) {
            attemptGroups.set(timeKey, new Set());
          }
          attemptGroups.get(timeKey).add(attempt.quizId);
        }
        
        let totalAttempts = 0;
        let bestScore = 0;
        let hasPassed = false;
        
        for (const [timeKey, quizIds] of attemptGroups) {
          if (quizIds.size === quizzes.length) {
            totalAttempts++;
            
            const attemptTime = new Date(timeKey * 5 * 60 * 1000);
            const attemptResults = attempts.filter(a => 
              Math.abs(a.attemptedAt.getTime() - attemptTime.getTime()) < 5 * 60 * 1000
            );
            
            const correctCount = attemptResults.filter(a => a.isCorrect).length;
            const scorePercentage = Math.round((correctCount / quizzes.length) * 100);
            
            if (scorePercentage > bestScore) {
              bestScore = scorePercentage;
            }
            
            if (scorePercentage >= 80) {
              hasPassed = true;
            }
            
            console.log(`  Attempt ${totalAttempts}: ${correctCount}/${quizzes.length} correct = ${scorePercentage}%`);
          }
        }
        
        console.log(`Status: Total attempts: ${totalAttempts}, Best score: ${bestScore}%, Has passed: ${hasPassed}, Can take quiz: ${!hasPassed}`);
      } else {
        console.log('  No quiz attempts found');
        console.log(`Status: Can take quiz: true (no attempts yet)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuizStatus();