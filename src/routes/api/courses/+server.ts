import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { verifyJWT } from '$lib/auth';
import { uploadToCloudinary } from '$lib/cloudinary';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		// Verify user is instructor or admin
		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		const formData = await request.formData();
		
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const language = formData.get('language') as string;
		const level = formData.get('level') as string;
		const category = formData.get('category') as string;
		const price = parseFloat(formData.get('price') as string) || 0;
		const currency = formData.get('currency') as string || 'USD';
		const tags = JSON.parse(formData.get('tags') as string || '[]');
		const isPublished = formData.get('isPublished') === 'true';
		const image = formData.get('image') as File;

		if (!title?.trim()) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Handle image upload
		let imageUrl = null;
		if (image && image.size > 0) {
			try {
				const buffer = Buffer.from(await image.arrayBuffer());
				const uploadResult = await uploadToCloudinary(buffer, {
					folder: 'naijalingua/courses',
					resource_type: 'image',
					public_id: `course_${Date.now()}`,
					transformation: [
						{ width: 800, height: 600, crop: 'fill' }
					]
				});
				imageUrl = uploadResult.secure_url;
			} catch (uploadError) {
				console.error('Image upload error:', uploadError);
				// Continue without image rather than failing the whole request
			}
		}

		// Create the course
		const course = await db.course.create({
			data: {
				title: title.trim(),
				description: description?.trim() || null,
				language: language as any,
				level: level as any,
				category: category?.trim() || null,
				price,
				currency,
				tags,
				imageUrl,
				isPublished,
				isApproved: user.role === 'ADMIN', // Auto-approve admin courses
				createdById: user.id
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

		return json(course, { status: 201 });
	} catch (error) {
		console.error('Course creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const token = cookies.get('token');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyJWT(token);
		if (!payload) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const user = await db.user.findUnique({
			where: { id: payload.userId }
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Get query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const search = url.searchParams.get('search') || '';
		const language = url.searchParams.get('language') || '';
		const level = url.searchParams.get('level') || '';
		const isPublished = url.searchParams.get('published');

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		// If user is instructor, only show their courses
		if (user.role === 'INSTRUCTOR') {
			where.createdById = user.id;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } }
			];
		}

		if (language) {
			where.language = language;
		}

		if (level) {
			where.level = level;
		}

		if (isPublished !== null) {
			where.isPublished = isPublished === 'true';
		}

		// Get courses and count
		const [courses, total] = await Promise.all([
			db.course.findMany({
				where,
				skip,
				take: limit,
				orderBy: { updatedAt: 'desc' },
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
			}),
			db.course.count({ where })
		]);

		return json({
			courses,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Courses fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
