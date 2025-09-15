import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function checkEnrollments() {
  try {
    // Check current enrollments
    const enrollments = await db.enrollment.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true,
            id: true
          }
        }
      }
    });
    
    console.log('Current enrollments:');
    enrollments.forEach(enrollment => {
      console.log(`- ${enrollment.user.name} (${enrollment.user.email}) enrolled in "${enrollment.course.title}" (${enrollment.course.id})`);
    });
    
    // Check if we have a Demo Student user
    const demoStudent = await db.user.findFirst({
      where: {
        OR: [
          { email: 'student@naijalingua.com' },
          { name: { contains: 'Demo Student' } }
        ]
      }
    });
    
    if (demoStudent) {
      console.log(`\nFound demo student: ${demoStudent.name} (${demoStudent.email})`);
      
      // Check if demo student is enrolled in any courses
      const demoEnrollments = await db.enrollment.findMany({
        where: { userId: demoStudent.id },
        include: {
          course: {
            select: {
              title: true,
              id: true
            }
          }
        }
      });
      
      console.log(`Demo student enrollments: ${demoEnrollments.length}`);
      demoEnrollments.forEach(e => {
        console.log(`- Enrolled in: ${e.course.title} (${e.course.id})`);
      });
      
      // If not enrolled in the Yoruba course, enroll them
      const yorubaCourse = await db.course.findFirst({
        where: { title: 'Learn Yoruba from Scratch' }
      });
      
      if (yorubaCourse) {
        const existingEnrollment = await db.enrollment.findFirst({
          where: {
            userId: demoStudent.id,
            courseId: yorubaCourse.id
          }
        });
        
        if (!existingEnrollment) {
          console.log(`\nEnrolling demo student in Yoruba course...`);
          await db.enrollment.create({
            data: {
              userId: demoStudent.id,
              courseId: yorubaCourse.id,
              enrolledAt: new Date()
            }
          });
          console.log('✅ Enrollment created!');
        } else {
          console.log('Demo student is already enrolled in Yoruba course');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkEnrollments();
