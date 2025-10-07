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

// Keep-alive mechanism for database connection
let keepAliveInterval: NodeJS.Timeout | null = null;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

export function startDatabaseKeepAlive() {
	// Prevent multiple intervals
	if (keepAliveInterval) return;
	
	console.log('🔄 Starting database keep-alive (ping every 5 minutes)');
	
	// Ping database every 5 minutes (less aggressive)
	keepAliveInterval = setInterval(async () => {
		try {
			// MongoDB: Use a simple query with timeout
			await db.user.findFirst({
				take: 1,
				select: { id: true }
			});
			
			// Reset failure counter on success
			if (consecutiveFailures > 0) {
				console.log('💚 Database connection restored');
				consecutiveFailures = 0;
			}
		} catch {
			consecutiveFailures++;
			
			// Only log errors occasionally to avoid spam
			if (consecutiveFailures === 1) {
				console.warn('⚠️  Database keep-alive ping failed (will retry silently)');
			} else if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
				console.error(`❌ Database connection issues (${consecutiveFailures} consecutive failures)`);
				// Don't spam logs - just note it's having issues
				if (consecutiveFailures === MAX_CONSECUTIVE_FAILURES) {
					console.log('ℹ️  Continuing to retry in background...');
				}
			}
		}
	}, 5 * 60 * 1000); // 5 minutes (less aggressive)
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
	maxRetries: number = 5, // Retry attempts for database operations
	baseDelay: number = 2000 // Base delay of 2s between retries
): Promise<T> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorCode = (error as { code?: string }).code;
			
			const isConnectionError = 
				errorMessage?.includes("Can't reach database") ||
				errorMessage?.includes('Connection refused') ||
				errorMessage?.includes('ECONNREFUSED') ||
				errorCode === 'P1001';
			
			if (isConnectionError && attempt === 1) {
				console.log('🔄 Database connection issue detected, retrying...');
			}
			
			console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, errorMessage);
			
			if (attempt === maxRetries) {
				throw new Error(`Database operation failed after ${maxRetries} attempts: ${errorMessage}`);
			}
			
			// Exponential backoff: 2s, 4s, 8s, 16s...
			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.log(`⏳ Retrying in ${delay}ms...`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	throw new Error('Operation failed');
}

// Test database connection with retry logic
export async function testConnection(): Promise<boolean> {
	try {
		await withRetry(async () => {
			// MongoDB: Use a simple query instead of $queryRaw
			await db.user.findFirst();
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
