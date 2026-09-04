'use strict';

/**
 * Holds the short-lived access token in memory only (never localStorage),
 * matching the backend's intent: "the client keeps it in memory" (see
 * auth.controller.js). The long-lived refresh token lives in an HttpOnly
 * cookie the browser manages automatically — this module never touches it.
 *
 * Module-scoped variable rather than Redux state so that axios.js (a plain
 * module, not a React component) can read/write it synchronously without
 * importing the store and risking circular imports with slices that import
 * `api`.
 */
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}
