import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';
import { deleteFromCloudinary } from '$lib/cloudinary';

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const courseId = params.id;

		const course = await db.course.findUnique({
			where: { id: courseId },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
				lessons: {
					orderBy: { order: 'asc' },
					include: {
						quizzes: {
							orderBy: { order: 'asc' }
						}
					}
				},
				_count: {
					select: {
						enrollments: true,
						lessons: true
					}
				}
			}
		});

		if (!course) {
			return json({ error: 'Course not found' }, { status: 404 });
		}

		// Check if user has permission to view this course
		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Allow access if user is course creator, admin, or enrolled student
		const isCreator = course.createdById === user.id;
		const isAdmin = user.role === 'ADMIN';
		
		let isEnrolled = false;
		if (!isCreator && !isAdmin) {
			const enrollment = await db.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: courseId
					}
				}
			});
			isEnrolled = Boolean(enrollment);
		}

		if (!isCreator && !isAdmin && !isEnrolled && !course.isPublished) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		return json({
			...course,
			canEdit: isCreator || isAdmin
		});
	} catch (error) {
		console.error('Course fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const courseId = params.id;
		const updateData = await request.json();

		// Verify course exists and user has permission
		const course = await db.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			return json({ error: 'Course not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Update course
		const updatedCourse = await db.course.update({
			where: { id: courseId },
			data: {
				title: updateData.title?.trim(),
				description: updateData.description?.trim() || null,
				language: updateData.language,
				level: updateData.level,
				category: updateData.category?.trim() || null,
				price: updateData.price || 0,
				currency: updateData.currency || 'USD',
				tags: updateData.tags || [],
				imageUrl: updateData.imageUrl
			},
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true
					}
				},
				_count: {
					select: {
						enrollments: true,
						lessons: true
					}
				}
			}
		});

		return json(updatedCourse);
	} catch (error) {
		console.error('Course update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const courseId = params.id;

		// Verify course exists and user has permission
		const course = await db.course.findUnique({
			where: { id: courseId },
			include: {
				lessons: true
			}
		});

		if (!course) {
			return json({ error: 'Course not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Check if course has enrollments
		const enrollmentCount = await db.enrollment.count({
			where: { courseId }
		});

		if (enrollmentCount > 0) {
			return json({ 
				error: 'Cannot delete course with active enrollments' 
			}, { status: 400 });
		}

		// Delete course image from Cloudinary if exists
		if (course.imageUrl) {
			try {
				// Extract public_id from URL
				const publicId = course.imageUrl.split('/').pop()?.split('.')[0];
				if (publicId) {
					await deleteFromCloudinary(publicId, 'image');
				}
			} catch (deleteError) {
				console.error('Error deleting course image:', deleteError);
			}
		}

		// Delete all lesson media from Cloudinary
		for (const lesson of course.lessons) {
			try {
				if (lesson.imageUrl) {
					const publicId = lesson.imageUrl.split('/').pop()?.split('.')[0];
					if (publicId) await deleteFromCloudinary(publicId, 'image');
				}
				if (lesson.videoUrl) {
					const publicId = lesson.videoUrl.split('/').pop()?.split('.')[0];
					if (publicId) await deleteFromCloudinary(publicId, 'video');
				}
				if (lesson.audioUrl) {
					const publicId = lesson.audioUrl.split('/').pop()?.split('.')[0];
					if (publicId) await deleteFromCloudinary(publicId, 'video'); // Audio is stored as video
				}
			} catch (deleteError) {
				console.error('Error deleting lesson media:', deleteError);
			}
		}

		// Delete course (cascading deletes will handle lessons, quizzes, etc.)
		await db.course.delete({
			where: { id: courseId }
		});

		return json({ message: 'Course deleted successfully' });
	} catch (error) {
		console.error('Course deletion error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
