import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    console.log('🔄 Resetting passwords for testing...\n');
    
    // Default test password
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database');
      return;
    }

    console.log(`📝 Setting password to "${testPassword}" for all users:\n`);
    
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword }
      });
      
      console.log(`✅ ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log(`\n🎉 All ${users.length} user passwords have been reset to: ${testPassword}`);
    console.log('\n🔐 Test login credentials:');
    
    users.forEach(user => {
      console.log(`   ${user.email} / ${testPassword} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
