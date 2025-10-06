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

// Keep-alive mechanism to prevent Neon database from sleeping
let keepAliveInterval: NodeJS.Timeout | null = null;

export function startDatabaseKeepAlive() {
	// Prevent multiple intervals
	if (keepAliveInterval) return;
	
	console.log('🔄 Starting database keep-alive (ping every 4 minutes)');
	
	// Ping database every 4 minutes (Neon free tier sleeps after 5 minutes)
	keepAliveInterval = setInterval(async () => {
		try {
			await db.$queryRaw`SELECT 1`;
			console.log('💚 Database keep-alive ping successful');
		} catch (error) {
			console.error('❌ Database keep-alive ping failed:', error);
		}
	}, 4 * 60 * 1000); // 4 minutes
}

export function stopDatabaseKeepAlive() {
	if (keepAliveInterval) {
		clearInterval(keepAliveInterval);
		keepAliveInterval = null;
		console.log('⏹️  Database keep-alive stopped');
	}
}

// Connection retry wrapper with exponential backoff
export async function withRetry<T>(
	operation: () => Promise<T>,
	maxRetries: number = 5, // Increased from 3 to 5 for Neon wake-up
	baseDelay: number = 2000 // Increased to 2s to give Neon time to wake up
): Promise<T> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error: any) {
			const isConnectionError = 
				error.message?.includes("Can't reach database") ||
				error.message?.includes('Connection refused') ||
				error.message?.includes('ECONNREFUSED') ||
				error.code === 'P1001';
			
			if (isConnectionError && attempt === 1) {
				console.log('🔄 Database appears to be sleeping, waking it up...');
			}
			
			console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
			
			if (attempt === maxRetries) {
				throw new Error(`Database operation failed after ${maxRetries} attempts: ${error.message}`);
			}
			
			// Exponential backoff with longer delays for Neon: 2s, 4s, 8s, 16s...
			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.log(`⏳ Retrying in ${delay}ms... (Neon database may be waking up)`);
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
