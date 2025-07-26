import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function checkUserSchema() {
  try {
    console.log('Checking user schema...');
    
    // Get a sample user to see the actual fields
    const sampleUser = await prisma.user.findFirst();
    console.log('Sample user structure:', Object.keys(sampleUser || {}));
    
    // Test if we can perform a simple update
    if (sampleUser) {
      console.log('Testing user update...');
      const testUpdate = await prisma.user.update({
        where: { id: sampleUser.id },
        data: {
          updatedAt: new Date()
        }
      });
      console.log('✅ User update test successful');
    }
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSchema();
