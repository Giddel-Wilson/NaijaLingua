/**
 * Test MongoDB Atlas Connection
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DATABASE_URL;

async function testConnection() {
  console.log('\n🔍 Testing MongoDB Atlas Connection...\n');
  console.log(`Connection String: ${uri?.substring(0, 50)}...${uri?.slice(-30)}\n`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  
  try {
    console.log('⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test a simple operation
    const db = client.db('naijalingua');
    const collections = await db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`   - ${c.name}`));
    
    // Get database stats
    const stats = await db.stats();
    console.log(`\n📊 Database Stats:`);
    console.log(`   Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);
    
    console.log('\n✅ MongoDB Atlas is working perfectly!\n');
    
  } catch (error) {
    console.error('❌ Connection Failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('Server selection timeout')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check MongoDB Atlas cluster is not paused/sleeping');
      console.log('   2. Check your IP is whitelisted in Atlas Network Access');
      console.log('   3. Verify the connection string is correct');
      console.log('   4. Check your internet connection');
      console.log('   5. MongoDB Atlas might be experiencing issues\n');
    }
  } finally {
    await client.close();
  }
}

testConnection();
