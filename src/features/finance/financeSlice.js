import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export const fetchTransactions = createAsyncThunk('finance/list', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/finance', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to fetch.' }); }
});
export const fetchFinanceStats = createAsyncThunk('finance/stats', async (params = {}, { rejectWithValue }) => {
  try { const { data } = await api.get('/finance/stats', { params }); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});
export const createTransaction = createAsyncThunk('finance/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/finance', payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to record transaction.' }); }
});
export const updateTransaction = createAsyncThunk('finance/update', async ({ id, payload }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/finance/${id}`, payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data || { message: 'Failed to update.' }); }
});
export const deleteTransaction = createAsyncThunk('finance/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/finance/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const slice = createSlice({
  name: 'finance',
  initialState: { list: [], meta: { total: 0, page: 1, limit: 20, pages: 1 }, stats: null, listLoading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTransactions.pending, s => { s.listLoading = true; })
     .addCase(fetchTransactions.fulfilled, (s, { payload }) => { s.listLoading = false; s.list = payload.data; s.meta = payload.meta || s.meta; })
     .addCase(fetchTransactions.rejected, (s, { payload }) => { s.listLoading = false; s.error = payload?.message; });
    b.addCase(fetchFinanceStats.fulfilled, (s, { payload }) => { s.stats = payload; });
    b.addCase(createTransaction.fulfilled, (s, { payload }) => { s.list.unshift(payload); });
    b.addCase(updateTransaction.fulfilled, (s, { payload }) => {
      const i = s.list.findIndex(x => x._id === payload._id);
      if (i !== -1) s.list[i] = payload;
    });
    b.addCase(deleteTransaction.fulfilled, (s, { payload: id }) => { s.list = s.list.filter(x => x._id !== id); });
  },
});
export default slice.reducer;