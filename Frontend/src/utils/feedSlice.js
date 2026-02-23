// src/utils/feedSlice.js
import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: [],
  reducers: {
    addFeed: (state, action) => {
      return action.payload;
    },
    removeFeed: () => {
      return [];
    },
  },
});

export const { addFeed, removeFeed } = feedSlice.actions;
export default feedSlice.reducer;