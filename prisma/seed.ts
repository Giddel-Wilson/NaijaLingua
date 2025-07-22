import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@naijalingua.com' },
    update: {},
    create: {
      name: 'Dr. Adebayo Johnson',
      email: 'instructor@naijalingua.com',
      passwordHash: hashedPassword,
      role: 'TUTOR',
      bio: 'Expert in Nigerian languages with 15 years of teaching experience.',
      profileImage: null
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@naijalingua.com' },
    update: {},
    create: {
      name: 'Amina Mohammed',
      email: 'student@naijalingua.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      bio: 'Passionate about learning Nigerian languages.',
      profileImage: null
    }
  });

  // Create sample courses
  const yorubaCourse = await prisma.course.create({
    data: {
      title: 'Learn Yoruba from Scratch',
      description: 'A comprehensive course to learn Yoruba language from basics to intermediate level. Perfect for beginners who want to understand and speak Yoruba fluently.',
      language: 'YORUBA',
      level: 'BEGINNER',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  const igboCourse = await prisma.course.create({
    data: {
      title: 'Intermediate Igbo Language',
      description: 'Build upon your basic Igbo knowledge with this intermediate course. Learn complex grammar, cultural expressions, and advanced vocabulary.',
      language: 'IGBO',
      level: 'INTERMEDIATE',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  const hausaCourse = await prisma.course.create({
    data: {
      title: 'Advanced Hausa Communication',
      description: 'Master advanced Hausa language skills for professional and cultural communication. Focus on business language and cultural nuances.',
      language: 'HAUSA',
      level: 'ADVANCED',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  const pidginCourse = await prisma.course.create({
    data: {
      title: 'Nigerian Pidgin English',
      description: 'Learn the widely spoken Nigerian Pidgin English. Understand everyday expressions, slang, and cultural context.',
      language: 'EDO', // Using EDO as placeholder since PIDGIN is not in enum
      level: 'BEGINNER',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  // Create sample lessons for Yoruba course
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: yorubaCourse.id,
      title: 'Basic Greetings in Yoruba',
      contentHtml: '<h2>Welcome to Yoruba Greetings</h2><p>Learn how to greet people in Yoruba...</p>',
      order: 1,
      isPublished: true
    }
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: yorubaCourse.id,
      title: 'Numbers and Counting',
      contentHtml: '<h2>Yoruba Numbers</h2><p>Learn to count from 1 to 100 in Yoruba...</p>',
      order: 2,
      isPublished: true
    }
  });

  // Create sample lessons for other courses
  await prisma.lesson.createMany({
    data: [
      {
        courseId: igboCourse.id,
        title: 'Igbo Grammar Fundamentals',
        contentHtml: '<h2>Understanding Igbo Grammar</h2>',
        order: 1,
        isPublished: true
      },
      {
        courseId: hausaCourse.id,
        title: 'Business Hausa Vocabulary',
        contentHtml: '<h2>Professional Hausa Terms</h2>',
        order: 1,
        isPublished: true
      },
      {
        courseId: pidginCourse.id,
        title: 'Everyday Pidgin Expressions',
        contentHtml: '<h2>Common Pidgin Phrases</h2>',
        order: 1,
        isPublished: true
      }
    ]
  });

  // Create sample enrollment for the student
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: yorubaCourse.id,
      progress: 45.5,
      score: null
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: pidginCourse.id,
      progress: 0,
      score: null
    }
  });

  // Create a sample certificate for completed course
  await prisma.certificate.create({
    data: {
      userId: student.id,
      courseId: igboCourse.id,
      score: 87.5,
      dateIssued: new Date('2024-01-15')
    }
  });

  // Create sample quizzes
  await prisma.quiz.createMany({
    data: [
      {
        lessonId: lesson1.id,
        type: 'MCQ',
        question: 'How do you say "Good morning" in Yoruba?',
        options: JSON.stringify(['E kaaro', 'E kaaale', 'E ku aaro', 'Pele']),
        correctAnswer: 'E kaaro',
        explanation: 'E kaaro is the correct way to say good morning in Yoruba.',
        order: 1
      },
      {
        lessonId: lesson2.id,
        type: 'MCQ',
        question: 'What is the number 5 in Yoruba?',
        options: JSON.stringify(['Erin', 'Marun', 'Mefa', 'Meje']),
        correctAnswer: 'Marun',
        explanation: 'Marun means five in Yoruba.',
        order: 1
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📚 Created ${await prisma.course.count()} courses`);
  console.log(`👨‍🏫 Created ${await prisma.user.count()} users`);
  console.log(`📖 Created ${await prisma.lesson.count()} lessons`);
  console.log(`🎓 Created ${await prisma.enrollment.count()} enrollments`);
  console.log(`🏆 Created ${await prisma.certificate.count()} certificates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
