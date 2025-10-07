import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;

async function checkLessons() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    const allLessons = await db.collection('lessons').find({}).toArray();
    console.log(`📊 Total lessons: ${allLessons.length}\n`);
    
    allLessons.forEach(lesson => {
      const hasOrder = lesson.hasOwnProperty('order');
      const orderValue = lesson.order;
      const orderType = typeof orderValue;
      
      console.log(`Lesson: ${lesson.title || 'Untitled'}`);
      console.log(`  ID: ${lesson._id}`);
      console.log(`  Has 'order': ${hasOrder}, Value: ${orderValue}, Type: ${orderType}`);
      console.log('');
    });

    const nullOrders = await db.collection('lessons').countDocuments({ order: null });
    const undefinedOrders = await db.collection('lessons').countDocuments({ order: { $exists: false } });
    
    console.log(`\n📊 Summary:`);
    console.log(`  Lessons with order = null: ${nullOrders}`);
    console.log(`  Lessons without order field: ${undefinedOrders}`);

  } finally {
    await client.close();
  }
}

checkLessons();
