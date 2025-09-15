import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    throw redirect(302, '/auth/login');
  }

  try {
    const { courseId, lessonId } = params;

    // Get lesson with course info
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
        quizzes: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!lesson || lesson.courseId !== courseId) {
      throw error(404, 'Lesson not found');
    }

    // Get vocabulary for this topic/language
    const vocabulary = await db.vocabulary.findMany({
      where: {
        language: lesson.course.language,
        category: lesson.course.tags?.split(',').find(tag => 
          ['greetings', 'family', 'food_and_eating', 'numbers', 'colors', 'travel', 'business'].includes(tag.trim())
        ) || 'general'
      },
      take: 10
    });

    // Get cultural content for this topic/language
    const culturalContent = await db.culturalContent.findMany({
      where: {
        language: lesson.course.language,
        topic: lesson.course.tags?.split(',').find(tag => 
          ['greetings', 'family', 'food_and_eating', 'numbers', 'colors', 'travel', 'business'].includes(tag.trim())
        ) || 'general'
      },
      take: 3
    });

    return {
      lesson,
      vocabulary,
      culturalContent
    };
    
  } catch (err) {
    console.error('Error loading lesson preview:', err);
    throw error(500, 'Failed to load lesson preview');
  }
};
