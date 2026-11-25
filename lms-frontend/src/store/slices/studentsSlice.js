import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createStudent as createStudentApi,
  deleteStudent as deleteStudentApi,
  getAllStudents,
  updateStudent as updateStudentApi,
} from '../../api/studentApi';
import { resetAllCaches } from './coursesSlice';

const CACHE_TTL_MS = 60_000;

export const fetchStudents = createAsyncThunk(
  'students/fetchAll',
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await getAllStudents(signal);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (arg = {}, { getState }) => {
      const { force = false } = arg;
      const { status, lastFetched } = getState().students;
      if (status === 'loading') return false;
      if (!force && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
        return false;
      }
      return true;
    },
  }
);

export const addStudent = createAsyncThunk(
  'students/create',
  async (data, { rejectWithValue }) => {
    try {
      return await createStudentApi(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const editStudent = createAsyncThunk(
  'students/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateStudentApi(id, data);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeStudent = createAsyncThunk(
  'students/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteStudentApi(id);
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

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        if (action.payload?.isCanceled) {
          state.status = state.lastFetched ? 'succeeded' : 'idle';
          return;
        }
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load students';
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        if (action.payload?.student?._id) {
          state.items.unshift(action.payload.student);
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(editStudent.fulfilled, (state, action) => {
        const updated = action.payload?.student;
        if (updated?._id) {
          const idx = state.items.findIndex((s) => s._id === updated._id);
          if (idx !== -1) state.items[idx] = updated;
        } else {
          state.lastFetched = null;
        }
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      })
      .addCase(resetAllCaches, () => initialState);
  },
});

export default studentsSlice.reducer;
