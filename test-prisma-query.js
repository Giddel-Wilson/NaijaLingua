import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function testQuery() {
  try {
    console.log('🔍 Testing Prisma query...\n');
    
    const course = await prisma.course.findUnique({
      where: { id: '68e39960a782038f0f1ae158' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            quizzes: true,
            _count: {
              select: { progress: true }
            }
          }
        },
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });
    
    console.log('✅ Query successful!');
    console.log(`Course: ${course.title}`);
    console.log(`Lessons: ${course.lessons.length}`);
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
