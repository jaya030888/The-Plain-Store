const raw = import.meta.env.VITE_API_URL;
export const API_URL = raw
  ? String(raw).replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');
