import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();
	
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const language = url.searchParams.get('language') || 'all';
	
	const where: any = {
		createdById: user.id
	};
	
	if (search) {
		where.title = {
			contains: search,
			mode: 'insensitive'
		};
	}
	
	if (status !== 'all') {
		where.isPublished = status === 'published';
	}
	
	if (language !== 'all') {
		where.language = language;
	}

	const courses = await db.course.findMany({
		where,
		orderBy: { updatedAt: 'desc' },
		include: {
			_count: {
				select: {
					enrollments: true,
					lessons: true
				}
			}
		}
	});

	// Get language options
	const languages = await db.course.findMany({
		where: { createdById: user.id },
		select: { language: true },
		distinct: ['language']
	});

	return {
		courses,
		languages: languages.map(l => l.language),
		filters: {
			search,
			status,
			language
		}
	};
};
