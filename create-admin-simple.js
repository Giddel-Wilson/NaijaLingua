const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@naijalingua.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isVerified: true,
        profile: {
          create: {
            bio: 'Platform Administrator',
            dateOfBirth: new Date('1990-01-01'),
            phoneNumber: '+234000000000',
            address: 'Lagos, Nigeria',
            profilePicture: null
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@naijalingua.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', admin.firstName, admin.lastName);
    console.log('🛡️ Role:', admin.role);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Admin user already exists with this email');
      
      // Update existing user to admin role
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@naijalingua.com' },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ Updated existing user to admin role');
      console.log('📧 Email: admin@naijalingua.com');
      console.log('🛡️ Role:', updatedUser.role);
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
