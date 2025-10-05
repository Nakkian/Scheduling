export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_PREFIX = (import.meta.env.VITE_API_PREFIX ?? '/api').replace(/\/+$/, '');
export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE ?? 'apikey'); // none | apikey | auth0
export const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

export const apiUrl = (path: string) => `${API_BASE}${API_PREFIX}${path}`;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (AUTH_MODE === 'apikey' && ADMIN_API_KEY) {
    headers.set('X-API-Key', ADMIN_API_KEY);
  }
  const res = await fetch(apiUrl(path), { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
  return res;
}
