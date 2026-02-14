import React, { useState } from 'react'
import axios from 'axios';

const Login = () => {
    const[emailId, setEmailId]=useState("raju.kohli@example.com");
    const[password,setPassword]=useState("Rajk@123");
    const handleLogin=async()=>{
   try{ const res= await axios.post("http://localhost:3000/login",{
        emailId,
        password,
    });}
    catch(err){
        console.error(err)
    }
};


  return (
    <div className='flex justify-center my-10'>
        <div className="card bg-base-300 w-96 shadow-xl">
  <div className="card-body">
    <h2 className="card-title bg-base-300 justify-center">Login</h2>
    <div>
        <label className="form-control w-full max-w-xs my-2">
  <div className="label">
    <span className="label-text">Email ID:{emailId}</span>
    {/* <span className="label-text-alt">Top Right label</span> */}
  </div>
  <input type="text" value={emailId} placeholder="" className="input input-bordered w-full max-w-xs"
  onChange={(e)=>setEmailId(e.target.value)} />
  
</label>
<label className="form-control w-full max-w-xs my-2">
  <div className="label">
    <span className="label-text">Password</span>
    {/* <span className="label-text-alt">Top Right label</span> */}
  </div>
  <input type="text" value={password} placeholder="" className="input input-bordered w-full max-w-xs" 
  onChange={(e)=>setPassword(e.target.value)}/>
  
</label>
    </div>
    <div className="card-actions justify-center m-2">
      <button className="btn btn-primary" onClick={handleLogin}>Login</button>
    </div>
  </div>
</div>
</div>
  );
};

export default Login