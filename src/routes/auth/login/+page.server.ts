import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { verifyPassword, generateToken } from '$lib/auth';
import { loginSchema } from '$lib/validators';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		
		// Validate input
		const validation = loginSchema.safeParse({ email, password });
		if (!validation.success) {
			return fail(400, {
				error: 'Please check your input and try again.',
				errors: validation.error.flatten().fieldErrors,
				email
			});
		}
		
		try {
			// Find user by email
			const user = await db.user.findUnique({
				where: { email: validation.data.email.toLowerCase() }
			});
			
			if (!user) {
				return fail(400, {
					error: 'Invalid email or password.',
					email
				});
			}
			
			// Check if user is banned or suspended
			if (user.banned) {
				return fail(403, {
					error: 'Your account has been banned. Please contact support.',
					email
				});
			}
			
			if (user.suspended) {
				return fail(403, {
					error: 'Your account has been suspended. Please contact support.',
					email
				});
			}
			
			// Verify password
			const isValidPassword = await verifyPassword(validation.data.password, user.passwordHash);
			if (!isValidPassword) {
				return fail(400, {
					error: 'Invalid email or password.',
					email
				});
			}
			
			// Generate JWT token
			const token = generateToken(user);
			
			// Set secure cookie
			cookies.set('auth-token', token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
			
			// Redirect based on role
			if (user.role === 'ADMIN') {
				throw redirect(303, '/admin');
			} else {
				throw redirect(303, '/dashboard');
			}
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			
			console.error('Login error:', error);
			return fail(500, {
				error: 'An error occurred. Please try again.',
				email
			});
		}
	}
};
