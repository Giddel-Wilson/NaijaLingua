import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Delete the auth cookie
		cookies.delete('auth-token', { path: '/' });
		
		// Redirect to home page
		throw redirect(303, '/');
	}
};
