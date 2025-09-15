import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadToCloudinary } from '$lib/cloudinary';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
		}

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Upload to Cloudinary with profile-specific settings
		const uploadResult = await uploadToCloudinary(buffer, {
			folder: 'naijalingua/profiles',
			resource_type: 'image',
			transformation: [
				{
					width: 200,
					height: 200,
					crop: 'fill',
					gravity: 'face',
					quality: 'auto:good',
					format: 'webp'
				}
			],
			public_id: `profile_${user.id}_${Date.now()}`
		});

		// Update user's profile image in database
		await db.user.update({
			where: { id: user.id },
			data: { profileImage: uploadResult.secure_url }
		});

		return json({
			success: true,
			imageUrl: uploadResult.secure_url,
			message: 'Profile image uploaded successfully'
		});

	} catch (error) {
		console.error('Profile image upload error:', error);
		return json({ 
			error: 'Failed to upload image. Please try again.' 
		}, { status: 500 });
	}
};