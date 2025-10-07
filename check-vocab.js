/**
 * Check vocabulary in PostgreSQL
 */

import pkg from 'pg';
const { Client } = pkg;

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkVocabulary() {
  const client = new Client({ 
    connectionString: PG_URL, 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    
    console.log('\n📝 VOCABULARY IN POSTGRESQL:');
    console.log('═'.repeat(100));
    
    const { rows: vocab } = await client.query('SELECT * FROM vocabulary');
    
    if (vocab.length === 0) {
      console.log('❌ No vocabulary found!\n');
    } else {
      console.log(`Found ${vocab.length} vocabulary items\n`);
      console.log('Fields:', Object.keys(vocab[0]).join(', '));
      
      for (const v of vocab) {
        console.log(`\n  Word: ${v.word}`);
        console.log(`    Translation: ${v.translation}`);
        console.log(`    Lesson ID: ${v.lessonId || 'N/A'}`);
        
        // Try to find the lesson
        if (v.lessonId) {
          const { rows: lessons } = await client.query('SELECT id, title FROM lessons WHERE id = $1', [v.lessonId]);
          if (lessons.length > 0) {
            console.log(`    ✅ Lesson: "${lessons[0].title}"`);
          } else {
            console.log(`    ❌ Lesson NOT FOUND (orphaned vocabulary)`);
          }
        }
      }
    }
    
    console.log('\n' + '═'.repeat(100) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkVocabulary();
