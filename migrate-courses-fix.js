/**
 * FIX: Migrate ONLY courses and vocabulary (the missing data)
 * Corrected field names and validation
 */

import pkg from 'pg';
const { Client } = pkg;
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const MONGO_URL = process.env.DATABASE_URL;

// Build ID maps from existing MongoDB data
async function buildIdMaps(db) {
  const maps = { users: new Map(), courses: new Map(), lessons: new Map() };
  
  // Get all existing users from MongoDB and create reverse mapping
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  
  // Map PG user IDs to Mongo IDs
  const { rows: pgUsers } = await pgClient.query('SELECT id, email FROM users');
  const mongoUsers = await db.collection('users').find({}).toArray();
  
  for (const pgUser of pgUsers) {
    const mongoUser = mongoUsers.find(u => u.email === pgUser.email);
    if (mongoUser) {
      maps.users.set(pgUser.id, mongoUser._id);
      console.log(`   Mapped user: ${pgUser.email} → ${mongoUser._id}`);
    }
  }
  
  // Map PG lesson IDs to Mongo IDs (for vocabulary)
  const { rows: pgLessons } = await pgClient.query('SELECT id, title FROM lessons');
  const mongoLessons = await db.collection('lessons').find({}).toArray();
  
  for (const pgLesson of pgLessons) {
    const mongoLesson = mongoLessons.find(l => l.title === pgLesson.title);
    if (mongoLesson) {
      maps.lessons.set(pgLesson.id, mongoLesson._id);
      console.log(`   Mapped lesson: ${pgLesson.title.substring(0, 30)}... → ${mongoLesson._id}`);
    }
  }
  
  await pgClient.end();
  return maps;
}

async function main() {
  console.log('\n🔧 MIGRATION FIX: Courses & Vocabulary\n');
  
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  const mongoClient = new MongoClient(MONGO_URL);
  
  try {
    await pgClient.connect();
    console.log('✅ PostgreSQL connected\n');
    
    await mongoClient.connect();
    const db = mongoClient.db('naijalingua');
    console.log('✅ MongoDB connected\n');
    
    // Build ID mappings from existing data
    console.log('🗺️  Building ID maps from existing MongoDB data...');
    const idMaps = await buildIdMaps(db);
    console.log(`   ✅ Mapped ${idMaps.users.size} users, ${idMaps.lessons.size} lessons\n`);
    
    // ========== COURSES ==========
    console.log('📚 Migrating courses...');
    const { rows: courses } = await pgClient.query('SELECT * FROM courses');
    let coursesInserted = 0;
    let coursesFailed = 0;
    
    for (const c of courses) {
      console.log(`\n   Processing: "${c.title}"`);
      console.log(`     PG ID: ${c.id}`);
      console.log(`     createdById: ${c.createdById}`);
      
      // Get the MongoDB user ID for the creator
      const createdByMongoId = idMaps.users.get(c.createdById);
      
      if (!createdByMongoId) {
        console.log(`     ❌ SKIP: Creator user not found in MongoDB`);
        coursesFailed++;
        continue;
      }
      
      console.log(`     Creator Mongo ID: ${createdByMongoId}`);
      
      try {
        const newCourseId = new ObjectId();
        
        await db.collection('courses').insertOne({
          _id: newCourseId,
          title: c.title,
          description: c.description,
          language: c.language,
          level: c.level,
          imageUrl: c.imageUrl, // Correct field name from PG
          price: c.price || 0,
          currency: c.currency || 'USD',
          category: c.category,
          tags: c.tags || '', // Already a string in PG
          isPublished: c.isPublished,
          isApproved: c.isApproved || false,
          createdById: createdByMongoId, // Use the correct mapped user ID
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        });
        
        // Store the mapping for lessons
        idMaps.courses.set(c.id, newCourseId);
        coursesInserted++;
        console.log(`     ✅ INSERTED with ID: ${newCourseId}`);
        
      } catch (e) {
        if (e.code === 11000) {
          console.log(`     ⚠️  Duplicate (already exists)`);
        } else {
          console.log(`     ❌ ERROR: ${e.message}`);
          coursesFailed++;
        }
      }
    }
    
    console.log(`\n   📊 Courses: ${coursesInserted} inserted, ${coursesFailed} failed\n`);
    
    // ========== UPDATE LESSONS WITH CORRECT COURSE IDs ==========
    console.log('🔗 Updating lessons with correct course IDs...');
    const { rows: lessons } = await pgClient.query('SELECT id, title, "courseId" FROM lessons');
    let lessonsUpdated = 0;
    
    for (const lesson of lessons) {
      const mongoLessonId = idMaps.lessons.get(lesson.id);
      const mongoCourseId = idMaps.courses.get(lesson.courseId);
      
      if (mongoLessonId && mongoCourseId) {
        await db.collection('lessons').updateOne(
          { _id: mongoLessonId },
          { $set: { courseId: mongoCourseId } }
        );
        lessonsUpdated++;
      }
    }
    
    console.log(`   ✅ Updated ${lessonsUpdated} lessons with correct course IDs\n`);
    
    // ========== VOCABULARY ==========
    console.log('📝 Migrating vocabulary...');
    const { rows: vocabulary } = await pgClient.query('SELECT * FROM vocabulary');
    let vocabInserted = 0;
    let vocabFailed = 0;
    
    for (const v of vocabulary) {
      const lessonMongoId = idMaps.lessons.get(v.lessonId);
      
      if (!lessonMongoId) {
        console.log(`   ⚠️  Skip vocab "${v.word}": lesson not found`);
        vocabFailed++;
        continue;
      }
      
      try {
        await db.collection('vocabulary').insertOne({
          _id: new ObjectId(),
          word: v.word,
          translation: v.translation,
          pronunciation: v.pronunciation,
          language: v.language || 'YORUBA',
          lessonId: lessonMongoId,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt
        });
        vocabInserted++;
      } catch (e) {
        if (e.code !== 11000) {
          console.log(`   ❌ ${v.word}: ${e.message}`);
          vocabFailed++;
        }
      }
    }
    
    console.log(`   ✅ ${vocabInserted} vocabulary items inserted, ${vocabFailed} failed\n`);
    
    // ========== FINAL SUMMARY ==========
    console.log('═'.repeat(80));
    console.log('✅ MIGRATION FIX COMPLETE!');
    console.log('═'.repeat(80));
    console.log(`📚 Courses:    ${coursesInserted} inserted`);
    console.log(`📖 Lessons:    ${lessonsUpdated} updated with course IDs`);
    console.log(`📝 Vocabulary: ${vocabInserted} inserted`);
    console.log('═'.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Migration Error:', error);
  } finally {
    await pgClient.end();
    await mongoClient.close();
  }
}

main();
