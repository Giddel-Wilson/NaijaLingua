import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from '$lib/env.js';

export const GET: RequestHandler = async () => {
  const config = {
    cloudName: CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
    apiKey: CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
    apiSecret: CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
  };

  return json({
    cloudinary: config,
    timestamp: new Date().toISOString()
  });
};