import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { db } from '$lib/db';

export const handle: Handle = async ({ event, resolve }) => {
	// Get token from cookies
	const token = event.cookies.get('auth-token');
	
	if (token) {
		const payload = verifyToken(token);
		
		if (payload) {
			try {
				// Get user from database
				const user = await db.user.findUnique({
					where: { id: payload.userId },
					select: {
						id: true,
						name: true,
						email: true,
						role: true,
						suspended: true,
						banned: true
					}
				});
				
				if (user && !user.banned && !user.suspended) {
					event.locals.user = user;
				} else {
					// Clear invalid cookie
					event.cookies.delete('auth-token', { path: '/' });
				}
			} catch (error) {
				console.error('Error fetching user:', error);
				event.cookies.delete('auth-token', { path: '/' });
			}
		} else {
			// Clear invalid token
			event.cookies.delete('auth-token', { path: '/' });
		}
	}
	
	return resolve(event);
};
