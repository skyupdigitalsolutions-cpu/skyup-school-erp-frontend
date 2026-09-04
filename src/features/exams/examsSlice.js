import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchExams = createAsyncThunk('exams/list', async (params={}, { rejectWithValue }) => {
  try { const { data } = await api.get('/exams', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchExamDashboard = createAsyncThunk('exams/dashboard', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/exams/dashboard'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createExam = createAsyncThunk('exams/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/exams', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to create.' }); }
});
export const fetchExam = createAsyncThunk('exams/fetch', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/exams/${id}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const updateExam = createAsyncThunk('exams/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/exams/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update.' }); }
});
export const changeExamStatus = createAsyncThunk('exams/status', async ({ id, status }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/exams/${id}/status`, { status }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const publishExamResults = createAsyncThunk('exams/publishResults', async (id, { rejectWithValue }) => {
  try { const { data } = await api.post(`/exams/${id}/publish-results`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const generateHallTickets = createAsyncThunk('exams/hallTickets', async ({ id, students }, { rejectWithValue }) => {
  try { const { data } = await api.post(`/exams/${id}/hall-tickets`, { students }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const deleteExam = createAsyncThunk('exams/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/exams/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'exams',
  initialState: { list: [], meta: { total:0, page:1, limit:20, pages:1 }, dashboard: null, current: null, listLoading: false, profileLoading: false, error: null },
  reducers: { clearExamError(state) { state.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchExams.pending, s => { s.listLoading = true; })
     .addCase(fetchExams.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchExams.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchExamDashboard.fulfilled, (s, { payload }) => { s.dashboard = payload; });
    b.addCase(fetchExam.pending, s => { s.profileLoading = true; s.current = null; })
     .addCase(fetchExam.fulfilled, (s, { payload }) => { s.profileLoading = false; s.current = payload; })
     .addCase(fetchExam.rejected, s => { s.profileLoading = false; });
    b.addCase(createExam.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    const patch = (s, { payload }) => { s.current = payload; const i = s.list.findIndex(x => x._id === payload._id); if (i !== -1) s.list[i] = payload; };
    b.addCase(updateExam.fulfilled, patch).addCase(changeExamStatus.fulfilled, patch).addCase(publishExamResults.fulfilled, patch).addCase(generateHallTickets.fulfilled, patch);
    b.addCase(deleteExam.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); if (s.current?._id === id) s.current = null; });
  },
});
export const { clearExamError } = slice.actions;
export default slice.reducer;
