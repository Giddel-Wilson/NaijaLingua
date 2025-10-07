/**
 * Check if course creators exist in users table
 */

import pkg from 'pg';
const { Client } = pkg;

const PG_URL = 'postgresql://neondb_owner:npg_o0N7vDawbHKh@ep-bold-lab-ad78db14-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkCourseCreators() {
  const client = new Client({ 
    connectionString: PG_URL, 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    await client.connect();
    console.log('\n✅ Connected to PostgreSQL\n');
    
    // Get courses with creator info
    const { rows: courses } = await client.query('SELECT id, title, "createdById" FROM courses');
    
    console.log('📚 COURSES AND THEIR CREATORS:');
    console.log('═'.repeat(100));
    
    for (const course of courses) {
      console.log(`\nCourse: "${course.title}"`);
      console.log(`  Course ID: ${course.id}`);
      console.log(`  createdById: ${course.createdById}`);
      
      // Check if user exists
      const { rows: users } = await client.query('SELECT id, name, email, role FROM users WHERE id = $1', [course.createdById]);
      
      if (users.length > 0) {
        const user = users[0];
        console.log(`  ✅ Creator EXISTS: ${user.name} (${user.email}) - ${user.role}`);
      } else {
        console.log(`  ❌ Creator NOT FOUND (orphaned course)`);
      }
    }
    
    console.log('\n' + '═'.repeat(100));
    console.log(`Total courses: ${courses.length}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCourseCreators();
