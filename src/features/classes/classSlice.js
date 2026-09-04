import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchClasses = createAsyncThunk('classes/list', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/classes', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchClassStats = createAsyncThunk('classes/stats', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/classes/stats'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createClass = createAsyncThunk('classes/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/classes', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to create.' }); }
});
export const fetchClass = createAsyncThunk('classes/fetch', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/classes/${id}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const updateClass = createAsyncThunk('classes/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/classes/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update.' }); }
});
export const deleteClass = createAsyncThunk('classes/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/classes/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'classes',
  initialState: { list: [], meta: { total: 0, page: 1, limit: 20, pages: 1 }, stats: null, current: null, listLoading: false, profileLoading: false, error: null },
  reducers: {
    clearClassError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchClasses.pending, s => { s.listLoading = true; })
     .addCase(fetchClasses.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchClasses.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchClassStats.fulfilled, (s, { payload }) => { s.stats = payload; });
    b.addCase(fetchClass.pending, s => { s.profileLoading = true; s.current = null; })
     .addCase(fetchClass.fulfilled, (s, { payload }) => { s.profileLoading = false; s.current = payload; })
     .addCase(fetchClass.rejected, s => { s.profileLoading = false; });
    b.addCase(createClass.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    b.addCase(updateClass.fulfilled, (s, { payload }) => {
      s.current = payload;
      const i = s.list.findIndex(x => x._id === payload._id);
      if (i !== -1) s.list[i] = payload;
    });
    b.addCase(deleteClass.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); if (s.current?._id === id) s.current = null; });
  },
});
export const { clearClassError } = slice.actions;
export default slice.reducer;