import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';

export const GET: RequestHandler = async () => {
  try {
    // Simple database health check
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return json({
      status: 'healthy',
      database: 'connected',
      responseTime: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
};