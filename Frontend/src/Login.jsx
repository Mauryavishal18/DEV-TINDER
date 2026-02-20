import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "./utils/userSlice";   // path check kar lena
import axios from "axios";
import Feed from  "./Feed";

const Login = () => {
  const [emailId, setEmailId] = useState("vishal@test.com");
  const [password, setPassword] = useState("Test@1234");

  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/login",
        {
          emailId: emailId,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
      dispatch(addUser(res.data));
      alert("Login Successful 🚀");

    } catch (err) {
      console.error(err.response?.data);
      alert("Login Failed ❌");
    }
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>

          <label className="form-control w-full max-w-xs my-2">
            <span className="label-text">Email ID</span>
            <input
              type="email"
              value={emailId}
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => setEmailId(e.target.value)}
            />
          </label>

          <label className="form-control w-full max-w-xs my-2">
            <span className="label-text">Password</span>
            <input
              type="password"
              value={password}
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
