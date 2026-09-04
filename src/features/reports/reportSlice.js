import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchReportOverview = createAsyncThunk('reports/overview', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/reports/overview'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch reports.' }); }
});

const slice = createSlice({
  name: 'reports',
  initialState: { overview: null, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchReportOverview.pending, s => { s.loading = true; s.error = null; })
     .addCase(fetchReportOverview.fulfilled, (s, { payload }) => { s.loading = false; s.overview = payload; })
     .addCase(fetchReportOverview.rejected, (s, { payload }) => { s.loading = false; s.error = payload?.message; });
  },
});

export default slice.reducer;