import { Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Feed from "./components/Feed";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Layout */}
        <Route path="/" element={<Body />}>
          <Route index element={<Feed />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </Provider>
  );
}

export default App;