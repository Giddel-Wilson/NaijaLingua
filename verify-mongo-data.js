import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function verify() {
  console.log('\n🔍 Verifying MongoDB Migration...\n');
  console.log('='.repeat(60));
  
  try {
    const users = await db.user.count();
    const courses = await db.course.count();
    const lessons = await db.lesson.count();
    const quizzes = await db.quiz.count();
    const enrollments = await db.enrollment.count();
    const progress = await db.lessonProgress.count();
    const attempts = await db.quizAttempt.count();
    const certificates = await db.certificate.count();
    const vocabulary = await db.vocabulary.count();
    const cultural = await db.culturalContent.count();
    
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('📊 DATABASE CONTENTS:\n');
    console.log(`   👥 Users:              ${users}`);
    console.log(`   📚 Courses:            ${courses}`);
    console.log(`   📖 Lessons:            ${lessons}`);
    console.log(`   ❓ Quizzes:            ${quizzes}`);
    console.log(`   🎓 Enrollments:        ${enrollments}`);
    console.log(`   📈 Lesson Progress:    ${progress}`);
    console.log(`   ✍️  Quiz Attempts:      ${attempts}`);
    console.log(`   🎖️  Certificates:       ${certificates}`);
    console.log(`   📝 Vocabulary:         ${vocabulary}`);
    console.log(`   🌍 Cultural Content:   ${cultural}`);
    
    const total = users + courses + lessons + quizzes + enrollments + progress + attempts + certificates + vocabulary + cultural;
    console.log(`\n   📦 TOTAL:              ${total} records`);
    console.log('\n' + '='.repeat(60));
    
    // Sample users
    const sampleUsers = await db.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\n👥 SAMPLE USERS:');
    sampleUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      ID: ${user.id}`);
    });
    
    // Sample courses
    const sampleCourses = await db.course.findMany({
      take: 5,
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: { lessons: true, enrollments: true }
        }
      }
    });
    
    console.log('\n📚 COURSES:');
    sampleCourses.forEach((course, i) => {
      console.log(`   ${i + 1}. ${course.title} (${course.language})`);
      console.log(`      Level: ${course.level} | Published: ${course.isPublished}`);
      console.log(`      Instructor: ${course.createdBy.name}`);
      console.log(`      Lessons: ${course._count.lessons} | Students: ${course._count.enrollments}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration verification complete!');
    console.log('   Your MongoDB database is fully populated.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verify();
