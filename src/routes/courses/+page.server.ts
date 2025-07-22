import { db } from '$lib/db';
import { NigerianLanguageAPI } from '$lib/api/nigerian-languages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	try {
		const searchQuery = url.searchParams.get('search') || '';
		const languageFilter = url.searchParams.get('language');
		const levelFilter = url.searchParams.get('level');

		// Get courses from database and API
		let dbCourses: any[] = [];
		let apiCourses: any[] = [];

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

		// Get API courses and filter them
		apiCourses = NigerianLanguageAPI.getAllCourses();
		
		if (searchQuery) {
			apiCourses = NigerianLanguageAPI.searchCourses(searchQuery);
		}
		
		if (languageFilter) {
			apiCourses = apiCourses.filter(course => course.language === languageFilter);
		}
		
		if (levelFilter) {
			apiCourses = apiCourses.filter(course => course.level === levelFilter);
		}

		// Transform API courses to match database format
		const transformedApiCourses = apiCourses.map(course => ({
			id: course.id,
			title: course.title,
			description: course.description,
			language: course.language,
			level: course.level,
			imageUrl: null,
			isPublished: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: {
				name: 'NaijaLingua Academy'
			},
			_count: {
				lessons: course.lessons.length,
				enrollments: Math.floor(Math.random() * 500) + 50 // Simulated enrollment count
			},
			isApiCourse: true // Flag to identify API courses
		}));

		// Combine courses
		const allCourses = [...dbCourses, ...transformedApiCourses];

		// Get available filters from all courses
		const allLanguages = [...new Set(allCourses.map(c => c.language))];
		const allLevels = [...new Set(allCourses.map(c => c.level))];

		return {
			courses: allCourses,
			languages: allLanguages,
			levels: allLevels,
			searchQuery,
			languageFilter,
			levelFilter,
			userEnrollments,
			apiStats: NigerianLanguageAPI.getLanguageStats()
		};
	} catch (error) {
		console.error('Error loading courses:', error);
		// Return API courses as fallback
		const apiCourses = NigerianLanguageAPI.getAllCourses();
		const transformedApiCourses = apiCourses.map(course => ({
			id: course.id,
			title: course.title,
			description: course.description,
			language: course.language,
			level: course.level,
			imageUrl: null,
			isPublished: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: {
				name: 'NaijaLingua Academy'
			},
			_count: {
				lessons: course.lessons.length,
				enrollments: Math.floor(Math.random() * 500) + 50
			},
			isApiCourse: true
		}));

		return {
			courses: transformedApiCourses,
			languages: [...new Set(apiCourses.map(c => c.language))],
			levels: [...new Set(apiCourses.map(c => c.level))],
			searchQuery: '',
			languageFilter: null,
			levelFilter: null,
			userEnrollments: [],
			apiStats: NigerianLanguageAPI.getLanguageStats()
		};
	}
};
