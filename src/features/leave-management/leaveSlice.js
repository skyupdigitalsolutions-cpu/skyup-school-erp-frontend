import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchLeaveRequests = createAsyncThunk('leave/list', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/leave-management', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchLeaveStats = createAsyncThunk('leave/stats', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/leave-management/stats'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createLeaveRequest = createAsyncThunk('leave/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/leave-management', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to submit leave request.' }); }
});
export const approveLeaveRequest = createAsyncThunk('leave/approve', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await api.post(`/leave-management/${id}/approve`, { remarks }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to approve.' }); }
});
export const rejectLeaveRequest = createAsyncThunk('leave/reject', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await api.post(`/leave-management/${id}/reject`, { remarks }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to reject.' }); }
});
export const deleteLeaveRequest = createAsyncThunk('leave/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/leave-management/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'leaveManagement',
  initialState: { list: [], meta: { total: 0, page: 1, limit: 20, pages: 1 }, stats: null, listLoading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchLeaveRequests.pending, s => { s.listLoading = true; })
     .addCase(fetchLeaveRequests.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchLeaveRequests.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchLeaveStats.fulfilled, (s, { payload }) => { s.stats = payload; });
    b.addCase(createLeaveRequest.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    const replaceOne = (s, { payload }) => {
      const i = s.list.findIndex(x => x._id === payload._id);
      if (i !== -1) s.list[i] = payload;
    };
    b.addCase(approveLeaveRequest.fulfilled, replaceOne);
    b.addCase(rejectLeaveRequest.fulfilled, replaceOne);
    b.addCase(deleteLeaveRequest.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); });
  },
});
export default slice.reducer;