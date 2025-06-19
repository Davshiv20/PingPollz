import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './pollSlice';
import studentReducer from './studentSlice';
import chatReducer from './chatSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
    student: studentReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
}); 