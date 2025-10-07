/**
 * Migrate vocabulary (standalone - no lesson reference needed)
 */

import pkg from 'pg';
const { Client } = pkg;
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const MONGO_URL = process.env.DATABASE_URL;

async function migrateVocabulary() {
  const pgClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  const mongoClient = new MongoClient(MONGO_URL);
  
  try {
    await pgClient.connect();
    console.log('\n✅ PostgreSQL connected');
    
    await mongoClient.connect();
    const db = mongoClient.db('naijalingua');
    console.log('✅ MongoDB connected\n');
    
    console.log('📝 Migrating vocabulary...');
    console.log('═'.repeat(80));
    
    const { rows: vocabulary } = await pgClient.query('SELECT * FROM vocabulary');
    
    console.log(`Found ${vocabulary.length} vocabulary items in PostgreSQL\n`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (const v of vocabulary) {
      try {
        await db.collection('vocabulary').insertOne({
          _id: new ObjectId(),
          language: v.language || 'IGBO',
          word: v.word,
          translation: v.translation,
          pronunciation: v.pronunciation,
          audioUrl: v.audioUrl,
          example: v.example,
          exampleTranslation: v.exampleTranslation,
          category: v.category,
          source: v.source || 'MIGRATION',
          sourceData: v.sourceData,
          createdAt: v.createdAt || new Date(),
          updatedAt: v.updatedAt || new Date()
        });
        
        inserted++;
        console.log(`  ✅ ${v.word} → ${v.translation}`);
        
      } catch (e) {
        if (e.code === 11000) {
          console.log(`  ⚠️  ${v.word}: Duplicate (already exists)`);
          skipped++;
        } else {
          console.log(`  ❌ ${v.word}: ${e.message}`);
        }
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`✅ Vocabulary migration complete!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log('═'.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pgClient.end();
    await mongoClient.close();
  }
}

migrateVocabulary();
