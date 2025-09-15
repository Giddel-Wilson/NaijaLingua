import { PrismaClient } from '@prisma/client';

async function checkProfileImages() {
  const prisma = new PrismaClient();
  
  try {
    // Get all users with their profile images
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    });

    console.log('=== Profile Image Debug Info ===');
    console.log('Total users:', users.length);
    console.log('');

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Profile Image: ${user.profileImage || 'NULL'}`);
      
      if (user.profileImage) {
        if (user.profileImage.startsWith('http')) {
          console.log(`  ✅ Valid URL format`);
        } else if (user.profileImage.startsWith('/uploads/')) {
          console.log(`  ❌ Local storage path - won't work in production`);
        } else {
          console.log(`  ⚠️  Unknown format`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfileImages();