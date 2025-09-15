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
		console.log('=== Profile Image Upload Debug ===');
		console.log('User:', user.id, user.email);
		
		const formData = await request.formData();
		const file = formData.get('image') as File;

		console.log('File received:', {
			name: file?.name,
			size: file?.size,
			type: file?.type
		});

		if (!file) {
			console.error('No file provided in form data');
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			console.error('Invalid file type:', file.type);
			return json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			console.error('File too large:', file.size);
			return json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
		}

		console.log('File validation passed. Converting to buffer...');
		
		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());
		console.log('Buffer created, size:', buffer.length);

		console.log('Starting Cloudinary upload...');
		
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

		console.log('Cloudinary upload successful:', uploadResult.secure_url);

		console.log('Updating database...');
		
		// Update user's profile image in database
		await db.user.update({
			where: { id: user.id },
			data: { profileImage: uploadResult.secure_url }
		});

		console.log('Database updated successfully');
		console.log('=== Profile Image Upload Complete ===');

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