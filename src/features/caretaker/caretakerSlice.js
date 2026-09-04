import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchCaretakers = createAsyncThunk('caretaker/list', async (params={}, { rejectWithValue }) => {
  try { const { data } = await api.get('/caretakers', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchCaretakerStats = createAsyncThunk('caretaker/stats', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/caretakers/stats'); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createCaretaker = createAsyncThunk('caretaker/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/caretakers', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to create.' }); }
});
export const fetchCaretaker = createAsyncThunk('caretaker/fetch', async (id, { rejectWithValue }) => {
  try { const { data } = await api.get(`/caretakers/${id}`); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const updateCaretaker = createAsyncThunk('caretaker/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/caretakers/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update.' }); }
});
export const changeCaretakerStatus = createAsyncThunk('caretaker/status', async ({ id, status }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/caretakers/${id}/status`, { status }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const verifyCaretaker = createAsyncThunk('caretaker/verify', async ({ id, status }, { rejectWithValue }) => {
  try { const { data } = await api.patch(`/caretakers/${id}/verify`, { status }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const deleteCaretaker = createAsyncThunk('caretaker/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/caretakers/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const bulkCaretakerStatus = createAsyncThunk('caretaker/bulkStatus', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/caretakers/bulk/status', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'caretaker',
  initialState: { list: [], meta: { total:0, page:1, limit:20, pages:1 }, stats: null, current: null, listLoading: false, profileLoading: false, error: null, selectedIds: [] },
  reducers: {
    toggleSelectCaretaker(state, { payload }) { state.selectedIds.includes(payload) ? state.selectedIds = state.selectedIds.filter(x=>x!==payload) : state.selectedIds.push(payload); },
    clearCaretakerSelection(state) { state.selectedIds = []; },
    clearCaretakerError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(fetchCaretakers.pending, s => { s.listLoading = true; })
     .addCase(fetchCaretakers.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchCaretakers.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchCaretakerStats.fulfilled, (s, { payload }) => { s.stats = payload; });
    b.addCase(fetchCaretaker.pending, s => { s.profileLoading = true; s.current = null; })
     .addCase(fetchCaretaker.fulfilled, (s, { payload }) => { s.profileLoading = false; s.current = payload; })
     .addCase(fetchCaretaker.rejected, s => { s.profileLoading = false; });
    b.addCase(createCaretaker.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    const patch = (s, { payload }) => { s.current = payload; const i = s.list.findIndex(x => x._id === payload._id); if (i !== -1) s.list[i] = payload; };
    b.addCase(updateCaretaker.fulfilled, patch).addCase(changeCaretakerStatus.fulfilled, patch).addCase(verifyCaretaker.fulfilled, patch);
    b.addCase(deleteCaretaker.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); if (s.current?._id === id) s.current = null; });
  },
});
export const { toggleSelectCaretaker, clearCaretakerSelection, clearCaretakerError } = slice.actions;
export default slice.reducer;
