import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	try {
		const searchQuery = url.searchParams.get('search') || '';
		const languageFilter = url.searchParams.get('language');
		const levelFilter = url.searchParams.get('level');

		// Get courses from database only (Igbo-focused platform)
		let dbCourses: any[] = [];

		// Build where clause for database filtering
		const where: any = {
			isPublished: true
		};

		if (searchQuery) {
			where.OR = [
				{ title: { contains: searchQuery, mode: 'insensitive' } },
				{ description: { contains: searchQuery, mode: 'insensitive' } }
			];
		}

		if (languageFilter) {
			where.language = languageFilter;
		}

		if (levelFilter) {
			where.level = levelFilter;
		}

		// Get database courses
		try {
			dbCourses = await db.course.findMany({
				where,
				include: {
					createdBy: {
						select: {
							name: true
						}
					},
					_count: {
						select: {
							lessons: true,
							enrollments: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				}
			});
		} catch (error) {
			console.error('Database error:', error);
		}

		// Get user enrollments if logged in
		let userEnrollments: any[] = [];
		if (locals.user) {
			try {
				userEnrollments = await db.enrollment.findMany({
					where: { userId: locals.user.id },
					select: { courseId: true }
				});
			} catch (error) {
				console.error('Error getting user enrollments:', error);
			}
		}

		// Only use database courses - no API courses for Igbo-focused platform
		const allCourses = dbCourses;

		// Get available filters from all courses
		const allLanguages = [...new Set(allCourses.map(c => c.language))];
		const allLevels = [...new Set(allCourses.map(c => c.level))];

		return {
			courses: allCourses.map(course => ({
				...course,
				isEnrolled: userEnrollments.some(enrollment => enrollment.courseId === course.id)
			})),
			availableLanguages: allLanguages,
			availableLevels: allLevels,
			searchQuery,
			languageFilter,
			levelFilter
		};
	} catch (error) {
		console.error('Error loading courses:', error);
		// Return empty courses on error for Igbo-focused platform
		return {
			courses: [],
			availableLanguages: [],
			availableLevels: [],
			searchQuery: '',
			languageFilter: null,
			levelFilter: null
		};
	}
};
