const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listLessons() {
  try {
    const lessons = await prisma.lesson.findMany({
      select: { 
        id: true, 
        title: true, 
        courseId: true,
        contentHtml: true
      },
      take: 5
    });
    
    console.log('Found', lessons.length, 'lessons:');
    lessons.forEach((lesson, i) => {
      console.log(`${i+1}. ID: ${lesson.id}`);
      console.log(`   Title: ${lesson.title}`);
      console.log(`   Course: ${lesson.courseId}`);
      console.log(`   Has content: ${!!lesson.contentHtml}`);
      console.log(`   Content length: ${lesson.contentHtml?.length || 0}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listLessons();
