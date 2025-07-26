import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to database...');
    
    // Add missing columns to courses table
    const alterCourseQueries = [
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS price FLOAT DEFAULT 0;',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT \'USD\';',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(255);',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT false;'
    ];
    
    for (const query of alterCourseQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Executed:', query);
      } catch (error) {
        console.log('⚠️  Column might already exist:', query);
      }
    }
    
    // Add missing columns to enrollments table
    const alterEnrollmentQueries = [
      'ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "totalScore" FLOAT DEFAULT 0;',
      'ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "lessonsCompleted" INTEGER DEFAULT 0;',
      'ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "quizzesCompleted" INTEGER DEFAULT 0;',
      'ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "isCompleted" BOOLEAN DEFAULT false;',
      'ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;'
    ];
    
    for (const query of alterEnrollmentQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Executed:', query);
      } catch (error) {
        console.log('⚠️  Column might already exist:', query);
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
