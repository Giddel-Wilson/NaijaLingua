/**
 * Manually insert the 5 vocabulary items we know about
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.DATABASE_URL;

const vocabularyData = [
  {
    word: 'Ndewo',
    translation: 'Hello',
    language: 'IGBO',
    pronunciation: null,
    audioUrl: null,
    example: null,
    exampleTranslation: null,
    category: null,
    source: 'MIGRATION',
    sourceData: null
  },
  {
    word: 'Kedụ',
    translation: 'How are you?',
    language: 'IGBO',
    pronunciation: null,
    audioUrl: null,
    example: null,
    exampleTranslation: null,
    category: null,
    source: 'MIGRATION',
    sourceData: null
  },
  {
    word: 'Ọ dị mma',
    translation: 'I am fine',
    language: 'IGBO',
    pronunciation: null,
    audioUrl: null,
    example: null,
    exampleTranslation: null,
    category: null,
    source: 'MIGRATION',
    sourceData: null
  },
  {
    word: 'Dalu',
    translation: 'Thank you',
    language: 'IGBO',
    pronunciation: null,
    audioUrl: null,
    example: null,
    exampleTranslation: null,
    category: null,
    source: 'MIGRATION',
    sourceData: null
  },
  {
    word: 'Ka ọ dị',
    translation: 'Goodbye',
    language: 'IGBO',
    pronunciation: null,
    audioUrl: null,
    example: null,
    exampleTranslation: null,
    category: null,
    source: 'MIGRATION',
    sourceData: null
  }
];

async function insertVocabulary() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db('naijalingua');
    
    console.log('\n📝 Inserting vocabulary items...\n');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const vocab of vocabularyData) {
      try {
        await db.collection('vocabulary').insertOne({
          _id: new ObjectId(),
          ...vocab,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        inserted++;
        console.log(`✅ ${vocab.word} → ${vocab.translation}`);
        
      } catch (e) {
        if (e.code === 11000) {
          console.log(`⚠️  ${vocab.word}: Already exists`);
          skipped++;
        } else {
          console.log(`❌ ${vocab.word}: ${e.message}`);
        }
      }
    }
    
    console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

insertVocabulary();
