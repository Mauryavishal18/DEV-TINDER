import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { useDispatch } from "react-redux";
import { addUser } from "./utils/userSlice";
import { useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const Body = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(BASE_URL + "/profile", {
          withCredentials: true,
        });

        dispatch(addUser(res.data));
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [dispatch]);

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