import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { contentGenerator } from '$lib/api/content-generator';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is admin
    if (!locals.user || locals.user.role !== 'ADMIN') {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { language, level, targetLessons = 10 } = await request.json();

    if (!language || !level) {
      return json({ error: 'Language and level are required' }, { status: 400 });
    }

    console.log(`Generating course: ${language} - ${level}`);

    // Generate course content using integrated APIs
    const generatedCourse = await contentGenerator.generateCourse(
      language,
      level,
      targetLessons
    );

    // Create course in database
    const course = await db.course.create({
      data: {
        title: generatedCourse.title,
        description: generatedCourse.description,
        language: generatedCourse.language,
        level: generatedCourse.level,
        tags: ['auto-generated', 'open-source', 'authentic-content', ...generatedCourse.skills],
        isPublished: false, // Admin can review before publishing
        isApproved: false,
        createdById: locals.user.id,
        price: 0, // Free courses from open data
      }
    });

    // Create lessons for the course
    const lessons = [];
    for (let i = 0; i < generatedCourse.lessons.length; i++) {
      const lessonData = generatedCourse.lessons[i];
      
      const lesson = await db.lesson.create({
        data: {
          courseId: course.id,
          title: lessonData.title,
          contentHtml: lessonData.contentHtml,
          duration: Math.ceil(generatedCourse.totalDuration / generatedCourse.lessons.length),
          order: i + 1,
          isPublished: false
        }
      });

      // Create quizzes for each lesson
      for (let j = 0; j < lessonData.exercises.length; j++) {
        const exercise = lessonData.exercises[j];
        
        await db.quiz.create({
          data: {
            lessonId: lesson.id,
            type: exercise.type === 'vocabulary' ? 'MCQ' : 
                  exercise.type === 'pronunciation' ? 'VOICE_MATCH' :
                  exercise.type === 'grammar' ? 'MCQ' : 'MCQ',
            question: exercise.question,
            options: exercise.options ? {
              options: exercise.options,
              audioUrl: exercise.audioUrl
            } : { text: exercise.question },
            correctAnswer: exercise.correctAnswer,
            explanation: exercise.explanation,
            order: j + 1
          }
        });
      }

      lessons.push(lesson);
    }

    return json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        language: course.language,
        level: course.level,
        lessonsCount: lessons.length,
        estimatedDuration: generatedCourse.totalDuration,
        skills: generatedCourse.skills,
        isPublished: course.isPublished
      }
    });

  } catch (error) {
    console.error('Error generating course:', error);
    return json(
      { error: 'Failed to generate course', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};
