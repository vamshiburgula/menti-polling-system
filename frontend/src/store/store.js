import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pollReducer from './slices/pollSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    poll: pollReducer,
    chat: chatReducer,
  },
});
