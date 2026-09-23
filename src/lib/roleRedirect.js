'use strict';

/**
 * Single source of truth for "which portal does this role belong to".
 * Add new roles here (not in Login.jsx / ProtectedRoute.jsx) so the whole
 * app stays consistent when a new role is introduced.
 *
 * Keys are lower-cased role strings as returned by the backend
 * (`user.roles` from /auth/login, or `viewer.roles` from /student-auth/login).
 */
const ROLE_HOME = {
  principal: '/principal/dashboard',
  administrator: '/principal/dashboard',
  finance: '/principal/dashboard',
  caretaker: '/principal/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/student/dashboard',
};

/** Which top-level portal prefix a role is allowed into. */
const ROLE_PORTAL = {
  principal: 'principal',
  administrator: 'principal',
  finance: 'principal',
  caretaker: 'principal',
  teacher: 'teacher',
  student: 'student',
  parent: 'student',
};

/**
 * @param {string[] | undefined} roles - e.g. user.roles from the auth slice
 * @returns {string} the path the user should land on after login
 */
export function homePathForRoles(roles) {
  if (Array.isArray(roles)) {
    for (const role of roles) {
      const path = ROLE_HOME[String(role).toLowerCase()];
      if (path) return path;
    }
  }
  // Fall back to login rather than silently defaulting to a real portal —
  // an unrecognised role should never end up on someone else's dashboard.
  return '/login';
}

/**
 * @param {string[] | undefined} roles
 * @returns {string | null} 'principal' | 'teacher' | 'student' | null
 */
export function portalForRoles(roles) {
  if (Array.isArray(roles)) {
    for (const role of roles) {
      const portal = ROLE_PORTAL[String(role).toLowerCase()];
      if (portal) return portal;
    }
  }
  return null;
}
