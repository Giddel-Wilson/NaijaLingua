import './env'; // Load and validate environment variables
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Enhanced Prisma configuration with connection pooling and retry logic
export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
		errorFormat: 'pretty',
		datasources: {
			db: {
				url: process.env.DATABASE_URL
			}
		}
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Connection retry wrapper with exponential backoff
export async function withRetry<T>(
	operation: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<T> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error: any) {
			console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
			
			if (attempt === maxRetries) {
				throw new Error(`Database operation failed after ${maxRetries} attempts: ${error.message}`);
			}
			
			// Exponential backoff: 1s, 2s, 4s...
			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.log(`Retrying in ${delay}ms...`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	throw new Error('Operation failed');
}

// Test database connection with retry logic
export async function testConnection(): Promise<boolean> {
	try {
		await withRetry(async () => {
			await db.$queryRaw`SELECT 1`;
		});
		console.log('✅ Database connected successfully');
		return true;
	} catch (error) {
		console.error('❌ Database connection failed after retries:', error);
		return false;
	}
}

// Safe database operation wrapper that handles connection issues gracefully
export async function safeDbOperation<T>(
	operation: () => Promise<T>,
	fallbackValue?: T
): Promise<T | null> {
	try {
		return await withRetry(operation);
	} catch (error) {
		console.error('Database operation failed permanently:', error);
		if (fallbackValue !== undefined) {
			return fallbackValue;
		}
		return null;
	}
}
