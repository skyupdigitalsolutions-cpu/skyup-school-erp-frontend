import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchNotices = createAsyncThunk('notices/list', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/notices', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchNoticeStats = createAsyncThunk('notices/stats', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/notices/stats'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const fetchLatestNotices = createAsyncThunk('notices/latest', async (limit = 5, { rejectWithValue }) => {
  try { const { data } = await api.get('/notices/latest', { params: { limit } }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createNotice = createAsyncThunk('notices/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/notices', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to publish notice.' }); }
});
export const updateNotice = createAsyncThunk('notices/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/notices/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update notice.' }); }
});
export const deleteNotice = createAsyncThunk('notices/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/notices/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'notices',
  initialState: { list: [], latest: [], meta: { total: 0, page: 1, limit: 20, pages: 1 }, stats: null, listLoading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotices.pending, s => { s.listLoading = true; })
     .addCase(fetchNotices.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchNotices.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchNoticeStats.fulfilled, (s, { payload }) => { s.stats = payload; });
    b.addCase(fetchLatestNotices.fulfilled, (s, { payload }) => { s.latest = payload; });
    b.addCase(createNotice.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    b.addCase(updateNotice.fulfilled, (s, { payload }) => {
      const i = s.list.findIndex(x => x._id === payload._id);
      if (i !== -1) s.list[i] = payload;
    });
    b.addCase(deleteNotice.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); });
  },
});
export default slice.reducer;