import { configureStore } from '@reduxjs/import userReducer from "./userSlice";
const appstore = configureStore({
  reducer: {
user:userReducer,
},
});

export default appstore;

