import { db } from '../src/lib/db.ts';
import { hashPassword } from '../src/lib/auth.ts';

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123'); // Change this password!
    
    const admin = await db.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@naijalingua.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        bio: 'Platform Administrator'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@naijalingua.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await db.$disconnect();
  }
}

createAdminUser();
