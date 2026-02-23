// src/components/Login.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

const Login = () => {
  const [emailId, setEmailId] = useState("vishal@test.com");
  const [password, setPassword] = useState("Test@1234");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { emailId, password }, { withCredentials: true });

      // backend may return { user: {...}, token: '...' } or user directly
      const user = res.data.user || res.data;
      dispatch(addUser(user));
      setError("");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-start mt-16">
      <div className="card bg-slate-800 w-96 shadow-lg p-6 text-white">
        <h2 className="text-center text-2xl font-semibold mb-4">Login</h2>

        <label className="block mb-3">
          <span className="text-sm text-gray-300">Email</span>
          <input type="email" value={emailId} onChange={(e) => setEmailId(e.target.value)} className="input input-bordered w-full mt-1 bg-slate-900 text-white" />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-300">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full mt-1 bg-slate-900 text-white" />
        </label>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <button onClick={handleLogin} className="btn w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;