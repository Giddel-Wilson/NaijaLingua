/**
 * Complete Database Viewer - Production Grade
 * Shows all data in tabular format using direct MongoDB access
 */

import { MongoClient, ObjectId } from 'mongodb';
import chalk from 'chalk';

const uri = "mongodb+srv://GiddelWilson:10.Flash.01@cluster0.lipiiax.mongodb.net/naijalingua?retryWrites=true&w=majority";

// Helper to format date
function formatDate(date) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'N/A';
  }
}

// Helper to truncate text
function truncate(text, length = 40) {
  if (!text) return 'N/A';
  const str = String(text);
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Helper to get ID string
function idStr(id) {
  if (!id) return 'N/A';
  if (id instanceof ObjectId) return id.toHexString().substring(0, 24);
  return String(id).substring(0, 24);
}

async function viewDatabase() {
  const client = new MongoClient(uri);
  
  console.log('\n' + '═'.repeat(100));
  console.log(chalk.bold.cyan('                           📊 NAIJALINGUA DATABASE VIEWER'));
  console.log('═'.repeat(100) + '\n');

  try {
    await client.connect();
    const db = client.db('naijalingua');

    // ========== USERS ==========
    console.log(chalk.bold.yellow('👥 USERS'));
    console.log('─'.repeat(100));
    const users = await db.collection('users').find({}).sort({ createdAt: 1 }).toArray();
    
    if (users.length > 0) {
      console.log(chalk.gray('ID                        │ Name                  │ Email                      │ Role      │ Status    │ Created'));
      console.log('─'.repeat(100));
      users.forEach(u => {
        const status = u.banned ? 'BANNED' : u.suspended ? 'SUSPENDED' : 'ACTIVE';
        const statusColor = status === 'ACTIVE' ? chalk.green : chalk.red;
        console.log(
          `${idStr(u._id)} │ ${truncate(u.name, 20).padEnd(20)} │ ${truncate(u.email, 25).padEnd(25)} │ ${u.role.padEnd(9)} │ ${statusColor(status.padEnd(9))} │ ${formatDate(u.createdAt)}`
        );
      });
      console.log(chalk.bold(`\nTotal Users: ${users.length}\n`));
    } else {
      console.log(chalk.gray('No users found.\n'));
    }

    // ========== COURSES ==========
    console.log(chalk.bold.yellow('📚 COURSES'));
    console.log('─'.repeat(100));
    const courses = await db.collection('courses').find({}).sort({ createdAt: 1 }).toArray();
    
    if (courses.length > 0) {
      console.log(chalk.gray('ID                        │ Title                      │ Language │ Level    │ Instructor ID             │ Published'));
      console.log('─'.repeat(100));
      courses.forEach(c => {
        const pubStatus = c.isPublished ? chalk.green('✓ Yes') : chalk.red('✗ No');
        console.log(
          `${idStr(c._id)} │ ${truncate(c.title, 25).padEnd(25)} │ ${c.language.padEnd(8)} │ ${c.level.padEnd(8)} │ ${idStr(c.createdById || c.instructorId)} │ ${pubStatus}`
        );
      });
      console.log(chalk.bold(`\nTotal Courses: ${courses.length}\n`));
    } else {
      console.log(chalk.gray('No courses found.\n'));
    }

    // ========== LESSONS ==========
    console.log(chalk.bold.yellow('📖 LESSONS'));
    console.log('─'.repeat(100));
    const lessons = await db.collection('lessons').find({}).sort({ courseId: 1, order: 1 }).toArray();
    
    if (lessons.length > 0) {
      console.log(chalk.gray('ID                        │ Title                      │ Course ID (24 chars)      │ Order │ Duration │ Published'));
      console.log('─'.repeat(100));
      lessons.forEach(l => {
        const pubStatus = l.isPublished ? chalk.green('✓') : chalk.red('✗');
        const duration = l.duration ? `${l.duration}m` : 'N/A';
        console.log(
          `${idStr(l._id)} │ ${truncate(l.title, 25).padEnd(25)} │ ${idStr(l.courseId).padEnd(25)} │ ${String(l.order).padEnd(5)} │ ${duration.padEnd(8)} │ ${pubStatus}`
        );
      });
      console.log(chalk.bold(`\nTotal Lessons: ${lessons.length}\n`));
    } else {
      console.log(chalk.gray('No lessons found.\n'));
    }

    // ========== ENROLLMENTS ==========
    console.log(chalk.bold.yellow('🎓 ENROLLMENTS'));
    console.log('─'.repeat(100));
    const enrollments = await db.collection('enrollments').find({}).toArray();
    
    if (enrollments.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Course ID (24 chars)      │ Progress │ Lessons │ Quizzes │ Score │ Started    │ Completed'));
      console.log('─'.repeat(100));
      enrollments.forEach(e => {
        const completed = e.isCompleted ? chalk.green('✓ Yes') : chalk.yellow('In Progress');
        const progress = `${Math.round(e.progress)}%`;
        const startDate = e.startedAt || e.enrolledAt || e.createdAt || 'N/A';
        console.log(
          `${idStr(e.userId)} │ ${idStr(e.courseId)} │ ${progress.padEnd(8)} │ ${String(e.lessonsCompleted || 0).padEnd(7)} │ ${String(e.quizzesCompleted || 0).padEnd(7)} │ ${String(e.totalScore || 0).padEnd(5)} │ ${formatDate(startDate).padEnd(10)} │ ${completed}`
        );
      });
      console.log(chalk.bold(`\nTotal Enrollments: ${enrollments.length}\n`));
    } else {
      console.log(chalk.gray('No enrollments found.\n'));
    }

    // ========== LESSON PROGRESS ==========
    console.log(chalk.bold.yellow('📈 LESSON PROGRESS'));
    console.log('─'.repeat(100));
    const progress = await db.collection('lesson_progress').find({}).sort({ completedAt: -1 }).limit(20).toArray();
    
    if (progress.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Lesson ID (24 chars)      │ Completed │ Time Spent │ Completed At'));
      console.log('─'.repeat(100));
      progress.forEach(p => {
        const status = p.completed ? chalk.green('✓ Yes') : chalk.yellow('In Progress');
        const timeSpent = p.timeSpent ? `${p.timeSpent}s` : 'N/A';
        console.log(
          `${idStr(p.userId)} │ ${idStr(p.lessonId)} │ ${status.padEnd(18)} │ ${timeSpent.padEnd(10)} │ ${formatDate(p.completedAt)}`
        );
      });
      const totalProgress = await db.collection('lesson_progress').countDocuments();
      console.log(chalk.bold(`\nShowing latest 20 of ${totalProgress} records\n`));
    } else {
      console.log(chalk.gray('No lesson progress found.\n'));
    }

    // ========== QUIZZES ==========
    console.log(chalk.bold.yellow('❓ QUIZZES'));
    console.log('─'.repeat(100));
    const quizzes = await db.collection('quizzes').find({}).sort({ createdAt: 1 }).toArray();
    
    if (quizzes.length > 0) {
      console.log(chalk.gray('ID (24 chars)             │ Question                                         │ Lesson ID (24 chars)      │ Type'));
      console.log('─'.repeat(100));
      quizzes.forEach(q => {
        console.log(
          `${idStr(q._id)} │ ${truncate(q.question, 47).padEnd(47)} │ ${idStr(q.lessonId)} │ ${q.type}`
        );
      });
      console.log(chalk.bold(`\nTotal Quizzes: ${quizzes.length}\n`));
    } else {
      console.log(chalk.gray('No quizzes found.\n'));
    }

    // ========== QUIZ ATTEMPTS ==========
    console.log(chalk.bold.yellow('✍️  QUIZ ATTEMPTS'));
    console.log('─'.repeat(100));
    const attempts = await db.collection('quiz_attempts').find({}).sort({ attemptedAt: -1 }).limit(15).toArray();
    
    if (attempts.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Quiz ID (24 chars)        │ Selected           │ Correct │ Attempted'));
      console.log('─'.repeat(100));
      attempts.forEach(a => {
        const correctStatus = a.isCorrect ? chalk.green('✓ Yes') : chalk.red('✗ No');
        console.log(
          `${idStr(a.userId)} │ ${idStr(a.quizId)} │ ${truncate(a.selectedAnswer, 17).padEnd(17)} │ ${correctStatus.padEnd(14)} │ ${formatDate(a.attemptedAt)}`
        );
      });
      const totalAttempts = await db.collection('quiz_attempts').countDocuments();
      console.log(chalk.bold(`\nShowing latest 15 of ${totalAttempts} attempts\n`));
    } else {
      console.log(chalk.gray('No quiz attempts found.\n'));
    }

    // ========== CERTIFICATES ==========
    console.log(chalk.bold.yellow('🎖️  CERTIFICATES'));
    console.log('─'.repeat(100));
    const certificates = await db.collection('certificates').find({}).sort({ dateIssued: -1, issuedAt: -1 }).toArray();
    
    if (certificates.length > 0) {
      console.log(chalk.gray('User ID (24 chars)        │ Course ID (24 chars)      │ Score │ Issued     │ Certificate URL'));
      console.log('─'.repeat(100));
      certificates.forEach(c => {
        const issuedDate = c.dateIssued || c.issuedAt;
        console.log(
          `${idStr(c.userId)} │ ${idStr(c.courseId)} │ ${String(c.score || 0).padEnd(5)} │ ${formatDate(issuedDate).padEnd(10)} │ ${truncate(c.certificateUrl || 'N/A', 40)}`
        );
      });
      console.log(chalk.bold(`\nTotal Certificates: ${certificates.length}\n`));
    } else {
      console.log(chalk.gray('No certificates found.\n'));
    }

    // ========== VOCABULARY ==========
    console.log(chalk.bold.yellow('📝 VOCABULARY'));
    console.log('─'.repeat(100));
    const vocabulary = await db.collection('vocabulary').find({}).sort({ createdAt: 1 }).limit(20).toArray();
    
    if (vocabulary.length > 0) {
      console.log(chalk.gray('Word                  │ Translation           │ Pronunciation         │ Language │ Lesson ID (24 chars)'));
      console.log('─'.repeat(100));
      vocabulary.forEach(v => {
        console.log(
          `${truncate(v.word, 20).padEnd(20)} │ ${truncate(v.translation, 20).padEnd(20)} │ ${truncate(v.pronunciation || 'N/A', 20).padEnd(20)} │ ${v.language.padEnd(8)} │ ${idStr(v.lessonId)}`
        );
      });
      const totalVocab = await db.collection('vocabulary').countDocuments();
      console.log(chalk.bold(`\nShowing 20 of ${totalVocab} vocabulary items\n`));
    } else {
      console.log(chalk.gray('No vocabulary found.\n'));
    }

    // ========== CULTURAL CONTENT ==========
    console.log(chalk.bold.yellow('🌍 CULTURAL CONTENT'));
    console.log('─'.repeat(100));
    const cultural = await db.collection('cultural_content').find({}).sort({ createdAt: 1 }).toArray();
    
    if (cultural.length > 0) {
      console.log(chalk.gray('Title                      │ Language │ Lesson ID (24 chars)      │ Created'));
      console.log('─'.repeat(100));
      cultural.forEach(c => {
        console.log(
          `${truncate(c.title, 25).padEnd(25)} │ ${c.language.padEnd(8)} │ ${idStr(c.lessonId)} │ ${formatDate(c.createdAt)}`
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
    
    const counts = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('courses').countDocuments(),
      db.collection('lessons').countDocuments(),
      db.collection('enrollments').countDocuments(),
      db.collection('lesson_progress').countDocuments(),
      db.collection('quizzes').countDocuments(),
      db.collection('quiz_attempts').countDocuments(),
      db.collection('certificates').countDocuments(),
      db.collection('vocabulary').countDocuments(),
      db.collection('cultural_content').countDocuments()
    ]);

    const summary = {
      'Users': counts[0],
      'Courses': counts[1],
      'Lessons': counts[2],
      'Enrollments': counts[3],
      'Lesson Progress': counts[4],
      'Quizzes': counts[5],
      'Quiz Attempts': counts[6],
      'Certificates': counts[7],
      'Vocabulary': counts[8],
      'Cultural Content': counts[9]
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
      
      // Highlight zero values in red
      const valueStr = value === 0 ? chalk.red.bold(value) : chalk.cyan.bold(value);
      console.log(`${emoji}  ${key.padEnd(20)} : ${valueStr}`);
    });
    
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    console.log('─'.repeat(100));
    console.log(`${chalk.bold('📦 TOTAL RECORDS')}: ${chalk.bold.green(total)}`);
    console.log('═'.repeat(100) + '\n');

    // ========== DATA ISSUES ==========
    if (counts[1] === 0 || counts[8] === 0) {
      console.log(chalk.bold.red('⚠️  DATA INTEGRITY ISSUES DETECTED:'));
      console.log('─'.repeat(100));
      if (counts[1] === 0) {
        console.log(chalk.yellow(`  • No courses found, but ${counts[2]} lessons exist (orphaned)`));
      }
      if (counts[8] === 0) {
        console.log(chalk.yellow(`  • No vocabulary items found`));
      }
      console.log(chalk.gray('\nThese issues may indicate incomplete data migration.\n'));
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    console.error(error);
  } finally {
    await client.close();
  }
}

// Run the viewer
console.log(chalk.cyan('\n🔄 Loading database...\n'));
viewDatabase();
