import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function checkContent() {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db();

  try {
    const lessons = await db.collection('lessons').find({}).toArray();
    console.log(`📚 Checking ${lessons.length} lessons:\n`);
    
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson._id}`);
      console.log(`   Has contentHtml: ${!!lesson.contentHtml}`);
      console.log(`   contentHtml length: ${lesson.contentHtml ? lesson.contentHtml.length : 0}`);
      console.log(`   Has vocabulary: ${!!lesson.vocabulary}`);
      console.log(`   Has culturalNotes: ${!!lesson.culturalNotes}`);
      console.log(`   Has audioData: ${!!lesson.audioData}`);
      console.log('');
    });

  } finally {
    await client.close();
  }
}

checkContent();
