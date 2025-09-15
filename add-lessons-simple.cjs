const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function addSampleLessons() {
	try {
		console.log('🔍 Finding courses that need lessons...\n');

		// Find courses with enrollments but no published lessons
		const courses = await db.course.findMany({
			include: {
				lessons: true,
				enrollments: true,
				createdBy: { select: { name: true } }
			}
		});

		const problemCourses = courses.filter(c => 
			c.enrollments.length > 0 && 
			c.lessons.filter(l => l.isPublished).length === 0
		);

		if (problemCourses.length === 0) {
			console.log('✅ All enrolled courses have published lessons!');
			return;
		}

		console.log(`📝 Found ${problemCourses.length} course(s) that need lessons:\n`);

		for (const course of problemCourses) {
			console.log(`Adding lessons to: ${course.title} (${course.language})`);

			// Sample lessons based on language
			const sampleLessons = [
				{
					title: "Basic Greetings",
					description: "Learn how to greet people in " + course.language.toLowerCase(),
					content: `<h2>Welcome to ${course.language} Greetings!</h2>
					<p>In this lesson, you'll learn the most common greetings used in daily conversations.</p>
					<h3>Key Phrases:</h3>
					<ul>
						<li><strong>Hello</strong> - Basic greeting</li>
						<li><strong>Good morning</strong> - Morning greeting</li>
						<li><strong>How are you?</strong> - Asking about wellbeing</li>
						<li><strong>Thank you</strong> - Expressing gratitude</li>
						<li><strong>Goodbye</strong> - Parting greeting</li>
					</ul>
					<p>Practice these greetings and try to use them in your daily interactions!</p>`,
					order: 1,
					isPublished: true
				},
				{
					title: "Common Vocabulary",
					description: "Essential words for everyday conversations",
					content: `<h2>Essential ${course.language} Vocabulary</h2>
					<p>Master these essential words to build your foundation in ${course.language}.</p>
					<h3>Family & People:</h3>
					<ul>
						<li><strong>Mother</strong> - Female parent</li>
						<li><strong>Father</strong> - Male parent</li>
						<li><strong>Child</strong> - Young person</li>
						<li><strong>Friend</strong> - Close companion</li>
						<li><strong>Person</strong> - Individual human</li>
					</ul>
					<h3>Basic Objects:</h3>
					<ul>
						<li><strong>House</strong> - Home dwelling</li>
						<li><strong>Water</strong> - H2O liquid</li>
						<li><strong>Food</strong> - Nourishment</li>
						<li><strong>Book</strong> - Reading material</li>
						<li><strong>Phone</strong> - Communication device</li>
					</ul>`,
					order: 2,
					isPublished: true
				},
				{
					title: "Numbers and Time",
					description: "Learn to count and tell time",
					content: `<h2>Numbers and Time in ${course.language}</h2>
					<p>Understanding numbers and time expressions is crucial for daily communication.</p>
					<h3>Numbers 1-10:</h3>
					<ul>
						<li><strong>One</strong> - 1</li>
						<li><strong>Two</strong> - 2</li>
						<li><strong>Three</strong> - 3</li>
						<li><strong>Four</strong> - 4</li>
						<li><strong>Five</strong> - 5</li>
						<li><strong>Six</strong> - 6</li>
						<li><strong>Seven</strong> - 7</li>
						<li><strong>Eight</strong> - 8</li>
						<li><strong>Nine</strong> - 9</li>
						<li><strong>Ten</strong> - 10</li>
					</ul>
					<h3>Time Expressions:</h3>
					<ul>
						<li><strong>Today</strong> - This day</li>
						<li><strong>Tomorrow</strong> - Next day</li>
						<li><strong>Yesterday</strong> - Previous day</li>
						<li><strong>Morning</strong> - Early day</li>
						<li><strong>Evening</strong> - Late day</li>
					</ul>`,
					order: 3,
					isPublished: true
				}
			];

			// Create lessons for this course
			for (const lessonData of sampleLessons) {
				const lesson = await db.lesson.create({
					data: {
						...lessonData,
						courseId: course.id
					}
				});

				console.log(`  ✅ Created lesson: ${lesson.title}`);
			}

			console.log(`  🎉 Added ${sampleLessons.length} lessons to ${course.title}\n`);
		}

		console.log('✨ Sample lessons added successfully!\n');
		
		// Show current status
		const updatedCourses = await db.course.findMany({
			include: {
				lessons: {
					where: { isPublished: true }
				},
				enrollments: true
			}
		});

		console.log('📊 Updated Course Status:');
		updatedCourses.forEach(course => {
			const publishedLessons = course.lessons.length;
			const enrollments = course.enrollments.length;
			console.log(`  ${course.title}: ${publishedLessons} published lessons, ${enrollments} enrollments`);
		});

	} catch (error) {
		console.error('❌ Error adding sample lessons:', error);
	} finally {
		await db.$disconnect();
	}
}

// Run the function
addSampleLessons();
