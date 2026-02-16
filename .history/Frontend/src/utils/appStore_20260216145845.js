import { configureStore } from '@reduxjs/toimport userReducer from "./userSlice";
const appstore = configureStore({
  reducer: {
user:userReducer,
},
});

export default appstore;

