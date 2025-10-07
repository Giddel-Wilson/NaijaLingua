const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishAllLessons() {
  try {
    console.log('🔍 Checking lessons...\n');
    
    // Get all lessons
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        order: true,
        isPublished: true,
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    console.log(`Found ${lessons.length} lessons\n`);
    
    const unpublishedLessons = lessons.filter(l => !l.isPublished);
    console.log(`Unpublished lessons: ${unpublishedLessons.length}`);
    
    if (unpublishedLessons.length === 0) {
      console.log('✅ All lessons are already published!');
      await prisma.$disconnect();
      return;
    }
    
    console.log('\nUnpublished lessons:');
    unpublishedLessons.forEach(l => {
      console.log(`- ${l.course.title} - Lesson ${l.order}: ${l.title}`);
    });
    
    console.log('\n📝 Publishing all lessons...\n');
    
    // Publish all unpublished lessons
    const result = await prisma.lesson.updateMany({
      where: {
        isPublished: false
      },
      data: {
        isPublished: true
      }
    });
    
    console.log(`✅ Published ${result.count} lessons!`);
    
    // Verify
    const publishedCount = await prisma.lesson.count({
      where: {
        isPublished: true
      }
    });
    
    console.log(`\n📊 Total published lessons now: ${publishedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

publishAllLessons();
