import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  try {
    console.log('Checking database structure...');
    
    // Check if we can query enrollments without totalScore
    const enrollmentCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM enrollments
    `;
    console.log('Enrollment count:', enrollmentCount);
    
    // Get column names for enrollments table
    const enrollmentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'enrollments' 
      ORDER BY ordinal_position
    `;
    console.log('Enrollment table columns:', enrollmentColumns);
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStructure();
