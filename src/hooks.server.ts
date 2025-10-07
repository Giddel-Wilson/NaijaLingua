import '$lib/env'; // Load and validate environment variables
import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { db } from '$lib/db';

// Don't start keep-alive in hooks - it causes connection spam
// Keep-alive should only run in production with proper monitoring
// startDatabaseKeepAlive();

export const handle: Handle = async ({ event, resolve }) => {
	// Get token from cookies
	const token = event.cookies.get('auth-token');
	
	if (token) {
		try {
			const payload = verifyToken(token);
			
			if (payload) {
				// Get user from database with retry logic
				const user = await db.user.findUnique({
					where: { id: payload.userId },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						suspended: true,
						banned: true,
						bio: true,
						profileImage: true,
						createdAt: true,
						updatedAt: true
					}
				});
				
				if (user && !user.banned && !user.suspended) {
					event.locals.user = user;
				} else if (user && (user.banned || user.suspended)) {
					// Clear cookie for banned/suspended users
					event.cookies.delete('auth-token', { path: '/' });
					console.log(`Cleared auth token for ${user.banned ? 'banned' : 'suspended'} user: ${user.email}`);
				} else {
					// User not found - token is stale
					event.cookies.delete('auth-token', { path: '/' });
					console.log('Cleared auth token for non-existent user');
				}
			} else {
				// Invalid token
				event.cookies.delete('auth-token', { path: '/' });
				console.log('Cleared invalid auth token');
			}
		} catch (error) {
			console.error('Auth verification error:', error);
			
			// Handle ObjectId format errors (from database migration)
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorCode = (error as { code?: string }).code;
			
			if (errorCode === 'P2023' || errorMessage.includes('Malformed ObjectID')) {
				// Clear stale cookie from old database format
				event.cookies.delete('auth-token', { path: '/' });
				console.log('🔄 Cleared outdated auth token (database migration)');
			} else if (errorMessage.includes('ECONNREFUSED')) {
				// Don't clear cookie on temporary database connection errors
				console.log('Database connection error - keeping auth token');
			} else {
				// Other errors - clear cookie
				event.cookies.delete('auth-token', { path: '/' });
			}
		}
	}
	
	return resolve(event);
};
