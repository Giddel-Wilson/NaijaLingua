import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testEnrollmentQuery() {
  try {
    console.log('Testing enrollment query...');
    
    const enrollments = await prisma.enrollment.findMany({
      take: 1
    });
    
    console.log('✅ Enrollment query successful');
    console.log('Sample enrollment:', enrollments[0] ? Object.keys(enrollments[0]) : 'No enrollments found');
    
  } catch (error) {
    console.error('❌ Enrollment query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEnrollmentQuery();
