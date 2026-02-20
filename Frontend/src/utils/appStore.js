import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const appStore = configureStore({
  reducer: {   // ✅ reducer (NOT reducers)
    user: userReducer,
  },
});

export default appStore;