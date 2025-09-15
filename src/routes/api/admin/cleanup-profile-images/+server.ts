import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  
  // Only allow admin users to run this
  if (!user || user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    console.log('Cleaning up local profile image paths...');
    
    // Find all users with local profile image paths
    const usersWithLocalImages = await db.user.findMany({
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
    
    console.log(`Found ${usersWithLocalImages.length} users with local profile images`);
    
    if (usersWithLocalImages.length > 0) {
      // Clear local profile image paths
      await db.user.updateMany({
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
      
      return json({
        success: true,
        message: `Cleaned up ${usersWithLocalImages.length} local profile image paths`,
        usersUpdated: usersWithLocalImages.map(u => ({ name: u.name, email: u.email, oldPath: u.profileImage }))
      });
    } else {
      return json({
        success: true,
        message: 'No local profile images found',
        usersUpdated: []
      });
    }
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return json({ 
      error: 'Failed to cleanup profile images' 
    }, { status: 500 });
  }
};