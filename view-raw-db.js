/**
 * Direct MongoDB Query - bypasses Prisma to see raw data
 */

import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://GiddelWilson:10.Flash.01@cluster0.lipiiax.mongodb.net/naijalingua?retryWrites=true&w=majority";

async function viewRawData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('\n✅ Connected to MongoDB\n');
    
    const db = client.db('naijalingua');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name).join(', '));
    console.log('\n' + '='.repeat(100) + '\n');
    
    // Check each collection
    for (const collName of ['users', 'courses', 'lessons', 'enrollments', 'lesson_progress', 
                            'quizzes', 'quiz_attempts', 'certificates', 'vocabulary', 'cultural_content']) {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      console.log(`📊 ${collName.toUpperCase().padEnd(20)}: ${count} documents`);
      
      if (count > 0 && count <= 10) {
        const docs = await coll.find({}).limit(10).toArray();
        console.log(`   Sample data:`, JSON.stringify(docs[0], null, 2).substring(0, 300) + '...');
      }
      console.log('');
    }
    
    // Special check for courses
    console.log('\n' + '='.repeat(100));
    console.log('🔍 DETAILED COURSES CHECK');
    console.log('='.repeat(100) + '\n');
    
    const coursesCollection = db.collection('courses');
    const coursesCount = await coursesCollection.countDocuments();
    console.log(`Total courses documents: ${coursesCount}`);
    
    if (coursesCount > 0) {
      const allCourses = await coursesCollection.find({}).toArray();
      console.log('\nAll courses:');
      allCourses.forEach((course, i) => {
        console.log(`\n${i + 1}. Course:`, JSON.stringify(course, null, 2));
      });
    }
    
    // Check enrollments for startedAt issue
    console.log('\n' + '='.repeat(100));
    console.log('🔍 ENROLLMENT DATA ISSUES');
    console.log('='.repeat(100) + '\n');
    
    const enrollmentsCollection = db.collection('enrollments');
    const enrollments = await enrollmentsCollection.find({}).toArray();
    console.log(`Total enrollments: ${enrollments.length}`);
    
    enrollments.forEach((e, i) => {
      console.log(`\n${i + 1}. Enrollment ${e._id}:`);
      console.log(`   - userId: ${e.userId}`);
      console.log(`   - courseId: ${e.courseId}`);
      console.log(`   - startedAt: ${e.startedAt} (${typeof e.startedAt})`);
      console.log(`   - enrolledAt: ${e.enrolledAt} (${typeof e.enrolledAt})`);
      console.log(`   - createdAt: ${e.createdAt} (${typeof e.createdAt})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

viewRawData();
