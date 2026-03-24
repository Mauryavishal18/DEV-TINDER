import { createSlice, configureStore } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user", initialState: null,
  reducers: {
    addUser: (_, a) => a.payload,
    removeUser: () => null,
    updateUser: (s, a) => ({ ...s, ...a.payload }),
  },
});
export const { addUser, removeUser, updateUser } = userSlice.actions;

const feedSlice = createSlice({
  name: "feed", initialState: [],
  reducers: {
    addFeed: (_, a) => a.payload,
    removeFromFeed: (s, a) => s.filter(u => u._id !== a.payload),
    clearFeed: () => [],
  },
});
export const { addFeed, removeFromFeed, clearFeed } = feedSlice.actions;

const connSlice = createSlice({
  name: "connections", initialState: [],
  reducers: {
    addConnections: (_, a) => a.payload,
    clearConnections: () => [],
  },
});
export const { addConnections, clearConnections } = connSlice.actions;

const store = configureStore({
  reducer: { user: userSlice.reducer, feed: feedSlice.reducer, connections: connSlice.reducer },
});
export default store;
