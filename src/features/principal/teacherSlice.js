import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchTeachers = createAsyncThunk(
  'principal/fetchTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/principal/teachers', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch teachers.' });
    }
  }
);

export const fetchTeacherDashboard = createAsyncThunk(
  'principal/fetchTeacherDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/principal/teachers/dashboard');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch dashboard.' });
    }
  }
);

export const createTeacher = createAsyncThunk(
  'principal/createTeacher',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/principal/teachers', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to create teacher.' });
    }
  }
);

export const fetchTeacher = createAsyncThunk(
  'principal/fetchTeacher',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/principal/teachers/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch teacher.' });
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'principal/updateTeacher',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/principal/teachers/${id}`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update teacher.' });
    }
  }
);

export const changeTeacherStatus = createAsyncThunk(
  'principal/changeTeacherStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/principal/teachers/${id}/status`, { status });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to change status.' });
    }
  }
);

export const archiveTeacher = createAsyncThunk(
  'principal/archiveTeacher',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/principal/teachers/${id}/archive`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to archive.' });
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'principal/deleteTeacher',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/principal/teachers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to delete teacher.' });
    }
  }
);

export const assignTeacherSubjects = createAsyncThunk(
  'principal/assignTeacherSubjects',
  async ({ id, subjects }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/principal/teachers/${id}/subjects`, { subjects });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to assign subjects.' });
    }
  }
);

export const addTeacherPerformanceReview = createAsyncThunk(
  'principal/addTeacherPerformanceReview',
  async ({ id, review }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/principal/teachers/${id}/performance-reviews`, review);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to add review.' });
    }
  }
);

export const assignTeacherAsset = createAsyncThunk(
  'principal/assignTeacherAsset',
  async ({ id, asset }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/principal/teachers/${id}/assets`, asset);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to assign asset.' });
    }
  }
);

export const updateTeacherAiInsights = createAsyncThunk(
  'principal/updateTeacherAiInsights',
  async ({ id, insights }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/principal/teachers/${id}/ai-insights`, insights);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update AI insights.' });
    }
  }
);

export const bulkTeacherStatus = createAsyncThunk(
  'principal/bulkTeacherStatus',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/principal/teachers/bulk/status', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Bulk update failed.' });
    }
  }
);

export const fetchTeacherTimeline = createAsyncThunk(
  'principal/fetchTeacherTimeline',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/principal/teachers/${id}/timeline`, { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch timeline.' });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const teacherSlice = createSlice({
  name: 'principalTeachers',
  initialState: {
    list: [],
    meta: { total: 0, page: 1, limit: 20, pages: 1 },
    dashboard: null,
    current: null,
    timeline: [],
    selectedIds: [],
    filters: {},
    listLoading: false,
    profileLoading: false,
    dashboardLoading: false,
    error: null,
  },
  reducers: {
    setTeacherFilters(state, action) { state.filters = action.payload; },
    clearTeacherFilters(state) { state.filters = {}; },
    toggleSelectTeacher(state, action) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((x) => x !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllTeachers(state, action) { state.selectedIds = action.payload; },
    clearTeacherSelection(state) { state.selectedIds = []; },
    clearTeacherError(state) { state.error = null; },
    clearCurrentTeacher(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => { state.listLoading = true; state.error = null; })
      .addCase(fetchTeachers.fulfilled, (state, { payload }) => {
        state.listLoading = false;
        state.list = payload.data;
        state.meta = payload.meta || state.meta;
      })
      .addCase(fetchTeachers.rejected, (state, { payload }) => {
        state.listLoading = false;
        state.error = payload?.message;
      });

    builder
      .addCase(fetchTeacherDashboard.pending, (state) => { state.dashboardLoading = true; })
      .addCase(fetchTeacherDashboard.fulfilled, (state, { payload }) => {
        state.dashboardLoading = false;
        state.dashboard = payload;
      })
      .addCase(fetchTeacherDashboard.rejected, (state) => { state.dashboardLoading = false; });

    builder
      .addCase(fetchTeacher.pending, (state) => { state.profileLoading = true; state.current = null; })
      .addCase(fetchTeacher.fulfilled, (state, { payload }) => {
        state.profileLoading = false;
        state.current = payload;
      })
      .addCase(fetchTeacher.rejected, (state, { payload }) => {
        state.profileLoading = false;
        state.error = payload?.message;
      });

    builder.addCase(createTeacher.fulfilled, (state, { payload }) => {
      state.list.unshift(payload);
    });

    const patchCurrentTeacher = (state, { payload }) => {
      state.current = payload;
      const idx = state.list.findIndex((t) => t._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
    };

    builder
      .addCase(updateTeacher.fulfilled, patchCurrentTeacher)
      .addCase(changeTeacherStatus.fulfilled, patchCurrentTeacher)
      .addCase(archiveTeacher.fulfilled, patchCurrentTeacher)
      .addCase(assignTeacherSubjects.fulfilled, patchCurrentTeacher)
      .addCase(addTeacherPerformanceReview.fulfilled, patchCurrentTeacher)
      .addCase(assignTeacherAsset.fulfilled, patchCurrentTeacher)
      .addCase(updateTeacherAiInsights.fulfilled, patchCurrentTeacher);

    builder.addCase(deleteTeacher.fulfilled, (state, { payload: id }) => {
      state.list = state.list.filter((t) => t._id !== id);
      if (state.current?._id === id) state.current = null;
    });

    builder.addCase(fetchTeacherTimeline.fulfilled, (state, { payload }) => {
      state.timeline = payload;
    });
  },
});

export const {
  setTeacherFilters, clearTeacherFilters,
  toggleSelectTeacher, selectAllTeachers, clearTeacherSelection,
  clearTeacherError, clearCurrentTeacher,
} = teacherSlice.actions;

export default teacherSlice.reducer;
