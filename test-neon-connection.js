import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔄 Testing Neon database connection...');
        
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Connected to Neon database successfully!');
        
        // Test query
        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users in database`);
        
        const courseCount = await prisma.course.count();
        console.log(`✅ Found ${courseCount} courses in database`);
        
        const lessonCount = await prisma.lesson.count();
        console.log(`✅ Found ${lessonCount} lessons in database`);
        
        // Check Basic Business course specifically
        const basicBusinessCourse = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            },
            include: {
                lessons: {
                    where: {
                        isPublished: true
                    }
                }
            }
        });
        
        if (basicBusinessCourse) {
            console.log(`✅ Found Basic Business course with ${basicBusinessCourse.lessons.length} published lessons`);
            basicBusinessCourse.lessons.forEach((lesson, index) => {
                console.log(`  ${index + 1}. ${lesson.title}`);
            });
        } else {
            console.log('❌ Basic Business course not found');
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
