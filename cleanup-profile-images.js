import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupLocalProfileImages() {
  try {
    console.log('Cleaning up local profile image paths...');
    
    // Find all users with local profile image paths
    const usersWithLocalImages = await prisma.user.findMany({
      where: {
        profileImage: {
          startsWith: '/uploads/'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true
      }
    });
    
    console.log(`Found ${usersWithLocalImages.length} users with local profile images:`);
    
    usersWithLocalImages.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.profileImage}`);
    });
    
    if (usersWithLocalImages.length > 0) {
      // Clear local profile image paths
      await prisma.user.updateMany({
        where: {
          profileImage: {
            startsWith: '/uploads/'
          }
        },
        data: {
          profileImage: null
        }
      });
      
      console.log(`✅ Cleaned up ${usersWithLocalImages.length} local profile image paths`);
      console.log('Users can now upload new profile images to Cloudinary');
    } else {
      console.log('✅ No local profile images found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupLocalProfileImages();