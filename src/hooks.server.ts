import '$lib/env'; // Load and validate environment variables
import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { db, startDatabaseKeepAlive } from '$lib/db';

// Start database keep-alive to prevent Neon from sleeping
startDatabaseKeepAlive();

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
			// Don't clear cookie on database errors - might be temporary
			if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
				console.log('Database connection error - keeping auth token');
			} else {
				event.cookies.delete('auth-token', { path: '/' });
			}
		}
	}
	
	return resolve(event);
};
