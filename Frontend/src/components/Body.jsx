import Navbar from "./Navbar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });

        dispatch(addUser(res.data));
      } catch (error) {
        // Prevent redirect loop
        if (location.pathname !== "/login") {
          navigate("/login");
        }
      }
    };

    if (!userData) {
      fetchUser();
    }
  }, [dispatch, navigate, location.pathname, userData]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="grow p-5">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default Body;