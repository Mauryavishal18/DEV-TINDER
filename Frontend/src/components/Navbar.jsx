// src/components/Navbar.jsx
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constant";



const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    } catch (err) {
      // ignore backend error; still clear client
      console.error("Logout error:", err?.response?.data || err.message);
    } finally {
      dispatch(removeUser());
      navigate("/login");
    }
  };

  return (
    <div className="navbar bg-slate-800 px-6 py-3 shadow">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-lg text-white font-semibold">
          🔥 DEV-TINDER
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-sm text-gray-200">Welcome, {user.firstName}</div>

            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={user.photoUrl || "https://i.pravatar.cc/150"} alt="user" />
                </div>
              </label>
              <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-slate-800 rounded-box w-52 text-white">
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={() => navigate("/settings")}>Settings</button>
                </li>
                <li>
                  <Link to="/connections">Connections</Link>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-outline text-white">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;