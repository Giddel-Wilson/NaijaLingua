// Session management utilities for better auth persistence
import { browser } from '$app/environment';

export function getAuthStatus(): boolean {
    if (!browser) return false;
    
    // Check if we have an auth token cookie
    return document.cookie.includes('auth-token=');
}

export function clearAuthCache(): void {
    if (!browser) return;
    
    // Clear any client-side auth cache if needed
    sessionStorage.removeItem('user');
    localStorage.removeItem('auth-cache');
}

// Debug helper to check auth state
export function debugAuthState(): void {
    if (!browser) return;
    
    console.log('Auth Debug:', {
        hasAuthToken: getAuthStatus(),
        cookies: document.cookie.split(';').filter(c => c.includes('auth')),
        userAgent: navigator.userAgent
    });
}

// Auto-refresh mechanism for long-running sessions
export function setupAuthRefresh(): void {
    if (!browser) return;
    
    // Refresh auth state every 5 minutes in background
    setInterval(() => {
        if (getAuthStatus()) {
            // Could add a silent refresh endpoint call here if needed
            console.log('Auth refresh check - user still logged in');
        }
    }, 5 * 60 * 1000); // 5 minutes
}