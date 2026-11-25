import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createFaculty as createFacultyApi,
  deleteFaculty as deleteFacultyApi,
  getAllFaculty,
  updateFaculty as updateFacultyApi,
} from '../../api/facultyApi';
import { resetAllCaches } from './coursesSlice';

const CACHE_TTL_MS = 60_000;

export const fetchFaculty = createAsyncThunk(
  'faculty/fetchAll',
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await getAllFaculty(signal);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (arg = {}, { getState }) => {
      const { force = false } = arg;
      const { status, lastFetched } = getState().faculty;
      if (status === 'loading') return false;
      if (!force && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
        return false;
      }
      return true;
    },
  }
);

export const addFaculty = createAsyncThunk(
  'faculty/create',
  async (data, { rejectWithValue }) => {
    try {
      return await createFacultyApi(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editFaculty = createAsyncThunk(
  'faculty/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateFacultyApi(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeFaculty = createAsyncThunk(
  'faculty/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteFacultyApi(id);
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

const facultySlice = createSlice({
  name: 'faculty',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaculty.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFaculty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchFaculty.rejected, (state, action) => {
        if (action.payload?.isCanceled) {
          state.status = state.lastFetched ? 'succeeded' : 'idle';
          return;
        }
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load faculty';
      })
      .addCase(addFaculty.fulfilled, (state, action) => {
        if (action.payload?.faculty?._id) {
          state.items.unshift(action.payload.faculty);
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(editFaculty.fulfilled, (state, action) => {
        const updated = action.payload?.faculty;
        if (updated?._id) {
          const idx = state.items.findIndex((f) => f._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(removeFaculty.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f._id !== action.payload);
      })
      .addCase(resetAllCaches, () => initialState);
  },
});

export default facultySlice.reducer;
