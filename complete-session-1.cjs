const { PrismaClient } = require('@prisma/client');

async function completeSession1() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== COMPLETING SESSION 1 FOR TESTING ===\n');
    
    // Get the course and first lesson
    const course = await prisma.course.findUnique({
      where: { id: 'cmf25csrc000dkn3baxb9a7da' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    });
    
    if (!course || !course.lessons[0]) {
      console.log('❌ Course or first lesson not found');
      return;
    }
    
    const firstLesson = course.lessons[0];
    console.log(`First lesson: ${firstLesson.title}`);
    
    // Get a test user
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log(`User: ${user.name}\n`);
    
    // Check if lesson progress already exists
    let lessonProgress = await prisma.lessonProgress.findFirst({
      where: {
        userId: user.id,
        lessonId: firstLesson.id
      }
    });
    
    if (lessonProgress) {
      // Update existing progress
      lessonProgress = await prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          completed: true,
          timeSpent: 300 // 5 minutes
        }
      });
      console.log('✅ Updated existing lesson progress');
    } else {
      // Create new progress
      lessonProgress = await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId: firstLesson.id,
          completed: true,
          timeSpent: 300 // 5 minutes
        }
      });
      console.log('✅ Created new lesson progress');
    }
    
    console.log(`Session 1 marked as completed!`);
    console.log(`Time spent: ${Math.floor(lessonProgress.timeSpent / 60)}m`);
    console.log(`\nNow you should be able to navigate to other sessions!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeSession1();
