import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addLessonsToBasicBusiness() {
    try {
        console.log('🔧 Adding lessons to Basic Business course...\n');

        // Find the Basic Business course
        const course = await prisma.course.findFirst({
            where: {
                title: 'Basic Business'
            }
        });

        if (!course) {
            console.log('❌ Basic Business course not found!');
            return;
        }

        console.log(`✅ Found Basic Business course: ${course.id}`);

        // Create lessons for the Basic Business course
        const lessonsData = [
            {
                title: 'Greetings in Business',
                description: 'Learn how to greet clients and colleagues professionally in Igbo',
                content: `# Greetings in Business

## Key Phrases
- **Ndewo** - Hello (formal)
- **Kedụ ka ị mere?** - How are you?
- **Ọ dị mma** - I am fine
- **Ezigbo ụtụtụ** - Good morning
- **Ezigbo ehihie** - Good afternoon

## Business Context
In Igbo business culture, proper greetings are essential for building relationships and showing respect.

## Practice
Try using these greetings in your next business meeting!`,
                order: 1,
                isPublished: true,
                courseId: course.id
            },
            {
                title: 'Numbers and Money',
                description: 'Learn numbers and how to discuss prices and money in business',
                content: `# Numbers and Money

## Basic Numbers
- **Otu** - One
- **Abụọ** - Two  
- **Atọ** - Three
- **Anọ** - Four
- **Ise** - Five

## Money Terms
- **Ego** - Money
- **Ọnụ ahịa** - Price
- **Ire ego** - To cost
- **Ọnụ ahịa ole?** - How much does it cost?

## Business Phrases
- **Ego ole ka ọ ga-eri?** - How much will it cost?
- **Ọnụ ahịa dị ọnụ** - The price is expensive
- **Ọnụ ahịa dị ọnụ ala** - The price is cheap`,
                order: 2,
                isPublished: true,
                courseId: course.id
            },
            {
                title: 'Making Appointments',
                description: 'Learn how to schedule and discuss appointments in Igbo',
                content: `# Making Appointments

## Key Vocabulary
- **Nzukọ** - Meeting/Appointment
- **Oge** - Time
- **Ụbọchị** - Day
- **Izu** - Week
- **Ọnwa** - Month

## Useful Phrases
- **Anyị nwere ike inwe nzukọ?** - Can we have a meeting?
- **Kedụ mgbe ka ị chọrọ?** - When would you like?
- **Oge ole ka ọ ga-ewe?** - How long will it take?

## Days of the Week
- **Mbọsị izu** - Monday
- **Tuzdee** - Tuesday  
- **Wenezdee** - Wednesday
- **Tọzdee** - Thursday
- **Fraịdee** - Friday`,
                order: 3,
                isPublished: true,
                courseId: course.id
            },
            {
                title: 'Products and Services',
                description: 'Learn vocabulary for describing products and services',
                content: `# Products and Services

## Product Terms
- **Ngwaahịa** - Product/Goods
- **Ọrụ** - Service/Work
- **Ahịa** - Market/Business
- **Onye na-ere ahịa** - Seller/Merchant
- **Onye na-azụ ahịa** - Customer/Buyer

## Quality Descriptions
- **Ọ dị mma** - It is good
- **Ọ dị njọ** - It is bad
- **Ọ dị elu** - It is high quality
- **Ọ dị ala** - It is low quality

## Business Questions
- **Kedụ ihe ị na-ere?** - What do you sell?
- **Ị nwere...?** - Do you have...?
- **Ngwaahịa a ọ dị?** - Is this product available?`,
                order: 4,
                isPublished: true,
                courseId: course.id
            },
            {
                title: 'Closing a Deal',
                description: 'Learn how to negotiate and close business deals in Igbo',
                content: `# Closing a Deal

## Negotiation Terms
- **Mkparịta ụka** - Negotiation
- **Nkwekọrịta** - Agreement
- **Nkwụnye ego** - Payment
- **Ọnụ ahịa mbelata** - Discount

## Key Phrases
- **Anyị kwekọrọ** - We agree
- **Ọ dị mma** - It's okay/good
- **Anyị ga-eme ya** - We will do it
- **Kedụ mgbe ka ị ga-akwụ ụgwọ?** - When will you pay?

## Closing Expressions
- **Daalụ maka azụmahịa** - Thank you for the business
- **Anyị ga-ahụ onwe anyị ọzọ** - We will see each other again
- **Ọ dị m mma** - I am satisfied`,
                order: 5,
                isPublished: true,
                courseId: course.id
            }
        ];

        // Create all lessons
        for (const lessonData of lessonsData) {
            const lesson = await prisma.lesson.create({
                data: lessonData
            });
            console.log(`✅ Created lesson: ${lesson.title}`);
        }

        console.log(`\n🎉 Successfully added ${lessonsData.length} lessons to Basic Business course!`);

        // Verify the lessons were created
        const updatedCourse = await prisma.course.findUnique({
            where: { id: course.id },
            include: {
                lessons: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        console.log(`\n📚 Course now has ${updatedCourse.lessons.length} lessons:`);
        updatedCourse.lessons.forEach((lesson, index) => {
            console.log(`  ${index + 1}. ${lesson.title} (Order: ${lesson.order}, Published: ${lesson.isPublished})`);
        });

    } catch (error) {
        console.error('Error adding lessons to Basic Business course:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addLessonsToBasicBusiness();
