import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function debugSpecificCourse() {
  try {
    const courseId = 'cmf23cao00dln3ba6b9a7da'; // The ID from your Neon database
    
    console.log(`Looking for course with ID: ${courseId}`);
    console.log('Testing Neon database connection...');
    
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: {
            isPublished: true
          }
        },
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });
    
    if (course) {
      console.log('✅ Found course:', course.title);
      console.log(`📚 Course has ${course.lessons.length} published lessons`);
      console.log(`📊 Total lesson count: ${course._count.lessons}`);
      console.log('Lessons:', course.lessons.map(l => l.title));
    } else {
      console.log('❌ Course not found!');
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

debugSpecificCourse();
