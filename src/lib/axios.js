import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';
import { getAuthPortal } from './authPortal';

/**
 * Pre-configured Axios instance used by every feature module's API layer.
 *  - baseURL from env (defaults to the Vite dev proxy path)
 *  - withCredentials so the HttpOnly refresh cookie is sent
 *  - a response interceptor that transparently refreshes an expired access
 *    token once, then replays the original request.
 *
 * There are two parallel auth surfaces (see authPortal.js):
 *  - staff:  /auth/login       /auth/refresh       /auth/logout
 *  - viewer: /student-auth/login /student-auth/refresh /student-auth/logout
 * The interceptor picks the matching refresh endpoint based on which one
 * last logged in successfully, so a teacher/principal session and a
 * student/parent session each get refreshed against the right backend route.
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

const LOGIN_PATHS = ['/auth/login', '/student-auth/login'];
const REFRESH_PATHS = ['/auth/refresh', '/student-auth/refresh'];

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
      if (LOGIN_PATHS.includes(original.url) || REFRESH_PATHS.includes(original.url)) {
        return Promise.reject(error);
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const portal = getAuthPortal();
        const refreshEndpoint = portal === 'viewer' ? '/student-auth/refresh' : '/auth/refresh';
        const { data } = await api.post(refreshEndpoint);
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
