import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchStudents = createAsyncThunk(
  'principal/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/principal/students', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch students.' });
    }
  }
);

export const fetchStudentStats = createAsyncThunk(
  'principal/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/principal/students/stats');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch stats.' });
    }
  }
);

export const createStudent = createAsyncThunk(
  'principal/createStudent',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/principal/students', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create student.' });
    }
  }
);

export const fetchStudent = createAsyncThunk(
  'principal/fetchStudent',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/principal/students/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch student.' });
    }
  }
);

export const addStudentDocument = createAsyncThunk(
  'principal/addStudentDocument',
  async ({ id, document }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/principal/students/${id}/documents`, document);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to attach document.' });
    }
  }
);

export const updateStudent = createAsyncThunk(
  'principal/updateStudent',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/principal/students/${id}`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update student.' });
    }
  }
);

export const changeStudentStatus = createAsyncThunk(
  'principal/changeStudentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/principal/students/${id}/status`, { status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to change status.' });
    }
  }
);

export const archiveStudent = createAsyncThunk(
  'principal/archiveStudent',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/principal/students/${id}/archive`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to archive student.' });
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'principal/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/principal/students/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete student.' });
    }
  }
);

export const bulkPromoteStudents = createAsyncThunk(
  'principal/bulkPromoteStudents',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/principal/students/bulk/promote', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Bulk promote failed.' });
    }
  }
);

export const bulkStudentStatus = createAsyncThunk(
  'principal/bulkStudentStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/principal/students/bulk/status', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Bulk status update failed.' });
    }
  }
);

export const addBehaviourNote = createAsyncThunk(
  'principal/addBehaviourNote',
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/principal/students/${id}/behaviour-notes`, note);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to add note.' });
    }
  }
);

export const addStudentAward = createAsyncThunk(
  'principal/addStudentAward',
  async ({ id, award }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/principal/students/${id}/awards`, award);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to add award.' });
    }
  }
);

export const fetchStudentTimeline = createAsyncThunk(
  'principal/fetchStudentTimeline',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/principal/students/${id}/timeline`, { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch timeline.' });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const studentSlice = createSlice({
  name: 'principalStudents',
  initialState: {
    list: [],
    meta: { total: 0, page: 1, limit: 20, pages: 1 },
    stats: null,
    current: null,
    timeline: [],
    selectedIds: [],
    filters: {},
    listLoading: false,   // directory list
    profileLoading: false, // single student fetch
    statsLoading: false,
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    toggleSelectId(state, action) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((x) => x !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAll(state, action) {
      state.selectedIds = action.payload; // pass all IDs on current page
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
    clearError(state) {
      state.error = null;
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // list
    builder
      .addCase(fetchStudents.pending, (state) => { state.listLoading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, { payload }) => {
        state.listLoading = false;
        state.list = payload.data;
        state.meta = payload.meta || state.meta;
      })
      .addCase(fetchStudents.rejected, (state, { payload }) => {
        state.listLoading = false;
        state.error = payload?.message || 'Error';
      });

    // stats
    builder
      .addCase(fetchStudentStats.pending, (state) => { state.statsLoading = true; })
      .addCase(fetchStudentStats.fulfilled, (state, { payload }) => {
        state.statsLoading = false;
        state.stats = payload;
      })
      .addCase(fetchStudentStats.rejected, (state) => { state.statsLoading = false; });

    // single fetch
    builder
      .addCase(fetchStudent.pending, (state) => { state.profileLoading = true; state.current = null; })
      .addCase(fetchStudent.fulfilled, (state, { payload }) => {
        state.profileLoading = false;
        state.current = payload;
      })
      .addCase(fetchStudent.rejected, (state, { payload }) => {
        state.profileLoading = false;
        state.error = payload?.message;
      });

    // create
    builder.addCase(createStudent.fulfilled, (state, { payload }) => {
      state.list.unshift(payload);
    });

    // update / status / archive
    const patchCurrent = (state, { payload }) => {
      state.loading = false;
      state.current = payload;
      const idx = state.list.findIndex((s) => s._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
    };
    builder
      .addCase(updateStudent.fulfilled, patchCurrent)
      .addCase(changeStudentStatus.fulfilled, patchCurrent)
      .addCase(archiveStudent.fulfilled, patchCurrent)
      .addCase(addBehaviourNote.fulfilled, patchCurrent)
      .addCase(addStudentAward.fulfilled, patchCurrent)
      .addCase(addStudentDocument.fulfilled, patchCurrent);

    // delete
    builder.addCase(deleteStudent.fulfilled, (state, { payload: id }) => {
      state.list = state.list.filter((s) => s._id !== id);
      if (state.current?._id === id) state.current = null;
    });

    // timeline
    builder.addCase(fetchStudentTimeline.fulfilled, (state, { payload }) => {
      state.timeline = payload;
    });
  },
});

export const {
  setFilters, clearFilters,
  toggleSelectId, selectAll, clearSelection,
  clearError, clearCurrent,
} = studentSlice.actions;

export default studentSlice.reducer;