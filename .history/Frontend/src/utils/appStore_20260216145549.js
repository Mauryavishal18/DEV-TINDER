import { configureStore } from '@reduxjs/toolkit'import userReducer from "./userSlice";
const appstore = configureStore({
  reducer: 
user:User},
});

export default appstore;

