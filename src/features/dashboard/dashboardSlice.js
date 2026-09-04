import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchDashboardSummary = createAsyncThunk('dashboard/summary', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/dashboard/summary'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch dashboard.' }); }
});

const slice = createSlice({
  name: 'dashboard',
  initialState: { summary: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboardSummary.pending, s => { s.loading = true; s.error = null; })
     .addCase(fetchDashboardSummary.fulfilled, (s, { payload }) => { s.loading = false; s.summary = payload; })
     .addCase(fetchDashboardSummary.rejected, (s, { payload }) => { s.loading = false; s.error = payload?.message; });
  },
});

export default slice.reducer;