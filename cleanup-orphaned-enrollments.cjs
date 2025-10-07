const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedEnrollments() {
  try {
    console.log('🔍 Checking for orphaned enrollments...\n');

    // Find all enrollments
    const allEnrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        userId: true,
        courseId: true
      }
    });

    console.log(`Found ${allEnrollments.length} total enrollments`);

    // Find all courses
    const allCourses = await prisma.course.findMany({
      select: {
        id: true
      }
    });

    const courseIds = new Set(allCourses.map(c => c.id));
    console.log(`Found ${allCourses.length} total courses`);

    // Find orphaned enrollments
    const orphanedEnrollments = allEnrollments.filter(e => !courseIds.has(e.courseId));

    if (orphanedEnrollments.length === 0) {
      console.log('\n✅ No orphaned enrollments found. Database is clean!');
      return;
    }

    console.log(`\n⚠️  Found ${orphanedEnrollments.length} orphaned enrollments:`);
    orphanedEnrollments.forEach(e => {
      console.log(`   - Enrollment ${e.id}: references missing courseId ${e.courseId}`);
    });

    console.log('\n🧹 Deleting orphaned enrollments...');

    const deleteResult = await prisma.enrollment.deleteMany({
      where: {
        id: {
          in: orphanedEnrollments.map(e => e.id)
        }
      }
    });

    console.log(`\n✅ Deleted ${deleteResult.count} orphaned enrollments`);
    console.log('✨ Database cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedEnrollments();
