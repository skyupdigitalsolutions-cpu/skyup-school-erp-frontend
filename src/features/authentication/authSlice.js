import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { setAccessToken, clearAccessToken } from '@/lib/tokenStore';
import { setAuthPortal, clearAuthPortal, getAuthPortal } from '@/lib/authPortal';

/**
 * Two completely separate backend login endpoints exist:
 *  - POST /auth/login          -> staff (principal/teacher/administrator/caretaker/finance),
 *                                 responds with { user, accessToken, refreshToken }
 *  - POST /student-auth/login  -> student/parent viewers,
 *                                 responds with { viewer, accessToken, refreshToken }
 *
 * The single login form doesn't ask "are you staff or a student", so we try
 * the staff endpoint first and fall back to the student/parent endpoint on
 * an auth failure. Whichever one succeeds, we normalize the result to a
 * single shape ({ ...person, roles: [...] }) so the rest of the app (and the
 * role -> home-path redirect) never has to know which endpoint answered.
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      setAuthPortal('staff');
      return data.data.user; // { id, name, email, roles, status, lastLoginAt }
    } catch (staffErr) {
      const staffStatus = staffErr.response?.status;
      // Only fall back on "wrong credentials for this endpoint" — a network
      // error or a 429 (rate limit) should surface as-is, not be masked by
      // a second failing request.
      if (staffStatus !== 401 && staffStatus !== 404) {
        return rejectWithValue(
          staffErr.response?.data?.message || 'Unable to sign in. Check your school code, email and password.'
        );
      }

      try {
        const { data } = await api.post('/student-auth/login', { email, password });
        setAccessToken(data.data.accessToken);
        setAuthPortal('viewer');
        return data.data.viewer; // { id, viewerType, roles, studentId, name, ... }
      } catch (viewerErr) {
        return rejectWithValue(
          viewerErr.response?.data?.message || 'Unable to sign in. Check your school code, email and password.'
        );
      }
    }
  }
);

/**
 * Attempts to silently restore a session on app load using the HttpOnly
 * refresh cookie. Which refresh endpoint to call depends on which portal
 * last logged in successfully (persisted alongside tenantSlug), since staff
 * and student/parent sessions are issued by two different endpoints.
 */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const tenant = localStorage.getItem('tenantSlug');
  const portal = getAuthPortal();
  if (!tenant || !portal) return rejectWithValue(null);

  try {
    const endpoint = portal === 'viewer' ? '/student-auth/refresh' : '/auth/refresh';
    const { data } = await api.post(endpoint);
    setAccessToken(data.data.accessToken);
    return data.data.user || data.data.viewer;
  } catch (err) {
    return rejectWithValue(null);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const portal = getAuthPortal();
  try {
    const endpoint = portal === 'viewer' ? '/student-auth/logout' : '/auth/logout';
    await api.post(endpoint);
  } finally {
    clearAccessToken();
    clearAuthPortal();
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    initialized: false, // becomes true once bootstrapAuth has settled once
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.user = payload;
      })
      .addCase(login.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload;
      })
      .addCase(bootstrapAuth.fulfilled, (s, { payload }) => {
        s.user = payload;
        s.initialized = true;
      })
      .addCase(bootstrapAuth.rejected, (s) => {
        s.user = null;
        s.initialized = true;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = 'idle';
      });
  },
});

export default slice.reducer;
