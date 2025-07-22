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

		const lessonId = params.lessonId;

		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						createdById: true,
						isPublished: true
					}
				},
				quizzes: {
					orderBy: { order: 'asc' }
				}
			}
		});

		if (!lesson) {
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check permissions
		const isCreator = lesson.course.createdById === user.id;
		const isAdmin = user.role === 'ADMIN';
		
		let isEnrolled = false;
		if (!isCreator && !isAdmin) {
			const enrollment = await db.enrollment.findUnique({
				where: {
					userId_courseId: {
						userId: user.id,
						courseId: lesson.course.id
					}
				}
			});
			isEnrolled = Boolean(enrollment);
		}

		if (!isCreator && !isAdmin && !isEnrolled && !lesson.course.isPublished) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		return json({
			...lesson,
			canEdit: isCreator || isAdmin
		});
	} catch (error) {
		console.error('Lesson fetch error:', error);
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

		const lessonId = params.lessonId;
		const formData = await request.formData();

		// Verify lesson exists
		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						id: true,
						createdById: true
					}
				}
			}
		});

		if (!lesson) {
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (lesson.course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Extract form data
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const contentHtml = formData.get('contentHtml') as string;
		const order = parseInt(formData.get('order') as string);
		const isPublished = formData.get('isPublished') === 'true';
		const imageFile = formData.get('image') as File | null;
		const videoFile = formData.get('video') as File | null;
		const audioFile = formData.get('audio') as File | null;
		const removeImage = formData.get('removeImage') === 'true';
		const removeVideo = formData.get('removeVideo') === 'true';
		const removeAudio = formData.get('removeAudio') === 'true';

		if (!title?.trim()) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Handle media updates
		let imageUrl = lesson.imageUrl;
		let videoUrl = lesson.videoUrl;
		let audioUrl = lesson.audioUrl;

		try {
			// Handle image
			if (removeImage && lesson.imageUrl) {
				const publicId = lesson.imageUrl.split('/').pop()?.split('.')[0];
				if (publicId) {
					await deleteFromCloudinary(publicId, 'image');
				}
				imageUrl = null;
			} else if (imageFile && imageFile.size > 0) {
				// Delete old image if exists
				if (lesson.imageUrl) {
					const publicId = lesson.imageUrl.split('/').pop()?.split('.')[0];
					if (publicId) {
						await deleteFromCloudinary(publicId, 'image');
					}
				}
				// Upload new image
				const buffer = Buffer.from(await imageFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${lesson.course.id}/lessons`,
					resource_type: 'image'
				});
				imageUrl = result.secure_url;
			}

			// Handle video
			if (removeVideo && lesson.videoUrl) {
				const publicId = lesson.videoUrl.split('/').pop()?.split('.')[0];
				if (publicId) {
					await deleteFromCloudinary(publicId, 'video');
				}
				videoUrl = null;
			} else if (videoFile && videoFile.size > 0) {
				// Delete old video if exists
				if (lesson.videoUrl) {
					const publicId = lesson.videoUrl.split('/').pop()?.split('.')[0];
					if (publicId) {
						await deleteFromCloudinary(publicId, 'video');
					}
				}
				// Upload new video
				const buffer = Buffer.from(await videoFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${lesson.course.id}/lessons`,
					resource_type: 'video'
				});
				videoUrl = result.secure_url;
			}

			// Handle audio
			if (removeAudio && lesson.audioUrl) {
				const publicId = lesson.audioUrl.split('/').pop()?.split('.')[0];
				if (publicId) {
					await deleteFromCloudinary(publicId, 'video'); // Audio stored as video
				}
				audioUrl = null;
			} else if (audioFile && audioFile.size > 0) {
				// Delete old audio if exists
				if (lesson.audioUrl) {
					const publicId = lesson.audioUrl.split('/').pop()?.split('.')[0];
					if (publicId) {
						await deleteFromCloudinary(publicId, 'video');
					}
				}
				// Upload new audio
				const buffer = Buffer.from(await audioFile.arrayBuffer());
				const result = await uploadToCloudinary(buffer, {
					folder: `courses/${lesson.course.id}/lessons`,
					resource_type: 'video' // Cloudinary treats audio as video
				});
				audioUrl = result.secure_url;
			}
		} catch (uploadError) {
			console.error('Media upload error:', uploadError);
			return json({ error: 'Failed to update media files' }, { status: 500 });
		}

		// Update lesson
		const updatedLesson = await db.lesson.update({
			where: { id: lessonId },
			data: {
				title: title?.trim() || lesson.title,
				description: description !== undefined ? (description.trim() || null) : lesson.description,
				contentHtml: contentHtml !== undefined ? (contentHtml.trim() || null) : lesson.contentHtml,
				order: !isNaN(order) ? order : lesson.order,
				isPublished: isPublished !== undefined ? isPublished : lesson.isPublished,
				imageUrl,
				videoUrl,
				audioUrl
			},
			include: {
				quizzes: {
					orderBy: { order: 'asc' }
				}
			}
		});

		return json(updatedLesson);
	} catch (error) {
		console.error('Lesson update error:', error);
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

		const lessonId = params.lessonId;

		// Verify lesson exists
		const lesson = await db.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						id: true,
						createdById: true
					}
				}
			}
		});

		if (!lesson) {
			return json({ error: 'Lesson not found' }, { status: 404 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (lesson.course.createdById !== user.id && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Delete media files from Cloudinary
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
				if (publicId) await deleteFromCloudinary(publicId, 'video');
			}
		} catch (deleteError) {
			console.error('Error deleting lesson media:', deleteError);
		}

		// Delete lesson (cascading deletes will handle quizzes)
		await db.lesson.delete({
			where: { id: lessonId }
		});

		return json({ message: 'Lesson deleted successfully' });
	} catch (error) {
		console.error('Lesson deletion error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
