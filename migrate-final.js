/**
 * PostgreSQL → MongoDB Complete Migration
 * Collection names match Prisma @@map directives
 */

import pkg from 'pg';
const { Client } = pkg;
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const MONGO_URL = process.env.DATABASE_URL;

const idMap = { users: new Map(), courses: new Map(), lessons: new Map(), quizzes: new Map() };

function mapId(type, oldId) {
  if (!oldId) return null;
  if (idMap[type].has(oldId)) return idMap[type].get(oldId);
  const newId = new ObjectId();
  idMap[type].set(oldId, newId);
  return newId;
}

async function main() {
  console.log('\n🚀 PostgreSQL → MongoDB Migration (Final)\n');
  
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  const mongoClient = new MongoClient(MONGO_URL);
  
  try {
    await pgClient.connect();
    console.log('✅ PostgreSQL connected\n');
    
    await mongoClient.connect();
    const db = mongoClient.db('naijalingua');
    console.log('✅ MongoDB connected\n');
    
    const stats = {};
    
    // Users → users (@@map("users"))
    console.log('👥 Migrating users...');
    const { rows: users } = await pgClient.query('SELECT * FROM users');
    for (const u of users) {
      const newId = mapId('users', u.id);
      try {
        await db.collection('users').insertOne({
          _id: newId, name: u.name, email: u.email, passwordHash: u.passwordHash,
          role: u.role, profileImage: u.profileImage, bio: u.bio,
          suspended: u.suspended || false, banned: u.banned || false,
          createdAt: u.createdAt, updatedAt: u.updatedAt
        });
      } catch (e) { if (e.code !== 11000) console.log(`   ⚠️  ${u.email}:`, e.message); }
    }
    stats.users = users.length;
    console.log(`   ✅ ${users.length} users\n`);
    
    // Courses → courses (@@map("courses"))
    console.log('📚 Migrating courses...');
    const { rows: courses } = await pgClient.query('SELECT * FROM courses');
    for (const c of courses) {
      const newId = mapId('courses', c.id);
      const createdById = mapId('users', c.instructorId);
      if (!createdById) continue;
      try {
        await db.collection('courses').insertOne({
          _id: newId, title: c.title, description: c.description,
          language: c.language, level: c.level, imageUrl: c.thumbnail,
          price: c.price || 0, currency: c.currency || 'USD',
          category: c.category, tags: Array.isArray(c.tags) ? c.tags.join(',') : (c.tags || ''),
          isPublished: c.isPublished, isApproved: c.isApproved || false,
          createdById: createdById, createdAt: c.createdAt, updatedAt: c.updatedAt
        });
      } catch (e) { if (e.code !== 11000) console.log(`   ⚠️  ${c.title}:`, e.message); }
    }
    stats.courses = courses.length;
    console.log(`   ✅ ${courses.length} courses\n`);
    
    // Lessons → lessons (@@map("lessons"))
    console.log('📖 Migrating lessons...');
    const { rows: lessons } = await pgClient.query('SELECT * FROM lessons');
    for (const l of lessons) {
      const newId = mapId('lessons', l.id);
      const courseId = mapId('courses', l.courseId);
      if (!courseId) continue;
      try {
        await db.collection('lessons').insertOne({
          _id: newId, title: l.title, description: l.content,
          contentHtml: l.content, videoUrl: l.videoUrl, audioUrl: l.audioUrl,
          order: l.order, duration: l.duration || 0, isPublished: l.isPublished,
          courseId: courseId, createdAt: l.createdAt, updatedAt: l.updatedAt
        });
      } catch (e) { if (e.code !== 11000) console.log(`   ⚠️  ${l.title}:`, e.message); }
    }
    stats.lessons = lessons.length;
    console.log(`   ✅ ${lessons.length} lessons\n`);
    
    // Quizzes → quizzes (@@map("quizzes"))
    console.log('❓ Migrating quizzes...');
    const { rows: quizzes } = await pgClient.query('SELECT * FROM quizzes');
    for (const q of quizzes) {
      const newId = mapId('quizzes', q.id);
      const lessonId = mapId('lessons', q.lessonId);
      if (!lessonId) continue;
      try {
        await db.collection('quizzes').insertOne({
          _id: newId, type: 'MULTIPLE_CHOICE',
          question: q.question, options: q.options,
          correctAnswer: q.correctAnswer, explanation: q.explanation,
          lessonId: lessonId, createdAt: q.createdAt, updatedAt: q.updatedAt
        });
      } catch (e) { if (e.code !== 11000) console.log(`   ⚠️  Quiz:`, e.message); }
    }
    stats.quizzes = quizzes.length;
    console.log(`   ✅ ${quizzes.length} quizzes\n`);
    
    // Enrollments → enrollments (@@map("enrollments"))
    console.log('🎓 Migrating enrollments...');
    const { rows: enrollments } = await pgClient.query('SELECT * FROM enrollments');
    for (const e of enrollments) {
      const userId = mapId('users', e.userId);
      const courseId = mapId('courses', e.courseId);
      if (!userId || !courseId) continue;
      try {
        await db.collection('enrollments').insertOne({
          _id: new ObjectId(), userId, courseId,
          progress: e.progress || 0, totalScore: e.totalScore || 0,
          lessonsCompleted: e.lessonsCompleted || 0, quizzesCompleted: e.quizzesCompleted || 0,
          isCompleted: e.isCompleted || false, completedAt: e.completedAt, enrolledAt: e.enrolledAt,
          createdAt: e.createdAt, updatedAt: e.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Enrollment:`, err.message); }
    }
    stats.enrollments = enrollments.length;
    console.log(`   ✅ ${enrollments.length} enrollments\n`);
    
    // Lesson Progress → lesson_progress (@@map("lesson_progress"))
    console.log('📈 Migrating lesson progress...');
    const { rows: progress } = await pgClient.query('SELECT * FROM lesson_progress');
    for (const p of progress) {
      const userId = mapId('users', p.userId);
      const lessonId = mapId('lessons', p.lessonId);
      if (!userId || !lessonId) continue;
      try {
        await db.collection('lesson_progress').insertOne({
          _id: new ObjectId(), userId, lessonId,
          completed: p.completed, timeSpent: 0, completedAt: p.completedAt,
          createdAt: p.createdAt, updatedAt: p.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Progress:`, err.message); }
    }
    stats.progress = progress.length;
    console.log(`   ✅ ${progress.length} progress records\n`);
    
    // Quiz Attempts → quiz_attempts (@@map("quiz_attempts"))
    console.log('✍️  Migrating quiz attempts...');
    const { rows: attempts } = await pgClient.query('SELECT * FROM quiz_attempts');
    for (const a of attempts) {
      const userId = mapId('users', a.userId);
      const quizId = mapId('quizzes', a.quizId);
      if (!userId || !quizId) continue;
      try {
        await db.collection('quiz_attempts').insertOne({
          _id: new ObjectId(), userId, quizId,
          selectedAnswer: a.selectedAnswer, isCorrect: a.isCorrect,
          attemptedAt: a.attemptedAt, createdAt: a.createdAt, updatedAt: a.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Attempt:`, err.message); }
    }
    stats.attempts = attempts.length;
    console.log(`   ✅ ${attempts.length} quiz attempts\n`);
    
    // Certificates → certificates (@@map("certificates"))
    console.log('🎖️  Migrating certificates...');
    const { rows: certificates } = await pgClient.query('SELECT * FROM certificates');
    for (const c of certificates) {
      const userId = mapId('users', c.userId);
      const courseId = mapId('courses', c.courseId);
      if (!userId || !courseId) continue;
      try {
        await db.collection('certificates').insertOne({
          _id: new ObjectId(), userId, courseId,
          issuedAt: c.issuedAt, certificateUrl: c.certificateUrl,
          createdAt: c.createdAt, updatedAt: c.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Certificate:`, err.message); }
    }
    stats.certificates = certificates.length;
    console.log(`   ✅ ${certificates.length} certificates\n`);
    
    // Vocabulary → vocabulary (@@map("vocabulary"))
    console.log('📝 Migrating vocabulary...');
    const { rows: vocab } = await pgClient.query('SELECT * FROM vocabulary');
    for (const v of vocab) {
      const lessonId = mapId('lessons', v.lessonId);
      if (!lessonId) continue;
      try {
        await db.collection('vocabulary').insertOne({
          _id: new ObjectId(), word: v.word, translation: v.translation,
          pronunciation: v.pronunciation, audioUrl: v.audioUrl, language: 'YORUBA',
          lessonId: lessonId, createdAt: v.createdAt, updatedAt: v.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Vocab:`, err.message); }
    }
    stats.vocabulary = vocab.length;
    console.log(`   ✅ ${vocab.length} vocabulary items\n`);
    
    // Cultural Content → cultural_content (@@map("cultural_content"))
    console.log('🌍 Migrating cultural content...');
    const { rows: cultural } = await pgClient.query('SELECT * FROM cultural_content');
    for (const c of cultural) {
      const lessonId = mapId('lessons', c.lessonId);
      if (!lessonId) continue;
      try {
        await db.collection('cultural_content').insertOne({
          _id: new ObjectId(), title: c.title, description: c.content,
          content: c.content, imageUrl: c.imageUrl, language: 'YORUBA',
          lessonId: lessonId, createdAt: c.createdAt, updatedAt: c.updatedAt
        });
      } catch (err) { if (err.code !== 11000) console.log(`   ⚠️  Cultural:`, err.message); }
    }
    stats.cultural = cultural.length;
    console.log(`   ✅ ${cultural.length} cultural content\n`);
    
    // Summary
    console.log('='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!\n');
    console.log('📊 SUMMARY:');
    console.log(`   👥 Users:              ${stats.users}`);
    console.log(`   📚 Courses:            ${stats.courses}`);
    console.log(`   📖 Lessons:            ${stats.lessons}`);
    console.log(`   ❓ Quizzes:            ${stats.quizzes}`);
    console.log(`   🎓 Enrollments:        ${stats.enrollments}`);
    console.log(`   📈 Lesson Progress:    ${stats.progress}`);
    console.log(`   ✍️  Quiz Attempts:      ${stats.attempts}`);
    console.log(`   🎖️  Certificates:       ${stats.certificates}`);
    console.log(`   📝 Vocabulary:         ${stats.vocabulary}`);
    console.log(`   🌍 Cultural Content:   ${stats.cultural}`);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`\n   📦 TOTAL:              ${total} records`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  } finally {
    await pgClient.end();
    await mongoClient.close();
    console.log('🔌 Disconnected\n');
  }
}

main().catch(console.error);
