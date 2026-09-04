import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchEvents = createAsyncThunk('events/list', async (params={}, { rejectWithValue }) => {
  try { const { data } = await api.get('/events', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchEventDashboard = createAsyncThunk('events/dashboard', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/events/dashboard'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createEvent = createAsyncThunk('events/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/events', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to create.' }); }
});
export const fetchEvent = createAsyncThunk('events/fetch', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/events/${id}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const updateEvent = createAsyncThunk('events/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/events/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update.' }); }
});
export const changeEventStatus = createAsyncThunk('events/status', async ({ id, status }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/events/${id}/status`, { status }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const deleteEvent = createAsyncThunk('events/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/events/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const bulkCancelEvents = createAsyncThunk('events/bulkCancel', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/events/bulk/cancel', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const STATUS_COLORS = { draft:'bg-gray-100 text-gray-600', pending_approval:'bg-yellow-100 text-yellow-700', approved:'bg-blue-100 text-blue-700', ongoing:'bg-green-100 text-green-700', completed:'bg-purple-100 text-purple-700', cancelled:'bg-red-100 text-red-700' };
export { STATUS_COLORS };

const slice = createSlice({
  name: 'events',
  initialState: { list: [], meta: { total:0, page:1, limit:20, pages:1 }, dashboard: null, current: null, listLoading: false, profileLoading: false, error: null, selectedIds: [] },
  reducers: {
    toggleSelectEvent(state, { payload }) { state.selectedIds.includes(payload) ? state.selectedIds = state.selectedIds.filter(x=>x!==payload) : state.selectedIds.push(payload); },
    clearEventSelection(state) { state.selectedIds = []; },
  },
  extraReducers: (b) => {
    b.addCase(fetchEvents.pending, s => { s.listLoading = true; })
     .addCase(fetchEvents.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchEvents.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchEventDashboard.fulfilled, (s, { payload }) => { s.dashboard = payload; });
    b.addCase(fetchEvent.pending, s => { s.profileLoading = true; s.current = null; })
     .addCase(fetchEvent.fulfilled, (s, { payload }) => { s.profileLoading = false; s.current = payload; })
     .addCase(fetchEvent.rejected, s => { s.profileLoading = false; });
    b.addCase(createEvent.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    const patch = (s, { payload }) => { s.current = payload; const i = s.list.findIndex(x => x._id === payload._id); if (i !== -1) s.list[i] = payload; };
    b.addCase(updateEvent.fulfilled, patch).addCase(changeEventStatus.fulfilled, patch);
    b.addCase(deleteEvent.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); if (s.current?._id === id) s.current = null; });
  },
});
export const { toggleSelectEvent, clearEventSelection } = slice.actions;
export default slice.reducer;
