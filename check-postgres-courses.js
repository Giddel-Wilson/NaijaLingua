/**
 * Check PostgreSQL courses directly
 */

import pkg from 'pg';
const { Client } = pkg;

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkPostgresCourses() {
  const client = new Client({ 
    connectionString: PG_URL, 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    console.log('\n🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Check courses
    console.log('📚 COURSES IN POSTGRESQL:');
    console.log('═'.repeat(100));
    const { rows: courses } = await client.query('SELECT * FROM courses');
    
    if (courses.length === 0) {
      console.log('❌ No courses found in PostgreSQL!\n');
    } else {
      courses.forEach((c, i) => {
        console.log(`\n${i + 1}. Course: ${c.title}`);
        console.log(`   ID: ${c.id}`);
        console.log(`   Instructor ID: ${c.instructor_id || c.instructorid || c.created_by_id || 'N/A'}`);
        console.log(`   Language: ${c.language}`);
        console.log(`   Level: ${c.level}`);
        console.log(`   Description: ${c.description?.substring(0, 100)}...`);
        console.log(`   Published: ${c.is_published}`);
        console.log(`   Created: ${c.created_at}`);
        console.log(`   All fields:`, Object.keys(c).join(', '));
      });
      console.log(`\n✅ Total: ${courses.length} courses\n`);
    }
    
    // Check table structure
    console.log('🔍 COURSES TABLE STRUCTURE:');
    console.log('═'.repeat(100));
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);
    columns.forEach(col => {
      console.log(`   ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Disconnected from PostgreSQL\n');
  }
}

checkPostgresCourses();
