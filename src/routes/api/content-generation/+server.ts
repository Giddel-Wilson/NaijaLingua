import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { contentGenerator } from '$lib/content-generation';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { language, level, topic } = await request.json();
        
        if (!language || !level || !topic) {
            return json({ error: 'Missing required parameters' }, { status: 400 });
        }
        
        console.log(`Generating preview content for ${language} - ${level} - ${topic}`);
        
        const result = await contentGenerator.generateCourseContent(
            language,
            level,
            topic
        );
        
        return json(result);
        
    } catch (error) {
        console.error('Content generation API error:', error);
        return json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to generate content' 
        }, { status: 500 });
    }
};
