import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkQuizzes() {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();

  try {
    const quizzes = await db.collection('quizzes').find({}).toArray();
    console.log(`📋 Found ${quizzes.length} quiz(zes):\n`);
    
    quizzes.forEach(quiz => {
      console.log(`Quiz: ${quiz.question.substring(0, 50)}...`);
      console.log(`  ID: ${quiz._id}`);
      console.log(`  LessonID: ${quiz.lessonId}`);
      console.log(`  Order: ${quiz.order} (type: ${typeof quiz.order})`);
      console.log(`  Has order: ${quiz.hasOwnProperty('order')}`);
      console.log('');
    });
    
    // Find quizzes with null order
    const nullOrders = quizzes.filter(q => q.order === null || q.order === undefined);
    console.log(`\n⚠️  Quizzes with null/undefined order: ${nullOrders.length}`);
    
    if (nullOrders.length > 0) {
      console.log('\n🔧 Fixing quizzes with null order...');
      for (let i = 0; i < nullOrders.length; i++) {
        const quiz = nullOrders[i];
        await db.collection('quizzes').updateOne(
          { _id: quiz._id },
          { $set: { order: i + 1 } }
        );
        console.log(`✅ Updated quiz ${quiz._id} to order ${i + 1}`);
      }
      console.log('\n✅ All quizzes fixed!');
    }

  } finally {
    await client.close();
  }
}

checkQuizzes();
