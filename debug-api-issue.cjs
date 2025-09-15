const { PrismaClient } = require('@prisma/client');

async function debugApiIssue() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== DEBUGGING API ISSUE ===\n');
    
    // 1. Check if the course exists and which lesson is session 5
    console.log('1. Checking course and lesson data...');
    const course = await prisma.course.findUnique({
      where: { id: 'cmf25csrc000dkn3baxb9a7da' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { quizzes: true }
        }
      }
    });
    
    if (!course) {
      console.log('❌ Course not found!');
      return;
    }
    
    console.log(`✅ Course found: ${course.title}`);
    console.log(`Total lessons: ${course.lessons.length}\n`);
    
    // 2. Find session 5 lesson
    const session5Lesson = course.lessons[4]; // Index 4 for session 5
    if (session5Lesson) {
      console.log('2. Session 5 lesson details:');
      console.log(`   ID: ${session5Lesson.id}`);
      console.log(`   Title: ${session5Lesson.title}`);
      console.log(`   Order: ${session5Lesson.order}`);
      console.log(`   Quizzes: ${session5Lesson.quizzes.length}\n`);
      
      if (session5Lesson.quizzes.length > 0) {
        console.log('   Quiz details:');
        session5Lesson.quizzes.forEach((quiz, index) => {
          console.log(`     ${index + 1}. ${quiz.question} (Order: ${quiz.order})`);
        });
        console.log('');
      }
    } else {
      console.log('❌ Session 5 lesson not found!');
      return;
    }
    
    // 3. Check for any users in the system
    console.log('3. Checking users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) [${user.id}]`);
    });
    console.log('');
    
    // 4. Check quiz attempts for session 5
    if (session5Lesson && users.length > 0) {
      console.log('4. Checking quiz attempts for session 5...');
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quiz: {
            lessonId: session5Lesson.id
          }
        },
        include: {
          user: { select: { name: true, email: true } },
          quiz: { select: { question: true } }
        }
      });
      
      console.log(`Found ${attempts.length} quiz attempts for session 5`);
      if (attempts.length > 0) {
        attempts.forEach(attempt => {
          console.log(`   - ${attempt.user.name}: ${attempt.quiz.question} (Correct: ${attempt.isCorrect})`);
        });
      }
      console.log('');
    }
    
    // 5. Summary
    console.log('=== SUMMARY ===');
    console.log(`Course ID: ${course.id}`);
    console.log(`Session 5 Lesson ID: ${session5Lesson ? session5Lesson.id : 'NOT FOUND'}`);
    console.log(`Expected API URL: /api/lessons/${session5Lesson ? session5Lesson.id : 'UNKNOWN'}/quiz-submit`);
    console.log(`Users in system: ${users.length}`);
    console.log(`Quiz attempts: ${session5Lesson ? 'Available for checking' : 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugApiIssue();
