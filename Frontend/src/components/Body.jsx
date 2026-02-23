// src/components/Body.jsx
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const Body = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <Navbar />

      <main className="grow p-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Body;