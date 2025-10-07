import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();
const mongoUrl = process.env.DATABASE_URL;

async function fixDataIntegrity() {
  console.log('🔧 Starting data integrity fixes...\n');

  // Connect directly to MongoDB to bypass Prisma validation
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const db = client.db();

  try {
    // Fix 1: Update enrollments with null startedAt
    console.log('📋 Fix 1: Updating enrollments with null startedAt...');
    const enrollmentsResult = await db.collection('enrollments').updateMany(
      { startedAt: null },
      { $set: { startedAt: new Date() } }
    );
    console.log(`✅ Updated ${enrollmentsResult.modifiedCount} enrollment(s) with null startedAt\n`);

    // Fix 2: Update quizzes with MULTIPLE_CHOICE to MCQ
    console.log('📋 Fix 2: Updating quizzes with MULTIPLE_CHOICE type...');
    const quizzesResult = await db.collection('quizzes').updateMany(
      { type: 'MULTIPLE_CHOICE' },
      { $set: { type: 'MCQ' } }
    );
    console.log(`✅ Updated ${quizzesResult.modifiedCount} quiz(zes) from MULTIPLE_CHOICE to MCQ\n`);

    // Verify fixes
    console.log('🔍 Verifying fixes...');
    const nullStartedAt = await db.collection('enrollments').countDocuments({ startedAt: null });
    const multipleChoice = await db.collection('quizzes').countDocuments({ type: 'MULTIPLE_CHOICE' });
    
    console.log(`\n📊 Verification Results:`);
    console.log(`   Enrollments with null startedAt: ${nullStartedAt}`);
    console.log(`   Quizzes with MULTIPLE_CHOICE: ${multipleChoice}`);
    
    if (nullStartedAt === 0 && multipleChoice === 0) {
      console.log('\n✅ All data integrity issues fixed!');
    } else {
      console.log('\n⚠️ Some issues may still exist');
    }

  } catch (error) {
    console.error('❌ Error fixing data:', error);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

fixDataIntegrity();
