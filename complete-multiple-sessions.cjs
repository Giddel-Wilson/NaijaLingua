const { PrismaClient } = require('@prisma/client');

async function completeMultipleSessions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== COMPLETING SESSIONS 2-4 FOR TESTING ===\n');
    
    // Get the course and lessons
    const course = await prisma.course.findUnique({
      where: { id: 'cmf25csrc000dkn3baxb9a7da' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          take: 4
        }
      }
    });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    // Get a test user
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log(`User: ${user.name}\n`);
    
    // Complete sessions 2, 3, and 4
    for (let i = 1; i < 4; i++) { // Skip session 1 (index 0) as it's already completed
      const lesson = course.lessons[i];
      if (!lesson) continue;
      
      console.log(`Completing Session ${i + 1}: ${lesson.title}`);
      
      // Check if lesson progress already exists
      let lessonProgress = await prisma.lessonProgress.findFirst({
        where: {
          userId: user.id,
          lessonId: lesson.id
        }
      });
      
      if (lessonProgress) {
        // Update existing progress
        await prisma.lessonProgress.update({
          where: { id: lessonProgress.id },
          data: {
            completed: true,
            timeSpent: 300 + (i * 60) // Vary time spent
          }
        });
      } else {
        // Create new progress
        await prisma.lessonProgress.create({
          data: {
            userId: user.id,
            lessonId: lesson.id,
            completed: true,
            timeSpent: 300 + (i * 60) // Vary time spent
          }
        });
      }
      
      console.log(`✅ Session ${i + 1} completed`);
    }
    
    console.log(`\nSessions 1-4 are now completed!`);
    console.log(`You should be able to navigate to Session 5 now.`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeMultipleSessions();
