import axios from 'axios';

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

// Attach the school context header when a tenant slug is known (set at login).
api.interceptors.request.use((config) => {
  const tenant = localStorage.getItem('tenantSlug');
  if (tenant) config.headers['X-Tenant-Id'] = tenant;
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
      original._retry = true;
      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        flushQueue(null);
        return api(original);
      } catch (refreshError) {
        isRefreshing = false;
        flushQueue(refreshError);
        // Refresh failed — hand off to the auth flow (e.g. redirect to login).
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
