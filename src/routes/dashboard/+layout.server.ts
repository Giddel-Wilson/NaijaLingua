import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}
	
	// Redirect admins to their admin panel
	if (locals.user.role === 'ADMIN') {
		throw redirect(303, '/admin');
	}
	
	const baseData = {
		user: locals.user
	};
	
	if (locals.user.role === 'INSTRUCTOR') {
		// Instructor-specific data
		const courses = await db.course.findMany({
			where: {
				createdById: locals.user.id
			},
			include: {
				lessons: {
					where: { isPublished: true },
					select: { id: true }
				},
				enrollments: {
					select: {
						id: true,
						progress: true,
						user: {
							select: {
								name: true,
								email: true
							}
						}
					}
				},
				_count: {
					select: {
						enrollments: true,
						lessons: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		
		const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
		const totalLessons = courses.reduce((sum, course) => sum + course._count.lessons, 0);
		
		return {
			...baseData,
			courses,
			totalEnrollments,
			totalLessons,
			role: 'INSTRUCTOR'
		};
	} else {
		// Student-specific data (existing logic)
		// First get all valid course IDs
		const validCourses = await db.course.findMany({
			select: { id: true }
		});
		const validCourseIds = validCourses.map(c => c.id);
		
		// Then fetch enrollments only for valid courses
		const enrollments = await db.enrollment.findMany({
			where: {
				userId: locals.user.id,
				courseId: {
					in: validCourseIds
				}
			},
			include: {
				course: {
					include: {
						lessons: {
							where: {
								isPublished: true
							},
							select: {
								id: true
							}
						}
					}
				}
			}
		});
		
		const certificates = await db.certificate.findMany({
			where: {
				userId: locals.user.id
			},
			include: {
				course: {
					select: {
						title: true,
						language: true
					}
				}
			},
			orderBy: {
				dateIssued: 'desc'
			}
		});
		
		return {
			...baseData,
			enrollments,
			certificates,
			role: 'STUDENT'
		};
	}
};
