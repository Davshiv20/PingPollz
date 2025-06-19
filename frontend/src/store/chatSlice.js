import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { socket } from '../services/socket';

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async (messageData) => {
    return new Promise((resolve, reject) => {
      socket.emit('send_chat_message', messageData, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addMessage, clearMessages, clearChatError } = chatSlice.actions;

export default chatSlice.reducer; 