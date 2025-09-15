const { PrismaClient } = require('@prisma/client');

async function testQuizAPI() {
  try {
    console.log('Testing quiz status API...');
    
    // First, verify the lesson exists
    const prisma = new PrismaClient();
    const lesson = await prisma.lesson.findUnique({
      where: { id: 'cmf25cusq000nkn3b29w7woe0' },
      include: { quizzes: true }
    });
    
    console.log('Lesson found:', lesson ? lesson.title : 'NOT FOUND');
    console.log('Quizzes:', lesson?.quizzes?.length || 0);
    
    if (lesson && lesson.quizzes.length > 0) {
      console.log('Quiz details:');
      lesson.quizzes.forEach((quiz, index) => {
        console.log(`  ${index + 1}. ${quiz.question} (Order: ${quiz.order})`);
      });
    }
    
    await prisma.$disconnect();
    
    // Test the actual API endpoint
    console.log('\nTesting API endpoint...');
    const response = await fetch('http://localhost:5174/api/lessons/cmf25cusq000nkn3b29w7woe0/quiz-submit', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test' // This won't work without proper session, but let's see the error
      }
    });
    
    console.log('API Response status:', response.status);
    const data = await response.text();
    console.log('API Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testQuizAPI();
