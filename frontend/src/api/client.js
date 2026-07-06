import axios from 'axios';

// Requests go to a relative `/api` path which the Vite dev server proxies to
// the backend (see vite.config.js). This keeps the app same-origin and avoids
// CORS in development. VITE_API_BASE_URL can override it if ever needed.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

/** Turn an axios error into a human-readable message. */
export function extractError(error) {
  const data = error?.response?.data;
  if (data) {
    if (data.fieldErrors) {
      const messages = Object.values(data.fieldErrors);
      if (messages.length) return messages.join(' ');
    }
    if (data.message) return data.message;
  }
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}

/** Return the per-field validation errors from a 400 response, or null. */
export function extractFieldErrors(error) {
  return error?.response?.data?.fieldErrors ?? null;
}

export default api;
