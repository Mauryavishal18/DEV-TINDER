import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [EmailId, setEmailId] = useState("vishal@test.com");
  const [Password, setPassword] = useState("Test@1234");

  const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:3000/login", {
      emailId: EmailId,
      password: Password,
    },
    {
      withCredentials:true
    }
  );

    console.log(res.data);
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
              value={EmailId}
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => setEmailId(e.target.value)}
            />
          </label>

          <label className="form-control w-full max-w-xs my-2">
            <span className="label-text">Password</span>
            <input
              type="password"
              value={Password}
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
