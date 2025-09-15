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

  // Create sample courses - Only Igbo courses
  const igboBeginnerCourse = await prisma.course.create({
    data: {
      title: 'Igbo for Beginners',
      description: 'Start your Igbo language journey from scratch. Learn basic greetings, numbers, and everyday expressions with cultural context.',
      language: 'IGBO',
      level: 'BEGINNER',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  const igboIntermediateCourse = await prisma.course.create({
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

  const igboAdvancedCourse = await prisma.course.create({
    data: {
      title: 'Advanced Igbo Culture & Communication',
      description: 'Master advanced Igbo language skills and dive deep into Igbo culture, proverbs, traditional stories, and sophisticated communication.',
      language: 'IGBO',
      level: 'ADVANCED',
      imageUrl: null,
      isPublished: true,
      createdById: instructor.id
    }
  });

  // Create sample lessons for Igbo beginner course
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: igboBeginnerCourse.id,
      title: 'Basic Greetings in Igbo',
      contentHtml: '<h2>Welcome to Igbo Greetings</h2><p>Learn how to greet people in Igbo language...</p>',
      order: 1,
      isPublished: true
    }
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: igboBeginnerCourse.id,
      title: 'Numbers and Counting in Igbo',
      contentHtml: '<h2>Igbo Numbers</h2><p>Learn to count from 1 to 100 in Igbo language...</p>',
      order: 2,
      isPublished: true
    }
  });

  // Create sample lessons for other Igbo courses
  await prisma.lesson.createMany({
    data: [
      {
        courseId: igboIntermediateCourse.id,
        title: 'Igbo Grammar Fundamentals',
        contentHtml: '<h2>Understanding Igbo Grammar</h2><p>Master the fundamentals of Igbo grammar structure...</p>',
        order: 1,
        isPublished: true
      },
      {
        courseId: igboIntermediateCourse.id,
        title: 'Igbo Cultural Expressions',
        contentHtml: '<h2>Igbo Proverbs and Sayings</h2><p>Learn common Igbo proverbs and their meanings...</p>',
        order: 2,
        isPublished: true
      },
      {
        courseId: igboAdvancedCourse.id,
        title: 'Advanced Igbo Literature',
        contentHtml: '<h2>Igbo Traditional Stories</h2><p>Explore rich Igbo folktales and literature...</p>',
        order: 1,
        isPublished: true
      }
    ]
  });

  // Create sample enrollment for the student
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: igboBeginnerCourse.id,
      progress: 45.5,
      score: null
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: igboIntermediateCourse.id,
      progress: 0,
      score: null
    }
  });

  // Create a sample certificate for completed course
  await prisma.certificate.create({
    data: {
      userId: student.id,
      courseId: igboIntermediateCourse.id,
      score: 87.5,
      dateIssued: new Date('2024-01-15')
    }
  });

  // Create sample quizzes for Igbo courses
  await prisma.quiz.createMany({
    data: [
      {
        lessonId: lesson1.id,
        type: 'MCQ',
        question: 'How do you say "Good morning" in Igbo?',
        options: JSON.stringify(['Ụtụtụ ọma', 'Ehihie ọma', 'Mgbede ọma', 'Abalị ọma']),
        correctAnswer: 'Ụtụtụ ọma',
        explanation: 'Ụtụtụ ọma is the correct way to say good morning in Igbo.',
        order: 1
      },
      {
        lessonId: lesson2.id,
        type: 'MCQ',
        question: 'What is the number 5 in Igbo?',
        options: JSON.stringify(['Anọ', 'Ise', 'Isii', 'Asaa']),
        correctAnswer: 'Ise',
        explanation: 'Ise means five in Igbo.',
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
