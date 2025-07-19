import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { hashPassword, generateToken } from '$lib/auth';
import { registerSchema } from '$lib/validators';
import type { Actions } from './$types';

export const actions: Actions = {
	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;
		const terms = data.get('terms') as string;
		
		// Validate input
		const validation = registerSchema.safeParse({ 
			name, 
			email, 
			password, 
			confirmPassword 
		});
		
		if (!validation.success) {
			return fail(400, {
				error: 'Please check your input and try again.',
				errors: validation.error.flatten().fieldErrors,
				name,
				email
			});
		}
		
		// Check if terms are accepted
		if (!terms) {
			return fail(400, {
				error: 'Please accept the terms of service.',
				name,
				email
			});
		}
		
		try {
			// Check if user already exists
			const existingUser = await db.user.findUnique({
				where: { email: validation.data.email.toLowerCase() }
			});
			
			if (existingUser) {
				return fail(400, {
					error: 'An account with this email already exists.',
					name,
					email
				});
			}
			
			// Hash password
			const passwordHash = await hashPassword(validation.data.password);
			
			// Create user
			const user = await db.user.create({
				data: {
					name: validation.data.name,
					email: validation.data.email.toLowerCase(),
					passwordHash,
					role: 'STUDENT'
				}
			});
			
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
			
			// Redirect to dashboard
			throw redirect(303, '/dashboard');
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			
			console.error('Registration error:', error);
			return fail(500, {
				error: 'An error occurred while creating your account. Please try again.',
				name,
				email
			});
		}
	}
};
