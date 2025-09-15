import { PrismaClient } from '@prisma/client';

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
					title: "Numbers 1-10",
					description: "Learn to count from 1 to 10",
					content: `<h2>Counting in ${course.language}</h2>
					<p>Numbers are fundamental in any language. Let's learn to count from 1 to 10!</p>
					<h3>Numbers:</h3>
					<ol>
						<li>One</li>
						<li>Two</li>
						<li>Three</li>
						<li>Four</li>
						<li>Five</li>
						<li>Six</li>
						<li>Seven</li>
						<li>Eight</li>
						<li>Nine</li>
						<li>Ten</li>
					</ol>
					<p>Practice counting objects around you using these numbers!</p>`,
					order: 2,
					isPublished: true
				},
				{
					title: "Family Members",
					description: "Learn words for family relationships",
					content: `<h2>Family Vocabulary</h2>
					<p>Learn how to talk about your family members in ${course.language}.</p>
					<h3>Family Terms:</h3>
					<ul>
						<li><strong>Mother</strong> - Female parent</li>
						<li><strong>Father</strong> - Male parent</li>
						<li><strong>Sister</strong> - Female sibling</li>
						<li><strong>Brother</strong> - Male sibling</li>
						<li><strong>Child</strong> - Offspring</li>
						<li><strong>Grandmother</strong> - Mother's or father's mother</li>
						<li><strong>Grandfather</strong> - Mother's or father's father</li>
					</ul>
					<p>Try describing your own family using these terms!</p>`,
					order: 3,
					isPublished: true
				},
				{
					title: "Common Objects",
					description: "Learn names of everyday items",
					content: `<h2>Everyday Objects</h2>
					<p>Expand your vocabulary with common household items and objects.</p>
					<h3>Objects:</h3>
					<ul>
						<li><strong>House</strong> - Building where people live</li>
						<li><strong>Water</strong> - Clear liquid we drink</li>
						<li><strong>Food</strong> - What we eat</li>
						<li><strong>Book</strong> - Collection of pages with text</li>
						<li><strong>Table</strong> - Furniture for eating/working</li>
						<li><strong>Chair</strong> - Furniture for sitting</li>
						<li><strong>Door</strong> - Entrance to rooms</li>
					</ul>
					<p>Look around and try to name objects you see in ${course.language}!</p>`,
					order: 4,
					isPublished: true
				},
				{
					title: "Basic Conversation",
					description: "Put it all together in simple conversations",
					content: `<h2>Having Basic Conversations</h2>
					<p>Now let's combine what we've learned into simple conversations.</p>
					<h3>Sample Conversation:</h3>
					<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
						<p><strong>Person A:</strong> Hello! How are you?</p>
						<p><strong>Person B:</strong> I'm fine, thank you. And you?</p>
						<p><strong>Person A:</strong> I'm doing well. See you later!</p>
						<p><strong>Person B:</strong> Goodbye!</p>
					</div>
					<h3>Practice Tips:</h3>
					<ul>
						<li>Start with simple greetings</li>
						<li>Ask about family members</li>
						<li>Count objects together</li>
						<li>Practice daily conversations</li>
					</ul>
					<p>Congratulations on completing the basic ${course.language} course!</p>`,
					order: 5,
					isPublished: true
				}
			];

			// Create lessons for this course
			for (const lessonData of sampleLessons) {
				await db.lesson.create({
					data: {
						...lessonData,
						courseId: course.id
					}
				});
				console.log(`   ✅ Added: ${lessonData.title}`);
			}

			console.log(`   🎉 Added ${sampleLessons.length} lessons to ${course.title}\n`);
		}

		console.log('✨ All done! Your courses now have lessons ready for learning.');

	} catch (error) {
		console.error('❌ Error adding lessons:', error);
	} finally {
		await db.$disconnect();
	}
}

addSampleLessons();
