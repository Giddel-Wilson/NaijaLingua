const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function debugCourse() {
	try {
		console.log('🔍 Debugging course data...\n');

		// Find the Basic Business course specifically
		const course = await db.course.findFirst({
			where: {
				title: { contains: 'Basic' }
			},
			include: {
				lessons: {
					orderBy: { order: 'asc' }
				},
				enrollments: {
					include: {
						user: { select: { name: true } }
					}
				},
				createdBy: { select: { name: true } }
			}
		});

		if (!course) {
			console.log('❌ No Basic Business course found');
			return;
		}

		console.log(`📋 Course: ${course.title}`);
		console.log(`   ID: ${course.id}`);
		console.log(`   Language: ${course.language}`);
		console.log(`   Total lessons: ${course.lessons.length}`);
		console.log(`   Published lessons: ${course.lessons.filter(l => l.isPublished).length}`);
		console.log(`   Enrollments: ${course.enrollments.length}`);

		console.log('\n📚 All lessons:');
		course.lessons.forEach((lesson, index) => {
			console.log(`   ${index + 1}. ${lesson.title}`);
			console.log(`      - Published: ${lesson.isPublished}`);
			console.log(`      - Order: ${lesson.order}`);
			console.log(`      - ID: ${lesson.id}`);
		});

		console.log('\n👥 Enrollments:');
		course.enrollments.forEach((enrollment, index) => {
			console.log(`   ${index + 1}. ${enrollment.user.name} (${enrollment.status})`);
		});

		// If no published lessons, create some
		const publishedLessons = course.lessons.filter(l => l.isPublished);
		if (publishedLessons.length === 0) {
			console.log('\n➕ Adding sample lessons...');

			const sampleLessons = [
				{
					title: "IGBO Business Greetings",
					description: "Learn professional greetings in Igbo business settings",
					content: `<h2>Business Greetings in Igbo</h2>
					<p>Master the art of professional greetings in Igbo business environments.</p>
					<h3>Key Phrases:</h3>
					<ul>
						<li><strong>Ndewo</strong> - Hello (formal)</li>
						<li><strong>Kedu ka ọ dị?</strong> - How are you? (business)</li>
						<li><strong>Ọ dị mma</strong> - I am fine</li>
						<li><strong>Daalụ</strong> - Thank you</li>
						<li><strong>Ka ọ dị</strong> - Goodbye (formal)</li>
					</ul>`,
					order: 1,
					isPublished: true,
					courseId: course.id
				},
				{
					title: "Business Vocabulary",
					description: "Essential Igbo vocabulary for business contexts",
					content: `<h2>Essential Business Vocabulary</h2>
					<p>Learn the most important Igbo words for business communication.</p>
					<h3>Key Terms:</h3>
					<ul>
						<li><strong>Azụmahịa</strong> - Business</li>
						<li><strong>Ọrụ</strong> - Work/Job</li>
						<li><strong>Ego</strong> - Money</li>
						<li><strong>Ahịa</strong> - Market</li>
						<li><strong>Onye ahịa</strong> - Customer</li>
						<li><strong>Nwayọọ</strong> - Slowly/Carefully</li>
					</ul>`,
					order: 2,
					isPublished: true,
					courseId: course.id
				},
				{
					title: "Making Appointments",
					description: "How to schedule meetings and appointments in Igbo",
					content: `<h2>Scheduling in Igbo</h2>
					<p>Learn how to make appointments and schedule meetings professionally.</p>
					<h3>Useful Phrases:</h3>
					<ul>
						<li><strong>M ga-achọ ịhụ gị</strong> - I would like to see you</li>
						<li><strong>Kedu mgbe ị ga-enwe oge?</strong> - When will you be free?</li>
						<li><strong>Anyị nwere ike ịzụkọ taa?</strong> - Can we meet today?</li>
						<li><strong>Ehihie ka mma</strong> - Afternoon is better</li>
						<li><strong>Ọ dị mma</strong> - That's fine</li>
					</ul>`,
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

			console.log(`\n🎉 Added ${sampleLessons.length} lessons successfully!`);
		} else {
			console.log(`\n✅ Course already has ${publishedLessons.length} published lessons`);
		}

	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await db.$disconnect();
	}
}

debugCourse();
