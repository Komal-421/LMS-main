import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './slices/coursesSlice';
import facultyReducer from './slices/facultySlice';
import studentsReducer from './slices/studentsSlice';

export const store = createStore();

function createStore() {
  return configureStore({
    reducer: {
      courses: coursesReducer,
      students: studentsReducer,
      faculty: facultyReducer,
    },
  });
}
