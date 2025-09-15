const { PrismaClient } = require('@prisma/client');

async function completeLesson5() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== MARKING LESSON 5 AS COMPLETED ===\n');
    
    // Find the Demo Student user
    const user = await prisma.user.findUnique({
      where: { email: 'student@naijalingua.com' },
      select: { id: true, name: true }
    });
    
    if (!user) {
      console.log('❌ Demo Student user not found');
      return;
    }
    
    // Get lesson 5
    const lesson5 = await prisma.lesson.findFirst({
      where: { 
        course: { id: 'cmf25csrc000dkn3baxb9a7da' },
        order: 5
      }
    });
    
    if (!lesson5) {
      console.log('❌ Lesson 5 not found');
      return;
    }
    
    console.log(`User: ${user.name}`);
    console.log(`Lesson: ${lesson5.title}`);
    
    // Update lesson progress to completed
    const updated = await prisma.lessonProgress.updateMany({
      where: {
        userId: user.id,
        lessonId: lesson5.id
      },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });
    
    if (updated.count > 0) {
      console.log(`✅ Lesson 5 marked as completed for ${user.name}`);
      console.log(`✅ This should unlock Lesson 6 for navigation`);
      
      // Check what lesson 6 is
      const lesson6 = await prisma.lesson.findFirst({
        where: { 
          course: { id: 'cmf25csrc000dkn3baxb9a7da' },
          order: 6
        },
        select: { id: true, title: true, order: true }
      });
      
      if (lesson6) {
        console.log(`\nNext lesson available: ${lesson6.title} (Session ${lesson6.order})`);
        console.log(`You should now be able to navigate to Session 6`);
      } else {
        console.log(`\nNo lesson 6 found - Session 5 might be the final lesson`);
      }
      
    } else {
      console.log('❌ No lesson progress record found to update');
      
      // Create new lesson progress record
      await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId: lesson5.id,
          completed: true,
          completedAt: new Date(),
          timeSpent: 665 // Use existing time
        }
      });
      
      console.log(`✅ Created new completed lesson progress for ${user.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

completeLesson5();