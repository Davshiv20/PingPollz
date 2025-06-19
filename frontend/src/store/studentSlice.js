import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { socket } from '../services/socket';

const initialState = {
  currentStudent: null,
  students: [],
  loading: false,
  error: null,
};

export const joinAsStudent = createAsyncThunk(
  'student/joinAsStudent',
  async (studentName) => {
    return new Promise((resolve, reject) => {
      socket.emit('join_as_student', { name: studentName }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setCurrentStudent: (state, action) => {
      state.currentStudent = action.payload;
    },
    addStudent: (state, action) => {
      const existingIndex = state.students.findIndex(
        (s) => s.id === action.payload.student_id
      );
      if (existingIndex === -1) {
        state.students.push({
          id: action.payload.student_id,
          name: action.payload.name,
        });
      }
    },
    removeStudent: (state, action) => {
      state.students = state.students.filter(
        (s) => s.id !== action.payload.student_id
      );
    },
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinAsStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinAsStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = {
          id: action.payload.student_id,
          name: action.payload.name,
        };
      })
      .addCase(joinAsStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setCurrentStudent,
  addStudent,
  removeStudent,
  clearStudentError,
} = studentSlice.actions;

export default studentSlice.reducer; 