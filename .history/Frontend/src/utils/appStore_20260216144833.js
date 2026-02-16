import { configureStore } from '@reduxjs/toolkit'
 import userReducer from "./"
const appstore = configureStore({
  reducer: {},
});

export default appstore;

