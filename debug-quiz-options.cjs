const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function debugQuizOptions() {
  try {
    console.log('🔍 Debugging quiz options format...\n');
    
    const quizzes = await db.quiz.findMany({
      where: { 
        lesson: { 
          courseId: 'cmf25csrc000dkn3baxb9a7da' 
        } 
      },
      include: { 
        lesson: { 
          select: { title: true, order: true } 
        } 
      },
      orderBy: { order: 'asc' }
    });

    console.log(`Found ${quizzes.length} quizzes\n`);
    
    quizzes.forEach((quiz, i) => {
      console.log(`Quiz ${i + 1} (Lesson ${quiz.lesson?.order}: ${quiz.lesson?.title}):`);
      console.log(`  Question: ${quiz.question}`);
      console.log(`  Options: ${quiz.options}`);
      console.log(`  Type: ${typeof quiz.options}`);
      console.log(`  Is valid JSON: ${isValidJSON(quiz.options)}`);
      if (isValidJSON(quiz.options)) {
        console.log(`  Parsed: ${JSON.stringify(JSON.parse(quiz.options))}`);
      } else {
        console.log(`  Split by comma: ${JSON.stringify(quiz.options.split(','))}`);
      }
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

debugQuizOptions();
