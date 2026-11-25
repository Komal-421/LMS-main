import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createCourse as createCourseApi,
  deleteCourse as deleteCourseApi,
  getAllCourses,
  updateCourse as updateCourseApi,
} from '../../api/courseApi';

const CACHE_TTL_MS = 60_000;

export const resetAllCaches = createAction('app/resetAllCaches');

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await getAllCourses(signal);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (arg = {}, { getState }) => {
      const { force = false } = arg;
      const { status, lastFetched } = getState().courses;
      if (status === 'loading') return false;
      if (!force && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
        return false;
      }
      return true;
    },
  }
);

export const addCourse = createAsyncThunk(
  'courses/create',
  async (data, { rejectWithValue }) => {
    try {
      return await createCourseApi(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editCourse = createAsyncThunk(
  'courses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateCourseApi(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeCourse = createAsyncThunk(
  'courses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCourseApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        if (action.payload?.isCanceled) {
          state.status = state.lastFetched ? 'succeeded' : 'idle';
          return;
        }
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load courses';
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        if (action.payload?.course?._id) {
          state.items.unshift(action.payload.course);
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        const updated = action.payload?.course;
        if (updated?._id) {
          const idx = state.items.findIndex((c) => c._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      })
      .addCase(resetAllCaches, () => initialState);
  },
});

export default coursesSlice.reducer;
