const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixNullCertificateScores() {
  try {
    console.log('🔍 Checking for certificates with null scores...\n');

    // Use raw MongoDB query to find certificates with null scores
    const certificatesWithNullScores = await prisma.certificate.aggregateRaw({
      pipeline: [
        {
          $match: {
            $or: [
              { score: null },
              { score: { $exists: false } }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            courseId: 1,
            score: 1,
            dateIssued: 1
          }
        }
      ]
    });

    console.log(`Found ${certificatesWithNullScores.length} certificates with null scores`);

    if (certificatesWithNullScores.length === 0) {
      console.log('\n✅ No certificates with null scores found. Database is clean!');
      return;
    }

    console.log('\nCertificates with null scores:');
    certificatesWithNullScores.forEach(cert => {
      console.log(`   - Certificate ID: ${cert._id}, Score: ${cert.score}`);
    });

    console.log('\n🔧 Fixing null scores (setting default value of 0.0)...');

    // Update certificates with null scores to have a default value of 0.0
    const updateResult = await prisma.certificate.updateMany({
      where: {
        id: {
          in: certificatesWithNullScores.map(c => c._id.toString())
        }
      },
      data: {
        score: 0.0
      }
    });

    console.log(`\n✅ Updated ${updateResult.count} certificates with default score of 0.0`);
    console.log('✨ Database cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    
    // Fallback: Try direct MongoDB update
    console.log('\n🔄 Trying direct MongoDB update...');
    try {
      const result = await prisma.$runCommandRaw({
        update: 'certificates',
        updates: [
          {
            q: { $or: [{ score: null }, { score: { $exists: false } }] },
            u: { $set: { score: 0.0 } },
            multi: true
          }
        ]
      });
      console.log('✅ Direct MongoDB update result:', result);
    } catch (rawError) {
      console.error('❌ Direct MongoDB update also failed:', rawError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixNullCertificateScores();
