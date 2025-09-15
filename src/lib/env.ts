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

// Export environment variables with validation
import { env } from '$env/dynamic/private';

// Ensure JWT secrets are properly set to avoid logout issues
const jwtSecret = env.JWT_SECRET;
const authSecret = env.AUTH_SECRET;

if (!jwtSecret || jwtSecret === 'fallback-secret') {
    console.warn('⚠️  JWT_SECRET not properly configured - sessions may be unstable');
}

if (!authSecret || authSecret === 'fallback-auth-secret') {
    console.warn('⚠️  AUTH_SECRET not properly configured');
}

export const JWT_SECRET = jwtSecret || 'dev-jwt-secret-stable-key-' + Date.now();
export const AUTH_SECRET = authSecret || 'dev-auth-secret-stable-key-' + Date.now();
export const DATABASE_URL = env.DATABASE_URL || '';

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_UPLOAD_PRESET = env.CLOUDINARY_UPLOAD_PRESET || 'naijalingua_preset';

// Igbo API Configuration
export const IGBO_API_KEY = env.IGBO_API_KEY || '';

// Maven API Configuration
export const MAVEN_API_KEY = env.MAVEN_API_KEY || '';

// Validate environment on module load
validateEnv();
