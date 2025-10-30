const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully!\n');

    // Test query
    console.log('2. Testing query...');
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Found ${userCount} users\n`);

    // Test specific query (same as login)
    console.log('3. Testing findUnique (same as login)...');
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      console.log(`✅ Found user: ${testUser.email}\n`);
    } else {
      console.log('⚠️  No users found in database\n');
    }

    console.log('✅ All tests passed! MongoDB connection is working.');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    
    if (error.message.includes('Server selection timeout')) {
      console.error('\n🔧 SOLUTION:');
      console.error('1. Check if MongoDB Atlas cluster is paused');
      console.error('2. Go to https://cloud.mongodb.com/');
      console.error('3. Resume your cluster if it\'s paused');
      console.error('4. Check Network Access settings - allow 0.0.0.0/0');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
