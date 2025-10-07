import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;

async function fixLessonOrder() {
  console.log('🔧 Fixing lesson order field...\n');

  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    // Find lessons with null order
    const lessonsWithNullOrder = await db.collection('lessons').find({ order: null }).toArray();
    console.log(`📋 Found ${lessonsWithNullOrder.length} lesson(s) with null order:`);
    
    if (lessonsWithNullOrder.length > 0) {
      lessonsWithNullOrder.forEach(lesson => {
        console.log(`  - ID: ${lesson._id}, Title: ${lesson.title}, CourseID: ${lesson.courseId}`);
      });

      // Update each lesson with null order
      let updateCount = 0;
      for (const lesson of lessonsWithNullOrder) {
        // Get the max order for this course
        const maxOrderLesson = await db.collection('lessons')
          .find({ courseId: lesson.courseId, order: { $ne: null } })
          .sort({ order: -1 })
          .limit(1)
          .toArray();
        
        const nextOrder = maxOrderLesson.length > 0 ? maxOrderLesson[0].order + 1 : 1;
        
        await db.collection('lessons').updateOne(
          { _id: lesson._id },
          { $set: { order: nextOrder } }
        );
        
        console.log(`  ✅ Updated lesson ${lesson._id} to order ${nextOrder}`);
        updateCount++;
      }
      
      console.log(`\n✅ Updated ${updateCount} lesson(s)\n`);
    } else {
      console.log('  No lessons with null order found\n');
    }

    // Verify the fix
    const remainingNulls = await db.collection('lessons').countDocuments({ order: null });
    console.log(`📊 Lessons with null order after fix: ${remainingNulls}`);
    
    if (remainingNulls === 0) {
      console.log('✅ All lessons now have valid order values!');
    } else {
      console.log('⚠️ Some lessons still have null order');
    }

  } catch (error) {
    console.error('❌ Error fixing lesson order:', error);
  } finally {
    await client.close();
  }
}

fixLessonOrder();
