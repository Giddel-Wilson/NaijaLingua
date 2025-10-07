/**
 * Complete Database Viewer - Shows all data in tabular format
 */

import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

const db = new PrismaClient();

// Helper to format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Helper to truncate text
function truncate(text, length = 40) {
  if (!text) return 'N/A';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

async function viewDatabase() {
  console.log('\n' + '═'.repeat(100));
  console.log(chalk.bold.cyan('                           📊 NAIJALINGUA DATABASE VIEWER'));
  console.log('═'.repeat(100) + '\n');

  try {
    // ========== USERS ==========
    console.log(chalk.bold.yellow('👥 USERS'));
    console.log('─'.repeat(100));
    const users = await db.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    if (users.length > 0) {
      console.log(chalk.gray('ID                        │ Name                  │ Email                      │ Role      │ Status    │ Created'));
      console.log('─'.repeat(100));
      users.forEach(u => {
        const status = u.banned ? 'BANNED' : u.suspended ? 'SUSPENDED' : 'ACTIVE';
        const statusColor = status === 'ACTIVE' ? chalk.green : chalk.red;
        console.log(
          `${u.id.substring(0, 24)} │ ${truncate(u.name, 20).padEnd(20)} │ ${truncate(u.email, 25).padEnd(25)} │ ${u.role.padEnd(9)} │ ${statusColor(status.padEnd(9))} │ ${formatDate(u.createdAt)}`
        );
      });
      console.log(chalk.bold(`\nTotal Users: ${users.length}\n`));
    } else {
      console.log(chalk.gray('No users found.\n'));
    }

    // ========== COURSES ==========
    console.log(chalk.bold.yellow('📚 COURSES'));
    console.log('─'.repeat(100));
    const courses = await db.course.findMany({
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { lessons: true, enrollments: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (courses.length > 0) {
      console.log(chalk.gray('ID                        │ Title                      │ Language │ Level    │ Instructor          │ Lessons │ Students │ Published'));
      console.log('─'.repeat(100));
      courses.forEach(c => {
        const pubStatus = c.isPublished ? chalk.green('✓ Yes') : chalk.red('✗ No');
        console.log(
          `${c.id.substring(0, 24)} │ ${truncate(c.title, 25).padEnd(25)} │ ${c.language.padEnd(8)} │ ${c.level.padEnd(8)} │ ${truncate(c.createdBy.name, 19).padEnd(19)} │ ${String(c._count.lessons).padEnd(7)} │ ${String(c._count.enrollments).padEnd(8)} │ ${pubStatus}`
        );
      });
      console.log(chalk.bold(`\nTotal Courses: ${courses.length}\n`));
    } else {
      console.log(chalk.gray('No courses found.\n'));
    }

    // ========== LESSONS ==========
    console.log(chalk.bold.yellow('📖 LESSONS'));
    console.log('─'.repeat(100));
    const lessons = await db.lesson.findMany({
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }]
    });
    
    if (lessons.length > 0) {
      console.log(chalk.gray('ID                        │ Title                      │ Course ID (24 chars)      │ Order │ Duration │ Published'));
      console.log('─'.repeat(100));
      lessons.forEach(l => {
        const pubStatus = l.isPublished ? chalk.green('✓') : chalk.red('✗');
        const duration = l.duration ? `${l.duration}m` : 'N/A';
        const courseId = l.courseId ? l.courseId.substring(0, 24) : chalk.red('ORPHANED');
        console.log(
          `${l.id.substring(0, 24)} │ ${truncate(l.title, 25).padEnd(25)} │ ${courseId.padEnd(25)} │ ${String(l.order).padEnd(5)} │ ${duration.padEnd(8)} │ ${pubStatus}`
        );
      });
      console.log(chalk.bold(`\nTotal Lessons: ${lessons.length}\n`));
    } else {
      console.log(chalk.gray('No lessons found.\n'));
    }

    // ========== ENROLLMENTS ==========
    console.log(chalk.bold.yellow('🎓 ENROLLMENTS'));
    console.log('─'.repeat(100));
    
    // Use raw MongoDB to bypass Prisma validation issues
    const enrollments = await db.$runCommandRaw({
      find: 'enrollments',
      filter: {}
    }).then(result => result.cursor.firstBatch).catch(() => []);
    
    if (enrollments.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Course ID (24 chars)      │ Progress │ Lessons │ Quizzes │ Score │ Started    │ Completed'));
      console.log('─'.repeat(100));
      enrollments.forEach(e => {
        const completed = e.isCompleted ? chalk.green('✓ Yes') : chalk.yellow('In Progress');
        const progress = `${Math.round(e.progress)}%`;
        const startDate = e.startedAt || e.enrolledAt || e.createdAt || 'N/A';
        const userId = String(e.userId);
        const courseId = String(e.courseId);
        console.log(
          `${userId.substring(0, 24)} │ ${courseId.substring(0, 24)} │ ${progress.padEnd(8)} │ ${String(e.lessonsCompleted).padEnd(7)} │ ${String(e.quizzesCompleted).padEnd(7)} │ ${String(e.totalScore || 0).padEnd(5)} │ ${formatDate(startDate).padEnd(10)} │ ${completed}`
        );
      });
      console.log(chalk.bold(`\nTotal Enrollments: ${enrollments.length}\n`));
    } else {
      console.log(chalk.gray('No enrollments found.\n'));
    }

    // ========== LESSON PROGRESS ==========
    console.log(chalk.bold.yellow('📈 LESSON PROGRESS'));
    console.log('─'.repeat(100));
    const progress = await db.lessonProgress.findMany({
      orderBy: { completedAt: 'desc' },
      take: 20 // Show latest 20
    });
    
    if (progress.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Lesson ID (24 chars)      │ Completed │ Time Spent │ Completed At'));
      console.log('─'.repeat(100));
      progress.forEach(p => {
        const status = p.completed ? chalk.green('✓ Yes') : chalk.yellow('In Progress');
        const timeSpent = p.timeSpent ? `${p.timeSpent}s` : 'N/A';
        console.log(
          `${p.userId.substring(0, 24)} │ ${p.lessonId.substring(0, 24)} │ ${status.padEnd(18)} │ ${timeSpent.padEnd(10)} │ ${formatDate(p.completedAt)}`
        );
      });
      console.log(chalk.bold(`\nShowing latest 20 of ${progress.length} records\n`));
    } else {
      console.log(chalk.gray('No lesson progress found.\n'));
    }

    // ========== QUIZZES ==========
    console.log(chalk.bold.yellow('❓ QUIZZES'));
    console.log('─'.repeat(100));
    const quizzes = await db.quiz.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    if (quizzes.length > 0) {
      console.log(chalk.gray('ID (24 chars)             │ Question                                         │ Lesson ID (24 chars)      │ Type'));
      console.log('─'.repeat(100));
      quizzes.forEach(q => {
        console.log(
          `${q.id.substring(0, 24)} │ ${truncate(q.question, 47).padEnd(47)} │ ${q.lessonId.substring(0, 24)} │ ${q.type}`
        );
      });
      console.log(chalk.bold(`\nTotal Quizzes: ${quizzes.length}\n`));
    } else {
      console.log(chalk.gray('No quizzes found.\n'));
    }

    // ========== QUIZ ATTEMPTS ==========
    console.log(chalk.bold.yellow('✍️  QUIZ ATTEMPTS'));
    console.log('─'.repeat(100));
    const attempts = await db.quizAttempt.findMany({
      orderBy: { attemptedAt: 'desc' },
      take: 15
    });
    
    if (attempts.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Quiz ID (24 chars)        │ Selected           │ Correct │ Attempted'));
      console.log('─'.repeat(100));
      attempts.forEach(a => {
        const correctStatus = a.isCorrect ? chalk.green('✓ Yes') : chalk.red('✗ No');
        console.log(
          `${a.userId.substring(0, 24)} │ ${a.quizId.substring(0, 24)} │ ${truncate(a.selectedAnswer, 17).padEnd(17)} │ ${correctStatus.padEnd(14)} │ ${formatDate(a.attemptedAt)}`
        );
      });
      console.log(chalk.bold(`\nShowing latest 15 attempts\n`));
    } else {
      console.log(chalk.gray('No quiz attempts found.\n'));
    }

    // ========== CERTIFICATES ==========
    console.log(chalk.bold.yellow('🎖️  CERTIFICATES'));
    console.log('─'.repeat(100));
    const certificates = await db.certificate.findMany({
      orderBy: { dateIssued: 'desc' }
    });
    
    if (certificates.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Course ID (24 chars)      │ Issued     │ Certificate URL'));
      console.log('─'.repeat(100));
      certificates.forEach(c => {
        console.log(
          `${c.userId.substring(0, 24)} │ ${c.courseId.substring(0, 24)} │ ${formatDate(c.dateIssued).padEnd(10)} │ ${truncate(c.certificateUrl || 'N/A', 40)}`
        );
      });
      console.log(chalk.bold(`\nTotal Certificates: ${certificates.length}\n`));
    } else {
      console.log(chalk.gray('No certificates found.\n'));
    }

    // ========== VOCABULARY ==========
    console.log(chalk.bold.yellow('📝 VOCABULARY'));
    console.log('─'.repeat(100));
    const vocabulary = await db.vocabulary.findMany({
      orderBy: { createdAt: 'asc' },
      take: 20
    });
    
    if (vocabulary.length > 0) {
      console.log(chalk.gray('Word                  │ Translation           │ Pronunciation         │ Language │ Lesson ID (24 chars)'));
      console.log('─'.repeat(100));
      vocabulary.forEach(v => {
        console.log(
          `${truncate(v.word, 20).padEnd(20)} │ ${truncate(v.translation, 20).padEnd(20)} │ ${truncate(v.pronunciation || 'N/A', 20).padEnd(20)} │ ${v.language.padEnd(8)} │ ${v.lessonId.substring(0, 24)}`
        );
      });
      console.log(chalk.bold(`\nShowing 20 vocabulary items\n`));
    } else {
      console.log(chalk.gray('No vocabulary found.\n'));
    }

    // ========== CULTURAL CONTENT ==========
    console.log(chalk.bold.yellow('🌍 CULTURAL CONTENT'));
    console.log('─'.repeat(100));
    const cultural = await db.culturalContent.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    if (cultural.length > 0) {
      console.log(chalk.gray('Title                      │ Language │ Lesson ID (24 chars)      │ Created'));
      console.log('─'.repeat(100));
      cultural.forEach(c => {
        console.log(
          `${truncate(c.title, 25).padEnd(25)} │ ${c.language.padEnd(8)} │ ${c.lessonId.substring(0, 24)} │ ${formatDate(c.createdAt)}`
        );
      });
      console.log(chalk.bold(`\nTotal Cultural Content: ${cultural.length}\n`));
    } else {
      console.log(chalk.gray('No cultural content found.\n'));
    }

    // ========== SUMMARY ==========
    console.log('═'.repeat(100));
    console.log(chalk.bold.cyan('📊 DATABASE SUMMARY'));
    console.log('═'.repeat(100));
    
    const summary = {
      'Users': users.length,
      'Courses': courses.length,
      'Lessons': lessons.length,
      'Enrollments': enrollments.length,
      'Lesson Progress': await db.lessonProgress.count(),
      'Quizzes': quizzes.length,
      'Quiz Attempts': await db.quizAttempt.count(),
      'Certificates': certificates.length,
      'Vocabulary': await db.vocabulary.count(),
      'Cultural Content': cultural.length
    };

    Object.entries(summary).forEach(([key, value]) => {
      const emoji = {
        'Users': '👥',
        'Courses': '📚',
        'Lessons': '📖',
        'Enrollments': '🎓',
        'Lesson Progress': '📈',
        'Quizzes': '❓',
        'Quiz Attempts': '✍️',
        'Certificates': '🎖️',
        'Vocabulary': '📝',
        'Cultural Content': '🌍'
      }[key];
      console.log(`${emoji}  ${key.padEnd(20)} : ${chalk.bold.cyan(value)}`);
    });
    
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    console.log('─'.repeat(100));
    console.log(`${chalk.bold('📦 TOTAL RECORDS')}: ${chalk.bold.green(total)}`);
    console.log('═'.repeat(100) + '\n');

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

// Run the viewer
console.log(chalk.cyan('\n🔄 Loading database...\n'));
viewDatabase();
