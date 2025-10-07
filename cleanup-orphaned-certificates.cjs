const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedCertificates() {
  try {
    console.log('🔍 Checking for orphaned certificates...\n');

    // Find all certificates
    const allCertificatesRaw = await prisma.$runCommandRaw({
      find: 'certificates',
      filter: {}
    });

    const allCertificates = allCertificatesRaw.cursor.firstBatch;
    console.log(`Found ${allCertificates.length} total certificates`);

    // Find all courses
    const allCoursesRaw = await prisma.$runCommandRaw({
      find: 'courses',
      filter: {}
    });

    const allCourses = allCoursesRaw.cursor.firstBatch;
    const courseIds = new Set(allCourses.map(c => c._id.$oid));
    console.log(`Found ${allCourses.length} total courses`);

    // Find orphaned certificates
    const orphanedCertificates = allCertificates.filter(cert => 
      !courseIds.has(cert.courseId.$oid)
    );

    if (orphanedCertificates.length === 0) {
      console.log('\n✅ No orphaned certificates found. Database is clean!');
      return;
    }

    console.log(`\n⚠️  Found ${orphanedCertificates.length} orphaned certificates:`);
    orphanedCertificates.forEach(cert => {
      console.log(`   - Certificate ${cert._id.$oid}: references missing courseId ${cert.courseId.$oid}`);
    });

    console.log('\n🧹 Deleting orphaned certificates...');

    const deleteResult = await prisma.$runCommandRaw({
      delete: 'certificates',
      deletes: [
        {
          q: {
            _id: {
              $in: orphanedCertificates.map(c => c._id)
            }
          },
          limit: 0
        }
      ]
    });

    console.log(`\n✅ Deleted ${deleteResult.n} orphaned certificates`);
    console.log('✨ Database cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedCertificates();
