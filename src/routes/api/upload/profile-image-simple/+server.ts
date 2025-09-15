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
    console.log('=== Simple Profile Image Upload ===');
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

    console.log('Converting to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer created, size:', buffer.length);

    console.log('Starting SIMPLE Cloudinary upload (no transformations)...');
    
    // Simplified upload - no complex transformations
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'naijalingua/profiles',
      resource_type: 'image',
      public_id: `profile_simple_${user.id}_${Date.now()}`
      // No transformations to avoid potential issues
    });

    console.log('Cloudinary upload successful:', uploadResult.secure_url);

    console.log('Updating database...');
    await db.user.update({
      where: { id: user.id },
      data: { profileImage: uploadResult.secure_url }
    });

    console.log('Simple upload complete!');

    return json({
      success: true,
      imageUrl: uploadResult.secure_url,
      message: 'Profile image uploaded successfully (simple version)'
    });

  } catch (error) {
    console.error('Simple upload error:', error);
    return json({ 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 });
  }
};