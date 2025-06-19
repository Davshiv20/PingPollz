import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  persona: null, // 'teacher' or 'student'
  showChat: false,
  showNameModal: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPersona: (state, action) => {
      state.persona = action.payload;
    },
    toggleChat: (state) => {
      state.showChat = !state.showChat;
    },
    setShowChat: (state, action) => {
      state.showChat = action.payload;
    },
    setShowNameModal: (state, action) => {
      state.showNameModal = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const {
  setPersona,
  toggleChat,
  setShowChat,
  setShowNameModal,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer; 