const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function investigateCourse() {
	try {
		console.log('🔍 Investigating course and enrollment data...\n');

		// Get the demo student user
		const demoStudent = await db.user.findFirst({
			where: {
				name: { contains: 'Demo' }
			}
		});

		if (!demoStudent) {
			console.log('❌ No demo student found');
			return;
		}

		console.log(`👤 Demo Student: ${demoStudent.name} (ID: ${demoStudent.id})\n`);

		// Get all enrollments for demo student
		const enrollments = await db.enrollment.findMany({
			where: {
				userId: demoStudent.id
			},
			include: {
				course: {
					include: {
						lessons: true
					}
				}
			}
		});

		console.log(`📚 Demo student enrollments: ${enrollments.length}\n`);

		enrollments.forEach((enrollment, index) => {
			const course = enrollment.course;
			console.log(`${index + 1}. Course: ${course.title}`);
			console.log(`   ID: ${course.id}`);
			console.log(`   Language: ${course.language}`);
			console.log(`   Published: ${course.isPublished}`);
			console.log(`   Total lessons: ${course.lessons.length}`);
			console.log(`   Published lessons: ${course.lessons.filter(l => l.isPublished).length}`);
			
			if (course.lessons.length > 0) {
				console.log(`   Lessons:`);
				course.lessons.forEach(lesson => {
					console.log(`     - ${lesson.title} (Published: ${lesson.isPublished})`);
				});
			}
			console.log('');
		});

		// If there are courses without lessons, add some
		for (const enrollment of enrollments) {
			const course = enrollment.course;
			const publishedLessons = course.lessons.filter(l => l.isPublished);
			
			if (publishedLessons.length === 0) {
				console.log(`➕ Adding lessons to "${course.title}"...`);
				
				const sampleLessons = [
					{
						title: `${course.language} Basics - Greetings`,
						description: `Learn basic greetings in ${course.language}`,
						content: `<h2>Basic Greetings in ${course.language}</h2><p>Learn essential greetings for daily conversation.</p>`,
						order: 1,
						isPublished: true,
						courseId: course.id
					},
					{
						title: `${course.language} Basics - Common Words`,
						description: `Essential vocabulary for ${course.language} learners`,
						content: `<h2>Common Words in ${course.language}</h2><p>Master the most frequently used words.</p>`,
						order: 2,
						isPublished: true,
						courseId: course.id
					},
					{
						title: `${course.language} Basics - Simple Phrases`,
						description: `Useful phrases for everyday situations`,
						content: `<h2>Simple Phrases in ${course.language}</h2><p>Learn practical phrases for common scenarios.</p>`,
						order: 3,
						isPublished: true,
						courseId: course.id
					}
				];

				for (const lessonData of sampleLessons) {
					const lesson = await db.lesson.create({
						data: lessonData
					});
					console.log(`   ✅ Created: ${lesson.title}`);
				}
				console.log('');
			}
		}

		console.log('✨ Investigation complete!\n');

	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await db.$disconnect();
	}
}

investigateCourse();
