import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();

  const course = await db.collection('courses').findOne({});
  const lesson = await db.collection('lessons').findOne({});
  
  console.log('📚 Course:');
  console.log('  _id:', course._id);
  console.log('  _id type:', course._id.constructor.name);
  console.log('  _id toString:', course._id.toString());
  
  console.log('\n📖 Lesson:');
  console.log('  courseId:', lesson.courseId);
  console.log('  courseId type:', lesson.courseId.constructor.name);
  console.log('  courseId toString:', lesson.courseId.toString());
  
  console.log('\n🔍 Comparison:');
  console.log('  Are equal (===):', course._id === lesson.courseId);
  console.log('  Strings equal:', course._id.toString() === lesson.courseId.toString());
  console.log('  .equals():', course._id.equals(lesson.courseId));

  await client.close();
}

debug();
