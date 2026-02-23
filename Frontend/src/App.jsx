import { Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Feed from "./components/Feed";
import ProtectedRoute from "./components/ProtectedRoute";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <Routes>
        <Route path="/" element={<Body />}>

          {/* Login INSIDE Body */}
          <Route path="login" element={<Login />} />

          <Route
            index
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </Provider>
  );
}

export default App;