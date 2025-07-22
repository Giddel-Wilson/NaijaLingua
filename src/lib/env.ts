import 'dotenv/config';

// Ensure environment variables are loaded and validate critical ones
export function validateEnv() {
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'AUTH_SECRET'];
    
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
}

// Export environment variables with defaults
import { env } from '$env/dynamic/private';

export const JWT_SECRET = env.JWT_SECRET || 'fallback-secret';
export const AUTH_SECRET = env.AUTH_SECRET || 'fallback-auth-secret';
export const DATABASE_URL = env.DATABASE_URL || '';

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_UPLOAD_PRESET = env.CLOUDINARY_UPLOAD_PRESET || 'naijalingua_preset';

// Validate environment on module load
validateEnv();
