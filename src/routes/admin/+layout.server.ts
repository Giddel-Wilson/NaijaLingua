import { redirect } from '@sveltejs/kit';
import { verifyJWT } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const token = cookies.get('authToken');
  
  if (!token) {
    throw redirect(302, '/auth/login');
  }

  try {
    const payload = await verifyJWT(token);
    
    if (!payload || payload.role !== 'ADMIN') {
      throw redirect(302, '/dashboard');
    }

    return {
      user: payload
    };
  } catch (error) {
    cookies.delete('authToken', { path: '/' });
    throw redirect(302, '/auth/login');
  }
};
