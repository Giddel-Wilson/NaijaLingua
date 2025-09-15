import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadToCloudinary } from '$lib/cloudinary';

export const POST: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    console.log('Testing Cloudinary upload with 1x1 pixel test image...');

    // Test upload to Cloudinary
    const uploadResult = await uploadToCloudinary(testImageBuffer, {
      folder: 'naijalingua/test',
      resource_type: 'image',
      public_id: `test_upload_${Date.now()}`
    });

    console.log('✅ Cloudinary upload successful:', uploadResult);

    return json({
      success: true,
      message: 'Cloudinary upload test successful',
      uploadResult: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      }
    });

  } catch (error) {
    console.error('❌ Cloudinary upload test failed:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};