import pkg from 'pg';
const { Client } = pkg;

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function check() {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    
    const result = await client.query('SELECT id, title, instructorId, isPublished FROM courses');
    console.log(`\n📚 PostgreSQL Courses: ${result.rows.length}\n`);
    result.rows.forEach(r => {
      console.log(`   - ${r.title} (Instructor ID: ${r.instructorid})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

check();
