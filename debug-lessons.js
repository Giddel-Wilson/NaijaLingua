import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function debugLessons() {
  try {
    const courseId = 'cm23cao00dln3ba6b9a7da';
    
    console.log('=== DEBUGGING COURSE LESSONS ===');
    
    // Get course info
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });
    
    console.log('Course info:', course);
    
    // Get ALL lessons (published and unpublished)
    const allLessons = await db.lesson.findMany({
      where: { courseId: courseId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        order: true,
        createdAt: true
      },
      orderBy: { order: 'asc' }
    });
    
    console.log('\n=== ALL LESSONS ===');
    console.log(`Total lessons found: ${allLessons.length}`);
    allLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title} (Published: ${lesson.isPublished}, Order: ${lesson.order})`);
    });
    
    // Get only published lessons
    const publishedLessons = allLessons.filter(l => l.isPublished);
    console.log(`\n=== PUBLISHED LESSONS ===`);
    console.log(`Published lessons: ${publishedLessons.length}`);
    publishedLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title} (Order: ${lesson.order})`);
    });
    
    if (publishedLessons.length === 0) {
      console.log('\n❌ NO PUBLISHED LESSONS FOUND!');
      console.log('This explains why the course appears empty.');
      console.log('Fixing by publishing all lessons...');
      
      // Update all lessons to be published
      const updateResult = await db.lesson.updateMany({
        where: { courseId: courseId },
        data: { isPublished: true }
      });
      
      console.log(`✅ Updated ${updateResult.count} lessons to published status`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

debugLessons();
