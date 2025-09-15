import { put } from '@vercel/blob';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('=== Vercel Blob Profile Image Upload ===');
    console.log('User:', user.id, user.email);
    
    const formData = await request.formData();
    const file = formData.get('image') as File;

    console.log('File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    console.log('File validation passed. Uploading to Vercel Blob...');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `profile_${user.id}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    console.log('Vercel Blob upload successful:', blob.url);

    console.log('Updating database...');
    
    // Update user's profile image in database
    await db.user.update({
      where: { id: user.id },
      data: { profileImage: blob.url }
    });

    console.log('Database updated successfully');
    console.log('=== Vercel Blob Upload Complete ===');

    return json({
      success: true,
      imageUrl: blob.url,
      message: 'Profile image uploaded successfully with Vercel Blob!'
    });

  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    return json({ 
      error: 'Failed to upload image. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};