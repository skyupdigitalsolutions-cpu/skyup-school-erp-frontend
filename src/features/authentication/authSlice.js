import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { setAccessToken, clearAccessToken } from '@/lib/tokenStore';

/**
 * Logs in against the currently-set tenant (the School Code field on the
 * Login page writes `tenantSlug` to localStorage BEFORE this fires, so the
 * axios interceptor already attaches X-Tenant-Id by the time this request
 * goes out).
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Unable to sign in. Check your school code, email and password.'
      );
    }
  }
);

/**
 * Attempts to silently restore a session on app load using the HttpOnly
 * refresh cookie (if the browser still has one from a previous visit and
 * `tenantSlug` is still set). Deliberately swallows failure — "not logged
 * in yet" is an expected, non-error outcome on first visit.
 */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  const tenant = localStorage.getItem('tenantSlug');
  if (!tenant) return rejectWithValue(null);

  try {
    const { data } = await api.post('/auth/refresh');
    setAccessToken(data.data.accessToken);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(null);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAccessToken();
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
