import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import bcrypt from 'bcryptjs';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Get full user data including bio and profile image
		const fullUser = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				bio: true,
				profileImage: true,
				createdAt: true,
				updatedAt: true,
				suspended: true,
				banned: true
			}
		});

		return {
			user: fullUser || user
		};
	} catch (error) {
		console.error('Error loading user settings:', error);
		return {
			user
		};
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			console.error('Profile update failed: No user in locals');
			return fail(401, { message: 'Unauthorized' });
		}

		console.log('Profile update request from user:', user.id, user.email);

		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const bio = data.get('bio') as string;
		const profileImage = data.get('profileImage') as string;

		console.log('Profile update data:', { name, email, bio, profileImage: profileImage ? 'present' : 'not present' });

		// Validate required fields
		if (!name || !email) {
			console.error('Profile update failed: Missing required fields', { name: !!name, email: !!email });
			return fail(400, { message: 'Name and email are required' });
		}

		try {
			console.log('Attempting to update user profile in database...');
			
			const updatedUser = await db.user.update({
				where: { id: user.id },
				data: {
					name: name,
					email: email,
					bio: bio || null,
					profileImage: profileImage || null
				}
			});

			console.log('Profile updated successfully:', updatedUser.email);
			return { success: true, message: 'Profile updated successfully!' };
		} catch (error) {
			console.error('Profile update error:', error);
			
			// Check if it's a unique constraint error (duplicate email)
			if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
				console.error('Duplicate email error');
				return fail(400, { message: 'Email address is already in use' });
			}
			
			return fail(500, { message: 'Failed to update profile. Please try again.' });
		}
	},

	changePassword: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const data = await request.formData();
		const currentPassword = data.get('currentPassword') as string;
		const newPassword = data.get('newPassword') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		// Validation
		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { message: 'All password fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'New passwords do not match' });
		}

		if (newPassword.length < 6) {
			return fail(400, { message: 'New password must be at least 6 characters' });
		}

		try {
			// Get user with password
			const userWithPassword = await db.user.findUnique({
				where: { id: user.id }
			});

			if (!userWithPassword?.passwordHash) {
				return fail(400, { message: 'Password not found' });
			}

			// Verify current password
			const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
			if (!isValidPassword) {
				return fail(400, { message: 'Current password is incorrect' });
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password
			await db.user.update({
				where: { id: user.id },
				data: { passwordHash: hashedPassword }
			});

			return { success: true, message: 'Password changed successfully!' };
		} catch (error) {
			console.error('Password change error:', error);
			return fail(500, { message: 'Failed to change password' });
		}
	},

	deleteAccount: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const data = await request.formData();
		const confirmPassword = data.get('confirmPassword') as string;

		if (!confirmPassword) {
			return fail(400, { message: 'Password confirmation required' });
		}

		try {
			// Get user with password
			const userWithPassword = await db.user.findUnique({
				where: { id: user.id }
			});

			if (!userWithPassword?.passwordHash) {
				return fail(400, { message: 'Password not found' });
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(confirmPassword, userWithPassword.passwordHash);
			if (!isValidPassword) {
				return fail(400, { message: 'Incorrect password' });
			}

			// Delete user account (cascading deletes will handle related records)
			await db.user.delete({
				where: { id: user.id }
			});

			throw redirect(302, '/auth/login?message=Account deleted successfully');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Account deletion error:', error);
			return fail(500, { message: 'Failed to delete account' });
		}
	}
};
