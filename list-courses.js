import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function listCourses() {
  try {
    const courses = await db.course.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        _count: {
          select: {
            lessons: {
              where: {
                isPublished: true
              }
            }
          }
        }
      }
    });
    
    console.log('Available courses:');
    courses.forEach(course => {
      console.log(`- ${course.title} (ID: ${course.id}) - Published: ${course.isPublished} - Lessons: ${course._count.lessons}`);
    });
    
    // Also check lessons specifically
    const lessons = await db.lesson.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        courseId: true
      }
    });
    
    console.log('\nAvailable lessons:');
    lessons.forEach(lesson => {
      console.log(`- ${lesson.title} (Course: ${lesson.courseId}) - Published: ${lesson.isPublished}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

listCourses();
