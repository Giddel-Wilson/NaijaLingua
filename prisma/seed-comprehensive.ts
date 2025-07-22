import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NigerianLanguageAPI } from '../src/lib/api/nigerian-languages.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive Nigerian language courses...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@naijalingua.com' },
    update: {},
    create: {
      name: 'NaijaLingua Admin',
      email: 'admin@naijalingua.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      bio: 'Administrative account for managing NaijaLingua platform.',
      profileImage: null
    }
  });

  // Create sample students
  const student1 = await prisma.user.upsert({
    where: { email: 'student@naijalingua.com' },
    update: {},
    create: {
      name: 'Amina Mohammed',
      email: 'student@naijalingua.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      bio: 'Passionate about learning Nigerian languages and cultures.',
      profileImage: null
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'olumide@naijalingua.com' },
    update: {},
    create: {
      name: 'Olumide Adebayo',
      email: 'olumide@naijalingua.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      bio: 'Learning multiple Nigerian languages for cultural preservation.',
      profileImage: null
    }
  });

  // Seed comprehensive course data from our API
  console.log('📚 Creating courses from Nigerian Language API...');
  const createdCourses = await NigerianLanguageAPI.seedCoursesToDatabase(prisma, admin.id);
  
  console.log(`✅ Created ${createdCourses.length} courses from API`);

  // Create enrollments for students
  const enrollmentData: any[] = [];
  const certificateData: any[] = [];

  for (const course of createdCourses) {
    // Random enrollments
    if (Math.random() > 0.3) { // 70% chance student1 enrolls
      enrollmentData.push({
        userId: student1.id,
        courseId: course.id,
        progress: Math.floor(Math.random() * 100),
        score: null
      });
    }

    if (Math.random() > 0.4) { // 60% chance student2 enrolls
      enrollmentData.push({
        userId: student2.id,
        courseId: course.id,
        progress: Math.floor(Math.random() * 100),
        score: null
      });
    }
  }

  // Create enrollments
  for (const enrollment of enrollmentData) {
    await prisma.enrollment.create({
      data: enrollment
    });

    // Create certificates for completed courses (progress = 100)
    if (enrollment.progress >= 90) {
      certificateData.push({
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        score: 85 + Math.floor(Math.random() * 15), // Score between 85-100
        dateIssued: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Random date within last 90 days
      });
    }
  }

  // Create certificates
  for (const certificate of certificateData) {
    await prisma.certificate.create({
      data: certificate
    });
  }

  // Create quizzes for some lessons
  const lessons = await prisma.lesson.findMany({
    take: 10 // Get first 10 lessons
  });

  const quizData = [
    {
      type: 'MCQ' as const,
      question: 'How do you say "Good morning" in Yoruba?',
      options: JSON.stringify(['E kaaro', 'E kaasan', 'E kaale', 'O daaro']),
      correctAnswer: 'E kaaro',
      explanation: 'E kaaro is the correct way to say good morning in Yoruba.',
      order: 1
    },
    {
      type: 'MCQ' as const,
      question: 'What is the number 5 in Yoruba?',
      options: JSON.stringify(['Erin', 'Marun', 'Mefa', 'Meje']),
      correctAnswer: 'Marun',
      explanation: 'Marun means five in Yoruba.',
      order: 2
    },
    {
      type: 'MCQ' as const,
      question: 'How do you say "Hello" in Igbo?',
      options: JSON.stringify(['Kedu', 'Ndewo', 'Ututu oma', 'Dalu']),
      correctAnswer: 'Ndewo',
      explanation: 'Ndewo is the most common way to say hello in Igbo.',
      order: 1
    },
    {
      type: 'MCQ' as const,
      question: 'How do you say "Thank you" in Hausa?',
      options: JSON.stringify(['Sannu', 'Na gode', 'Lafiya lau', 'Ba komai']),
      correctAnswer: 'Na gode',
      explanation: 'Na gode is the way to say thank you in Hausa.',
      order: 1
    }
  ];

  for (let i = 0; i < Math.min(lessons.length, quizData.length); i++) {
    await prisma.quiz.create({
      data: {
        lessonId: lessons[i].id,
        ...quizData[i]
      }
    });
  }

  // Statistics
  const stats = {
    courses: await prisma.course.count(),
    users: await prisma.user.count(),
    lessons: await prisma.lesson.count(),
    enrollments: await prisma.enrollment.count(),
    certificates: await prisma.certificate.count(),
    quizzes: await prisma.quiz.count()
  };

  console.log('\n✅ Database seeding completed successfully!');
  console.log('📊 Final Statistics:');
  console.log(`👨‍🎓 Users: ${stats.users}`);
  console.log(`📚 Courses: ${stats.courses}`);
  console.log(`📖 Lessons: ${stats.lessons}`);
  console.log(`🎓 Enrollments: ${stats.enrollments}`);
  console.log(`🏆 Certificates: ${stats.certificates}`);
  console.log(`❓ Quizzes: ${stats.quizzes}`);
  
  console.log('\n🔐 Test Accounts:');
  console.log('Admin: admin@naijalingua.com / admin123');
  console.log('Student: student@naijalingua.com / admin123');
  console.log('Student: olumide@naijalingua.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
