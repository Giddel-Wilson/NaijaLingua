import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
  const client = new MongoClient(process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  
  try {
    await client.connect();
    const db = client.db('naijalingua');
    
    console.log('\n📊 Direct MongoDB Query:');
    const mongoCount = await db.collection('courses').countDocuments();
    console.log(`   Courses: ${mongoCount}`);
    
    if (mongoCount > 0) {
      const sample = await db.collection('courses').findOne();
      console.log(`\n   Sample course:`);
      console.log(`   Title: ${sample.title}`);
      console.log(`   Fields: ${Object.keys(sample).join(', ')}`);
    }
    
    console.log('\n📊 Prisma Query:');
    const prismaCount = await prisma.course.count();
    console.log(`   Courses: ${prismaCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    await prisma.$disconnect();
  }
}

debug();
