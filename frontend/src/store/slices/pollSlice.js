// src/store/slices/pollSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPoll: null,
  polls: [],
  results: {},
  timeRemaining: 60,
  isVoting: false,
  hasVoted: false,
  connectedUsers: [],
  allUsers: [],
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.hasVoted = false;
      state.timeRemaining =
        action.payload?.duration ?? action.payload?.timeLimit ?? 60;
    },
    addPoll: (state, action) => {
      state.polls.push(action.payload);
    },
    updateResults: (state, action) => {
      state.results = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTime: (state) => {
      if (state.timeRemaining > 0) state.timeRemaining -= 1;
    },
    setVoting: (state, action) => {
      state.isVoting = action.payload;
    },
    setHasVoted: (state, action) => {
      state.hasVoted = action.payload;
    },
    /**
     * updateConnectedUsers now accepts either:
     * - an array (from server) of user objects -> we assign connectedUsers & allUsers
     * - an object with { connected: [...], all: [...] } for backward compatibility
     */
    updateConnectedUsers: (state, action) => {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        // server sends array of clients with fields: { id, name, role, hasVoted }
        state.connectedUsers = payload.filter((u) => u.role === "student");
        // For now set allUsers = payload (if you have a registered list in DB you can replace it)
        state.allUsers = payload;
      } else if (payload && typeof payload === "object") {
        state.connectedUsers = payload.connected || [];
        state.allUsers = payload.all || [];
      } else {
        state.connectedUsers = [];
        state.allUsers = [];
      }
    },
    clearPoll: (state) => {
      state.currentPoll = null;
      state.results = {};
      state.hasVoted = false;
      state.timeRemaining = 60;
    },
  },
});

export const {
  setCurrentPoll,
  addPoll,
  updateResults,
  setTimeRemaining,
  decrementTime,
  setVoting,
  setHasVoted,
  updateConnectedUsers,
  clearPoll,
} = pollSlice.actions;

export default pollSlice.reducer;
