import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.DATABASE_URL;

async function checkData() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  console.log('🔍 Checking for data issues...\n');

  // Check enrollments
  const enrollmentsWithNull = await db.collection('enrollments').find({ startedAt: null }).toArray();
  console.log(`📋 Enrollments with null startedAt: ${enrollmentsWithNull.length}`);
  if (enrollmentsWithNull.length > 0) {
    console.log('Details:', enrollmentsWithNull.map(e => ({ id: e._id, userId: e.userId, courseId: e.courseId })));
  }

  // Check quizzes
  const quizzesWithMC = await db.collection('quizzes').find({ type: 'MULTIPLE_CHOICE' }).toArray();
  console.log(`\n📋 Quizzes with MULTIPLE_CHOICE: ${quizzesWithMC.length}`);
  if (quizzesWithMC.length > 0) {
    console.log('Details:', quizzesWithMC.map(q => ({ id: q._id, type: q.type, question: q.question })));
  }

  // Check all enrollment startedAt values
  const allEnrollments = await db.collection('enrollments').find({}).toArray();
  console.log(`\n📊 All enrollments (${allEnrollments.length}):`);
  allEnrollments.forEach(e => {
    console.log(`  - ID: ${e._id}, startedAt: ${e.startedAt}, type: ${typeof e.startedAt}`);
  });

  await client.close();
}

checkData();
