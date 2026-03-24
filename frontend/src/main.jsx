import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import store from "./utils/store";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";
import axios from "axios";

// ✅ Auto-detects local vs production
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
