import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;

async function fixCourseIds() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    console.log('🔧 Converting lesson courseId from string to ObjectId...\n');
    
    const lessons = await db.collection('lessons').find({}).toArray();
    let fixed = 0;
    
    for (const lesson of lessons) {
      // Check if courseId is a string
      if (typeof lesson.courseId === 'string') {
        console.log(`Fixing lesson: ${lesson.title}`);
        console.log(`  Old courseId: ${lesson.courseId} (${typeof lesson.courseId})`);
        
        try {
          const objectId = new ObjectId(lesson.courseId);
          await db.collection('lessons').updateOne(
            { _id: lesson._id },
            { $set: { courseId: objectId } }
          );
          console.log(`  New courseId: ${objectId} (ObjectId)`);
          console.log('  ✅ Fixed\n');
          fixed++;
        } catch (error) {
          console.log(`  ❌ Error: ${error.message}\n`);
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} lesson(s)`);
    
    // Verify
    const stillStrings = await db.collection('lessons').find({ 
      courseId: { $type: 'string' } 
    }).toArray();
    console.log(`\n📊 Lessons with string courseId remaining: ${stillStrings.length}`);

  } finally {
    await client.close();
  }
}

fixCourseIds();
