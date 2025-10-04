// src/api.ts
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_PREFIX = (import.meta.env.VITE_API_PREFIX ?? '/api').replace(/\/+$/, '');
export const apiUrl = (path: string) => `${API_BASE}${API_PREFIX}${path}`;