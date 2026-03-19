import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Zap, Shield } from "lucide-react";
import axios from "axios";
import { addUser } from "../utils/store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !pass) { setError("Fill all fields"); return; }
    try {
      setLoading(true); setError("");
      const r = await axios.post("/login", { emailId: email, password: pass });
      dispatch(addUser(r.data.user || r.data));
      navigate("/");
    } catch(e) { setError(e.response?.data?.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:"500px", height:"300px", background:"radial-gradient(ellipse, rgba(0,255,135,0.05) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"32px" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 25px rgba(0,255,135,0.5)" }}>
          <Zap size={20} color="#040d08" fill="#040d08"/>
        </div>
        <span style={{ fontSize:"18px", fontWeight:700, letterSpacing:"2px", color:"var(--text)", fontFamily:"var(--mono)" }}>
          DEV<span style={{ color:"var(--green)", textShadow:"0 0 20px rgba(0,255,135,0.6)" }}>TINDER</span>
        </span>
      </motion.div>
      <motion.div initial={{ opacity:0, y:24, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:.4 }}
        style={{ width:"100%", maxWidth:"420px", background:"rgba(7,21,16,0.9)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"20px", overflow:"hidden", boxShadow:"0 0 60px rgba(0,0,0,0.6)" }}>
        <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,var(--green),transparent)" }}/>
        <div style={{ padding:"36px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:700, color:"var(--text)", textAlign:"center", marginBottom:"4px" }}>Welcome Back</h1>
          <p style={{ fontSize:"13px", color:"var(--text3)", textAlign:"center", marginBottom:"28px", fontFamily:"var(--mono)" }}>Sign in to continue your mission</p>
          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Email</label>
            <div style={{ position:"relative" }}>
              <Mail size={14} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="you@example.com" className="inp" style={{ paddingLeft:"40px" }}/>
            </div>
          </div>
          <div style={{ marginBottom:"8px" }}>
            <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Password</label>
            <div style={{ position:"relative" }}>
              <Lock size={14} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
              <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" className="inp" style={{ paddingLeft:"40px", paddingRight:"40px" }}/>
              <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>
                {show?<EyeOff size={14}/>:<Eye size={14}/>}
              </button>
            </div>
          </div>
          <div style={{ textAlign:"right", marginBottom:"20px" }}>
            <span style={{ fontSize:"12px", color:"var(--green)", cursor:"pointer", fontFamily:"var(--mono)" }}>Forgot password?</span>
          </div>
          {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:"13px", color:"#f87171", marginBottom:"16px", fontFamily:"var(--mono)" }}>⚠ {error}</motion.div>}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={login} disabled={loading}
            className="btn-prime" style={{ width:"100%", padding:"13px", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            {loading?<div style={{ width:"16px", height:"16px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>:<Shield size={15}/>}
            {loading?"Signing in...":"Sign In"}
          </motion.button>
          <p style={{ textAlign:"center", fontSize:"13px", color:"var(--text3)", marginTop:"20px" }}>
            No account? <Link to="/signup" style={{ color:"var(--green)", textDecoration:"none", fontWeight:600 }}>Create one →</Link>
          </p>
          <p style={{ textAlign:"center", fontSize:"12px", color:"var(--text3)", marginTop:"10px" }}>
            <Link to="/about" style={{ color:"var(--text3)", textDecoration:"none" }}>Learn about DevTinder →</Link>
          </p>
        </div>
      </motion.div>
      <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"20px", fontFamily:"var(--mono)" }}>
        © 2024 DevTinder · Built by <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none" }}>Vishal Maurya</a>
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
