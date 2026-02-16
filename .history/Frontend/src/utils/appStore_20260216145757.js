import { configureStore } from '@reduxjs/;toolkit'import userReducer from "./userSlice";
const appstore = configureStore({
  reducer: {
user:userReducer,
},
});

export default appstore;

