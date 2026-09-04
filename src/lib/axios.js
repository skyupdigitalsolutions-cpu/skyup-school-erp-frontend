import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

/**
 * Pre-configured Axios instance used by every feature module's API layer.
 *  - baseURL from env (defaults to the Vite dev proxy path)
 *  - withCredentials so the HttpOnly refresh cookie is sent
 *  - a response interceptor that transparently refreshes an expired access
 *    token once, then replays the original request.
 *
 * The actual /auth/refresh endpoint is provided by the Authentication module;
 * this interceptor is the client-side plumbing that will use it.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the school context header when a tenant slug is known (set at login),
// and the access token when one is held in memory (see tokenStore.js).
api.interceptors.request.use((config) => {
  const tenant = localStorage.getItem('tenantSlug');
  if (tenant) config.headers['X-Tenant-Id'] = tenant;

  const token = getAccessToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  return config;
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error) => {
  queue.forEach(({ resolve, reject, config }) =>
    error ? reject(error) : resolve(api(config))
  );
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject, config: original })
        );
      }
      // Never try to refresh a failed refresh/login call itself — avoids a
      // loop when there is no session at all (e.g. first load, logged out).
      if (original.url === '/auth/refresh' || original.url === '/auth/login') {
        return Promise.reject(error);
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data?.data?.accessToken);
        isRefreshing = false;
        flushQueue(null);
        return api(original);
      } catch (refreshError) {
        isRefreshing = false;
        clearAccessToken();
        flushQueue(refreshError);
        // Refresh failed — hand off to the auth flow (e.g. redirect to login).
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
