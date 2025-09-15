import { db } from './src/lib/db.js';

async function checkCourses() {
	try {
		console.log('📚 Checking courses and lessons...\n');

		const courses = await db.course.findMany({
			include: {
				lessons: true,
				enrollments: true,
				createdBy: {
					select: { name: true }
				}
			}
		});

		if (courses.length === 0) {
			console.log('❌ No courses found in database');
			return;
		}

		courses.forEach((course, index) => {
			console.log(`${index + 1}. Course: ${course.title}`);
			console.log(`   ID: ${course.id}`);
			console.log(`   Language: ${course.language}`);
			console.log(`   Level: ${course.level}`);
			console.log(`   Created by: ${course.createdBy.name}`);
			console.log(`   Published: ${course.isPublished ? '✅' : '❌'}`);
			console.log(`   Enrollments: ${course.enrollments.length}`);
			console.log(`   Total lessons: ${course.lessons.length}`);
			console.log(`   Published lessons: ${course.lessons.filter(l => l.isPublished).length}`);
			console.log('   ---');
		});

		// Find courses with enrollments but no published lessons
		const problemCourses = courses.filter(c => 
			c.enrollments.length > 0 && 
			c.lessons.filter(l => l.isPublished).length === 0
		);

		if (problemCourses.length > 0) {
			console.log('\n🚨 Courses with enrollments but no published lessons:');
			problemCourses.forEach(course => {
				console.log(`   - ${course.title} (${course.enrollments.length} students enrolled)`);
			});
		}

	} catch (error) {
		console.error('Error checking courses:', error);
	} finally {
		await db.$disconnect();
	}
}

checkCourses();
