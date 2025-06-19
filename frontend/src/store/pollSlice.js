import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { socket } from '../services/socket';

const initialState = {
  currentPoll: null,
  pollResults: {},
  timeRemaining: 0,
  answeredCount: 0,
  totalStudents: 0,
  isPollActive: false,
  pastPolls: [],
  loading: false,
  error: null,
};

export const createPoll = createAsyncThunk(
  'poll/createPoll',
  async (pollData) => {
    return new Promise((resolve, reject) => {
      socket.emit('create_poll', pollData, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }
);

export const submitAnswer = createAsyncThunk(
  'poll/submitAnswer',
  async (answerData) => {
    return new Promise((resolve, reject) => {
      socket.emit('submit_answer', answerData, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }
);

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.isPollActive = action.payload?.isActive || false;
    },
    updatePollResults: (state, action) => {
      state.pollResults = action.payload.results;
      state.answeredCount = action.payload.answered_count;
      state.totalStudents = action.payload.total_students;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    pollEnded: (state, action) => {
      state.isPollActive = false;
      if (state.currentPoll) {
        state.pastPolls.push({
          ...state.currentPoll,
          finalResults: action.payload.final_results,
        });
      }
      state.currentPoll = null;
      state.pollResults = {};
      state.timeRemaining = 0;
    },
    clearPollError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.isPollActive = true;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setCurrentPoll,
  updatePollResults,
  setTimeRemaining,
  pollEnded,
  clearPollError,
} = pollSlice.actions;

export default pollSlice.reducer; 