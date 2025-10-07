import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;
const courseId = '68e39960a782038f0f1ae158';

async function checkCourse() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    console.log(`🔍 Checking course ${courseId}...\n`);
    
    // Get the course
    const course = await db.collection('courses').findOne({ _id: new ObjectId(courseId) });
    if (!course) {
      console.log('❌ Course not found!');
      return;
    }
    
    console.log(`📚 Course: ${course.title}`);
    console.log(`   ID: ${course._id}\n`);
    
    // Get lessons for this course
    const lessons = await db.collection('lessons').find({ 
      courseId: courseId 
    }).toArray();
    
    console.log(`📋 Found ${lessons.length} lessons for this course:\n`);
    
    lessons.forEach(lesson => {
      console.log(`Lesson: ${lesson.title || 'Untitled'}`);
      console.log(`  ID: ${lesson._id}`);
      console.log(`  CourseID: ${lesson.courseId}`);
      console.log(`  Order: ${lesson.order} (type: ${typeof lesson.order})`);
      console.log(`  Has order property: ${lesson.hasOwnProperty('order')}`);
      console.log('');
    });
    
    // Check for null orders in this course
    const nullOrders = lessons.filter(l => l.order === null || l.order === undefined);
    console.log(`\n⚠️  Lessons with null/undefined order: ${nullOrders.length}`);
    
    if (nullOrders.length > 0) {
      console.log('\n🔧 Fixing lessons with null order...');
      for (let i = 0; i < nullOrders.length; i++) {
        const lesson = nullOrders[i];
        const newOrder = lessons.length + i + 1;
        await db.collection('lessons').updateOne(
          { _id: lesson._id },
          { $set: { order: newOrder } }
        );
        console.log(`✅ Updated ${lesson.title} to order ${newOrder}`);
      }
    }

  } finally {
    await client.close();
  }
}

checkCourse();
