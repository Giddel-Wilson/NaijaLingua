const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuizSystem() {
  try {
    console.log('🧪 Testing Quiz Scoring System...\n');
    
    // Get a lesson with quizzes
    const lesson = await prisma.lesson.findFirst({
      where: {
        quizzes: {
          some: {}
        }
      },
      include: {
        quizzes: {
          orderBy: { order: 'asc' }
        },
        course: true
      }
    });

    if (!lesson) {
      console.log('❌ No lessons with quizzes found');
      return;
    }

    console.log(`📚 Testing lesson: "${lesson.title}"`);
    console.log(`🔹 Course: ${lesson.course.title}`);
    console.log(`🔹 Quizzes: ${lesson.quizzes.length}`);
    
    // Display quiz details
    console.log('\n📝 Quiz Questions:');
    lesson.quizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.question}`);
      console.log(`   Correct Answer: ${quiz.correctAnswer}`);
      
      // Parse options
      let options = [];
      try {
        if (Array.isArray(quiz.options)) {
          options = quiz.options;
        } else {
          const parsed = JSON.parse(quiz.options);
          options = Array.isArray(parsed) ? parsed : quiz.options.split(',');
        }
      } catch (e) {
        options = String(quiz.options).split(',');
      }
      
      console.log(`   Options: ${options.join(', ')}`);
      console.log('');
    });

    // Check existing attempts
    const existingAttempts = await prisma.quizAttempt.findMany({
      where: {
        quiz: {
          lessonId: lesson.id
        }
      },
      include: {
        quiz: true
      }
    });

    console.log(`📊 Existing attempts: ${existingAttempts.length}`);
    
    if (existingAttempts.length > 0) {
      console.log('\n🔍 Recent attempts:');
      const recentAttempts = existingAttempts.slice(-3);
      recentAttempts.forEach((attempt, index) => {
        console.log(`${index + 1}. Quiz: "${attempt.quiz.question.substring(0, 30)}..."`);
        console.log(`   Answer: ${attempt.answer}`);
        console.log(`   Correct: ${attempt.isCorrect ? '✅' : '❌'}`);
        console.log(`   Time: ${attempt.attemptedAt.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('\n✅ Quiz system test completed!');
    console.log('\n💡 Tips for testing:');
    console.log('- Visit the lesson page in browser');
    console.log('- Click "Take Test" to open quiz modal');
    console.log('- Answer questions and submit');
    console.log('- Check score and pass/fail status');
    console.log('- Try multiple attempts to test 3-attempt limit');

  } catch (error) {
    console.error('❌ Error testing quiz system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuizSystem();
