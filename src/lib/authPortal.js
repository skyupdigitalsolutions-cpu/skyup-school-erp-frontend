'use strict';

/**
 * Which backend auth surface issued the current session:
 *  - 'staff'  -> /auth/login, /auth/refresh, /auth/logout
 *  - 'viewer' -> /student-auth/login, /student-auth/refresh, /student-auth/logout
 *
 * Persisted in localStorage (like tenantSlug) — NOT in-memory only — because
 * bootstrapAuth needs it on a fresh page load, before any Redux state exists,
 * to know which refresh endpoint to call.
 */
const KEY = 'authPortal';

export function getAuthPortal() {
  return localStorage.getItem(KEY);
}

export function setAuthPortal(portal) {
  localStorage.setItem(KEY, portal);
}

export function clearAuthPortal() {
  localStorage.removeItem(KEY);
}
