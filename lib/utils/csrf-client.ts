/**
 * CSRF TOKEN CLIENT UTILITIES
 * 
 * Helper functions for working with CSRF tokens on the client side
 * 
 * Usage:
 *   import { fetchWithCsrf, ensureCsrfToken } from '@/lib/utils/csrf-client';
 *   
 *   // Automatic CSRF handling
 *   const response = await fetchWithCsrf('/api/transfers/book', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 */

/**
 * Get CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Ensure CSRF token exists, request if missing
 */
export async function ensureCsrfToken(): Promise<string> {
  let token = getCsrfToken();

  if (!token) {
    try {
      const response = await fetch('/api/csrf-token');
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      const data = await response.json();
      token = data.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw new Error('Unable to obtain CSRF token');
    }
  }

  return token;
}

/**
 * Fetch with automatic CSRF token handling
 * 
 * Automatically adds X-CSRF-Token header to all requests
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await ensureCsrfToken();

  // Merge headers
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', token);

  // Ensure Content-Type for POST/PUT/PATCH
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Check if CSRF protection is enabled
 */
export function isCsrfEnabled(): boolean {
  // Can be controlled via environment variable
  return process.env.NEXT_PUBLIC_CSRF_ENABLED !== 'false';
}
