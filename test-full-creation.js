import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testCourseCreation() {
    try {
        console.log('🧪 Testing course creation with AI content...');
        
        // Create a test course
        const course = await db.course.create({
            data: {
                title: 'Test Food Course',
                description: 'Testing AI content generation for food and eating',
                language: 'IGBO',
                level: 'BEGINNER',
                tags: 'Language Learning,auto-generated,ai-generated,food_and_eating',
                price: 0,
                isPublished: false,
                createdById: 'test-admin-id'
            }
        });
        
        console.log('✅ Created test course:', course.title, 'ID:', course.id);
        
        // Now test the content generation API
        const response = await fetch('http://localhost:5174/api/content-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: 'igbo',
                level: 'beginner',
                topic: 'food_and_eating',
                courseId: course.id
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('📊 Content generation result:', result.success ? 'Success' : 'Failed');
            
            if (result.success) {
                // Check if lessons were created
                const lessons = await db.lesson.findMany({
                    where: { courseId: course.id },
                    include: {
                        vocabulary: true
                    }
                });
                
                console.log(`📚 Created ${lessons.length} lessons`);
                lessons.forEach((lesson, idx) => {
                    console.log(`  ${idx + 1}. ${lesson.title} - ${lesson.vocabulary.length} vocabulary items`);
                });
                
                if (lessons.length > 0) {
                    console.log('🎉 AI content generation working correctly!');
                } else {
                    console.log('⚠️ Lessons were not saved to database');
                }
            } else {
                console.log('❌ Content generation failed:', result.error);
            }
        } else {
            console.log('❌ API request failed:', response.status, response.statusText);
        }
        
        // Clean up test course
        await db.vocabulary.deleteMany({ where: { lesson: { courseId: course.id } } });
        await db.lesson.deleteMany({ where: { courseId: course.id } });
        await db.course.delete({ where: { id: course.id } });
        console.log('🧹 Cleaned up test course');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await db.$disconnect();
    }
}

testCourseCreation();
