import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "./utils/userSlice";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🔥 DEV-TINDER
        </Link>
      </div>

      {user && (
        <div className="flex gap-2 items-center">
          
          <div className="form-control">
            Welcome, {user.firstName}
          </div>

          <div className="dropdown dropdown-end mx-5">
            
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User"
                  src={user.photoUrl || "https://i.pravatar.cc/150"}
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </Link>
              </li>

              <li>
                <Link to="/settings">Settings</Link>
              </li>

              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>

          </div>
        </div>
      )}

    </div>
  );
};

export default Navbar;