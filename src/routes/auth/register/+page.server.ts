import '$lib/env'; // Load and validate environment variables
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
			console.log('Checking for existing user with email:', validation.data.email.toLowerCase());
			const existingUser = await db.user.findUnique({
				where: { email: validation.data.email.toLowerCase() }
			});
			
			console.log('Existing user found:', existingUser);
			
			if (existingUser) {
				console.log('User already exists, returning error');
				return fail(400, {
					error: 'An account with this email already exists.',
					name,
					email
				});
			}
			
			console.log('No existing user, proceeding with registration');
			
			// Hash password
			console.log('Hashing password...');
			const passwordHash = await hashPassword(validation.data.password);
			console.log('Password hashed successfully');
			
			// Create user
			console.log('Creating user in database...');
			const user = await db.user.create({
				data: {
					name: validation.data.name,
					email: validation.data.email.toLowerCase(),
					passwordHash,
					role: 'STUDENT'
				}
			});
			
			console.log('User created successfully:', user.email);
			
			// Clear the form data and return success
			const successResponse = {
				success: true,
				message: 'Account created successfully! Redirecting to login page...',
				name: '',
				email: ''
			};
			console.log('Returning success response:', successResponse);
			return successResponse;
			
		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, {
				error: 'An error occurred while creating your account. Please try again.',
				name,
				email
			});
		}
	}
};
