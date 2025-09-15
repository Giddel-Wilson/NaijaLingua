import { db } from '$lib/db';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }

  return {
    user: locals.user
  };
};

export const actions: Actions = {
  createCourse: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, '/auth/login');
    }

    try {
      const data = await request.formData();
      const title = data.get('title') as string;
      const description = data.get('description') as string;
      const category = data.get('category') as string;
      const price = parseFloat(data.get('price') as string) || 0;
      const useAIGeneration = data.get('useAIGeneration') === 'true';
      const language = data.get('language') as string;
      const level = data.get('level') as string;
      const contentTopic = data.get('contentTopic') as string;

      if (!title?.trim()) {
        return fail(400, {
          error: 'Course title is required'
        });
      }

      // Convert language code to enum value
      const languageMap: Record<string, string> = {
        'igbo': 'IGBO',
        'yoruba': 'YORUBA',
        'hausa': 'HAUSA',
        'efik': 'EFIK',
        'tiv': 'TIV',
        'fulfulde': 'FULFULDE',
        'kanuri': 'KANURI',
        'ibibio': 'IBIBIO',
        'edo': 'EDO',
        'ijaw': 'IJAW'
      };

      const courseLanguage = languageMap[language] || 'IGBO';
      
      // Build tags
      let tags = category || 'Language Learning';
      if (useAIGeneration) {
        tags += ',auto-generated,ai-generated,' + contentTopic;
      }

      // Create the course
      const newCourse = await db.course.create({
        data: {
          title: title.trim(),
          description: description?.trim() || `Learn ${courseLanguage.toLowerCase()} through ${contentTopic} topics`,
          language: courseLanguage as any,
          level: level as any,
          tags,
          price,
          isPublished: false,
          createdById: locals.user.id
        }
      });

      // If AI generation is enabled, generate lessons
      if (useAIGeneration && language && level && contentTopic) {
        try {
          console.log(`Starting AI content generation for course ${newCourse.id}`);
          
          // Call content generation API
          const response = await fetch('http://localhost:5174/api/content-generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              language,
              level,
              topic: contentTopic,
              courseId: newCourse.id
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('AI content generation result:', result.success ? 'Success' : 'Failed');
            if (result.success) {
              console.log(`Generated ${result.lessons?.length || 0} lessons`);
            }
          } else {
            console.error('AI content generation failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error generating AI content:', error);
          // Don't fail the course creation if AI generation fails
        }
      }

      return {
        success: true,
        message: `Course "${newCourse.title}" has been created successfully!`,
        courseId: newCourse.id
      };
    } catch (error) {
      console.error('Error creating course:', error);
      return fail(500, {
        error: 'Failed to create course. Please try again.'
      });
    }
  }
};
