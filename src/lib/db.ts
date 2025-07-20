import './env'; // Load and validate environment variables
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['query'],
		errorFormat: 'pretty'
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Test database connection
export async function testConnection() {
	try {
		await db.$connect();
		console.log('✅ Database connected successfully');
		return true;
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		return false;
	}
}
