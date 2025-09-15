const { PrismaClient } = require('@prisma/client');

async function testSessionNavigation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== TESTING SESSION NAVIGATION ===\n');
    
    // Get the course and lessons
    const course = await prisma.course.findUnique({
      where: { id: 'cmf25csrc000dkn3baxb9a7da' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { quizzes: true }
        }
      }
    });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    console.log(`✅ Course: ${course.title}`);
    console.log(`Total Sessions: ${course.lessons.length}\n`);
    
    // Get a test user
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log(`Testing with user: ${user.name}\n`);
    
    // Get lesson progress for this user
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: {
          in: course.lessons.map(l => l.id)
        }
      }
    });
    
    console.log('=== SESSION STATUS ===');
    course.lessons.forEach((lesson, index) => {
      const sessionNumber = index + 1;
      const progress = lessonProgress.find(p => p.lessonId === lesson.id);
      const isCompleted = progress?.completed || false;
      const timeSpent = progress ? Math.floor(progress.timeSpent / 60) : 0;
      
      console.log(`Session ${sessionNumber}: ${lesson.title}`);
      console.log(`  - Status: ${isCompleted ? '✅ Completed' : '🔄 In Progress'}`);
      console.log(`  - Time Spent: ${timeSpent}m`);
      console.log(`  - Quizzes: ${lesson.quizzes.length}`);
      
      // Check if session should be locked
      let isLocked = false;
      if (sessionNumber > 1) {
        for (let i = 0; i < sessionNumber - 1; i++) {
          const prevLessonId = course.lessons[i]?.id;
          const prevProgress = lessonProgress.find(p => p.lessonId === prevLessonId);
          if (!prevProgress || !prevProgress.completed) {
            isLocked = true;
            break;
          }
        }
      }
      
      console.log(`  - Navigation: ${isLocked ? '🔒 Locked' : '🔓 Available'}`);
      console.log('');
    });
    
    console.log('=== NAVIGATION URLS ===');
    course.lessons.forEach((lesson, index) => {
      const sessionNumber = index + 1;
      console.log(`Session ${sessionNumber}: /dashboard/courses/${course.id}?session=${sessionNumber}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSessionNavigation();
