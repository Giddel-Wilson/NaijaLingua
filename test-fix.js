import { PrismaClient } from '@prisma/client';
import { enhancedContentGenerator } from './src/lib/content-generation.ts';

const prisma = new PrismaClient();

async function testCourseWithContent() {
  console.log('🚀 Testing course creation with content generation...');
  
  try {
    // Create a test course
    console.log('Creating test course...');
    const testCourse = await prisma.course.create({
      data: {
        title: 'Test AI Generated Course',
        description: 'A test course with AI generated content',
        language: 'IGBO',
        level: 'BEGINNER',
        tags: 'test,auto-generated,ai-generated,greetings',
        price: 0,
        isPublished: false,
        createdById: 'cm63bzhfq000029wcsrphb7jt' // Use a valid user ID from the database
      }
    });
    
    console.log(`✅ Course created: ${testCourse.title} (ID: ${testCourse.id})`);
    
    // Generate content for the course
    console.log('Generating content...');
    const result = await enhancedContentGenerator.generateCourseContent(
      'igbo',
      'BEGINNER',
      'greetings'
    );
    
    if (result.success && result.lessons && result.lessons.length > 0) {
      console.log(`✅ Generated ${result.lessons.length} lessons`);
      
      // Save lessons to database
      for (const lessonData of result.lessons) {
        const contentString = typeof lessonData.content === 'string' 
          ? lessonData.content 
          : JSON.stringify(lessonData.content);
        
        const lesson = await prisma.lesson.create({
          data: {
            title: lessonData.title || `Lesson ${lessonData.lessonNumber || 1}`,
            contentHtml: contentString,
            order: lessonData.lessonNumber || lessonData.order || 1,
            courseId: testCourse.id,
            duration: lessonData.estimatedDuration || lessonData.duration || 15,
            isPublished: false
          }
        });

        console.log(`✅ Created lesson: ${lesson.title} (ID: ${lesson.id})`);
      }
      
      // Check the course now has lessons
      const courseWithLessons = await prisma.course.findUnique({
        where: { id: testCourse.id },
        include: { lessons: true }
      });
      
      console.log(`✅ Course now has ${courseWithLessons.lessons.length} lessons`);
      
    } else {
      console.log('❌ Content generation failed or returned no lessons');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseWithContent();
