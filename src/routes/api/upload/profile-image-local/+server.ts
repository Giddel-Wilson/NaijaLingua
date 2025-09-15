import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
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

		// Create uploads directory if it doesn't exist
		const uploadsDir = path.join(process.cwd(), 'static', 'uploads', 'profiles');
		if (!existsSync(uploadsDir)) {
			mkdirSync(uploadsDir, { recursive: true });
		}

		// Generate unique filename
		const fileExtension = path.extname(file.name);
		const fileName = `profile_${user.id}_${Date.now()}${fileExtension}`;
		const filePath = path.join(uploadsDir, fileName);
		const publicUrl = `/uploads/profiles/${fileName}`;

		// Convert file to buffer and save
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);

		// Update user's profile image in database
		await db.user.update({
			where: { id: user.id },
			data: { profileImage: publicUrl }
		});

		return json({
			success: true,
			imageUrl: publicUrl,
			message: 'Profile image uploaded successfully'
		});

	} catch (error) {
		console.error('Profile image upload error:', error);
		return json({ 
			error: 'Failed to upload image. Please try again.' 
		}, { status: 500 });
	}
};