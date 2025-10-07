/**
 * Delete duplicate Admin User
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function deleteDuplicateAdmin() {
  try {
    console.log('\n🔍 Finding duplicate admin users...\n');
    
    const adminUsers = await db.user.findMany({
      where: {
        email: 'admin@naijalingua.com'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`Found ${adminUsers.length} admin users with email admin@naijalingua.com\n`);
    
    if (adminUsers.length <= 1) {
      console.log('✅ No duplicates found!\n');
      return;
    }
    
    // Keep the oldest one, delete the rest
    const [keepUser, ...deleteUsers] = adminUsers;
    
    console.log(`✅ KEEPING: ${keepUser.name} (ID: ${keepUser.id}) - Created: ${keepUser.createdAt}`);
    
    for (const user of deleteUsers) {
      console.log(`\n🗑️  DELETING: ${user.name} (ID: ${user.id}) - Created: ${user.createdAt}`);
      
      // First, reassign any courses created by this user to the keeper
      const coursesToReassign = await db.course.findMany({
        where: { createdById: user.id }
      });
      
      if (coursesToReassign.length > 0) {
        console.log(`   📚 Reassigning ${coursesToReassign.length} course(s) to keeper...`);
        
        await db.course.updateMany({
          where: { createdById: user.id },
          data: { createdById: keepUser.id }
        });
        
        console.log(`   ✅ Courses reassigned`);
      }
      
      // Now delete the user
      await db.user.delete({
        where: { id: user.id }
      });
      
      console.log(`   ✅ User deleted!`);
    }
    
    console.log(`\n✅ Cleanup complete! Kept 1 admin, deleted ${deleteUsers.length} duplicate(s)\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

deleteDuplicateAdmin();
