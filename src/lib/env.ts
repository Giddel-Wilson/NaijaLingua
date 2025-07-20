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
export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || 'uploads',
    PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME || 'NaijaLingua',
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

// Validate environment on module load
validateEnv();
