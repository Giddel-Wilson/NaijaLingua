import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '$lib/cloudinary';

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

		const lessons = await db.lesson.findMany({
			where: { courseId },
			orderBy: { order: 'asc' },
			include: {
				quizzes: {
					orderBy: { order: 'asc' }
				}
			}
		});

		// Verify user has access to this course
		const course = await db.course.findUnique({
			where: { id: courseId }
		});

		if (!course) {
			return json({ error: 'Course not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check permissions
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

		return json(lessons);
	} catch (error) {
		console.error('Lessons fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
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
		const formData = await request.formData();

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

		// Extract form data
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const contentHtml = formData.get('contentHtml') as string;
		const order = parseInt(formData.get('order') as string) || 1;
		const imageFile = formData.get('image') as File | null;
		const videoFile = formData.get('video') as File | null;
		const audioFile = formData.get('audio') as File | null;

		if (!title?.trim()) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Upload media files to Cloudinary
		let imageUrl: string | null = null;
		let videoUrl: string | null = null;
		let audioUrl: string | null = null;

		try {
			if (imageFile && imageFile.size > 0) {
				const buffer = Buffer.from(await imageFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${courseId}/lessons`,
					resource_type: 'image'
				});
				imageUrl = result.secure_url;
			}

			if (videoFile && videoFile.size > 0) {
				const buffer = Buffer.from(await videoFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${courseId}/lessons`,
					resource_type: 'video'
				});
				videoUrl = result.secure_url;
			}

			if (audioFile && audioFile.size > 0) {
				const buffer = Buffer.from(await audioFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${courseId}/lessons`,
					resource_type: 'video' // Cloudinary treats audio as video
				});
				audioUrl = result.secure_url;
			}
		} catch (uploadError) {
			console.error('Media upload error:', uploadError);
			return json({ error: 'Failed to upload media files' }, { status: 500 });
		}

		// Create lesson
		const lesson = await db.lesson.create({
			data: {
				title: title.trim(),
				description: description?.trim() || null,
				contentHtml: contentHtml?.trim() || null,
				order,
				imageUrl,
				videoUrl,
				audioUrl,
				courseId
			},
			include: {
				quizzes: {
					orderBy: { order: 'asc' }
				}
			}
		});

		return json(lesson);
	} catch (error) {
		console.error('Lesson creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
