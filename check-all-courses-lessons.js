import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;

async function checkAll() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    const courses = await db.collection('courses').find({}).toArray();
    console.log(`📚 Found ${courses.length} course(s):\n`);
    
    for (const course of courses) {
      const lessons = await db.collection('lessons').find({ courseId: course._id.toString() }).toArray();
      console.log(`Course: ${course.title}`);
      console.log(`  ID: ${course._id}`);
      console.log(`  Lessons: ${lessons.length}`);
      if (lessons.length > 0) {
        lessons.forEach(l => {
          console.log(`    - ${l.title} (order: ${l.order})`);
        });
      }
      console.log('');
    }
    
    // Check for orphaned lessons
    const allLessons = await db.collection('lessons').find({}).toArray();
    const courseIds = courses.map(c => c._id.toString());
    const orphanedLessons = allLessons.filter(l => !courseIds.includes(l.courseId));
    
    console.log(`\n⚠️  Orphaned lessons (no matching course): ${orphanedLessons.length}`);
    if (orphanedLessons.length > 0) {
      orphanedLessons.forEach(l => {
        console.log(`  - ${l.title} (courseId: ${l.courseId})`);
      });
    }

  } finally {
    await client.close();
  }
}

checkAll();
