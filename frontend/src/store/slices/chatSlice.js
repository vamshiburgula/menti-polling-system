import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  messages: [],
  isTyping: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { toggleChat, addMessage, setTyping, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
