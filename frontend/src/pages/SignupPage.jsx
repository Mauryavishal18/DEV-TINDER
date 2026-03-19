import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Zap, X } from "lucide-react";
import axios from "axios";
import { addUser } from "../utils/store";
import { TECH_SKILLS, AVATARS, getAvatarUrl } from "../utils/constants";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName:"", lastName:"", emailId:"", password:"", confirmPassword:"", age:"", gender:"", about:"", skills:[], github:"", portfolio:"", useAvatar:true, avatarSeed:"felix" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const toggleSkill = s => setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s] }));

  const validate1 = () => {
    if (!form.firstName || form.firstName.trim().length < 2) return "First name must be at least 2 characters";
    if (!form.emailId || !form.emailId.includes("@")) return "Enter a valid email";
    if (!form.password || form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const next = () => {
    setError("");
    if (step === 1) { const e = validate1(); if (e) { setError(e); return; } }
    setStep(s => s + 1);
  };

  const signup = async () => {
    try {
      setLoading(true); setError("");
      await axios.post("/signup", { ...form, age: form.age ? parseInt(form.age) : undefined });
      const r = await axios.post("/login", { emailId: form.emailId, password: form.password });
      dispatch(addUser(r.data.user || r.data));
      navigate("/");
    } catch(e) { setError(e.response?.data?.message || "Signup failed"); }
    finally { setLoading(false); }
  };

  const steps = ["Account Info", "Skills", "Profile & Photo"];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:"500px", height:"300px", background:"radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 25px rgba(0,255,135,0.5)" }}>
          <Zap size={20} color="#040d08" fill="#040d08"/>
        </div>
        <span style={{ fontSize:"18px", fontWeight:700, letterSpacing:"2px", color:"var(--text)", fontFamily:"var(--mono)" }}>
          DEV<span style={{ color:"var(--green)", textShadow:"0 0 20px rgba(0,255,135,0.6)" }}>TINDER</span>
        </span>
      </motion.div>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        style={{ width:"100%", maxWidth:"500px", background:"rgba(7,21,16,0.9)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"20px", overflow:"hidden", boxShadow:"0 0 60px rgba(0,0,0,0.6)" }}>
        <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,var(--green),transparent)" }}/>
        <div style={{ padding:"32px" }}>
          <h1 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", textAlign:"center", marginBottom:"20px" }}>Create Your Profile</h1>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"8px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700, fontFamily:"var(--mono)", background:step >= i+1?"var(--green)":"transparent", color:step >= i+1?"#040d08":"var(--text3)", border:step < i+1?"1px solid var(--dim)":"none", boxShadow:step===i+1?"0 0 15px rgba(0,255,135,0.4)":"none", transition:"all .3s" }}>{i+1}</div>
                {i < steps.length-1 && <div style={{ width:"40px", height:"1px", background:step > i+1?"var(--green)":"var(--dim)", transition:"background .3s" }}/>}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"0 4px", marginBottom:"24px" }}>
            {steps.map((s,i) => <span key={i} style={{ fontSize:"10px", color:step===i+1?"var(--green)":"var(--text3)", fontFamily:"var(--mono)" }}>{s}</span>)}
          </div>
          <AnimatePresence mode="wait">
            {step===1 && (
              <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>First Name *</label>
                    <div style={{ position:"relative" }}><User size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/><input value={form.firstName} onChange={upd("firstName")} placeholder="Vishal" className="inp" style={{ paddingLeft:"34px", fontSize:"13px" }}/></div>
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Last Name</label>
                    <input value={form.lastName} onChange={upd("lastName")} placeholder="Maurya" className="inp" style={{ fontSize:"13px" }}/>
                  </div>
                </div>
                <div style={{ marginBottom:"12px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Email *</label>
                  <div style={{ position:"relative" }}><Mail size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/><input type="email" value={form.emailId} onChange={upd("emailId")} placeholder="you@example.com" className="inp" style={{ paddingLeft:"34px", fontSize:"13px" }}/></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Password *</label>
                    <div style={{ position:"relative" }}><Lock size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/><input type={showPass?"text":"password"} value={form.password} onChange={upd("password")} placeholder="Min 8 chars" className="inp" style={{ paddingLeft:"34px", paddingRight:"34px", fontSize:"13px" }}/><button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>{showPass?<EyeOff size={13}/>:<Eye size={13}/>}</button></div>
                    {form.password && <p style={{ fontSize:"10px", marginTop:"4px", fontFamily:"var(--mono)", color:form.password.length<8?"#f87171":form.password.length<12?"#fb923c":"var(--green)" }}>{form.password.length<8?"Weak":form.password.length<12?"Medium":"Strong ✓"}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Confirm *</label>
                    <div style={{ position:"relative" }}><Lock size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/><input type="password" value={form.confirmPassword} onChange={upd("confirmPassword")} placeholder="Repeat password" className="inp" style={{ paddingLeft:"34px", fontSize:"13px" }}/></div>
                  </div>
                </div>
              </motion.div>
            )}
            {step===2 && (
              <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <p style={{ fontSize:"12px", color:"var(--text3)", marginBottom:"12px", fontFamily:"var(--mono)" }}>Select your tech stack ({form.skills.length} selected)</p>
                {form.skills.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", marginBottom:"12px", padding:"10px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.08)", borderRadius:"8px" }}>
                    {form.skills.map(s => <span key={s} onClick={()=>toggleSkill(s)} style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"4px 10px", borderRadius:"6px", fontSize:"11px", margin:"2px", background:"rgba(0,255,135,0.1)", border:"1px solid rgba(0,255,135,0.25)", color:"var(--green)", cursor:"pointer" }}>{s} <X size={9}/></span>)}
                  </div>
                )}
                <div style={{ display:"flex", flexWrap:"wrap", maxHeight:"200px", overflowY:"auto" }}>
                  {TECH_SKILLS.map(s => <button key={s.name} onClick={()=>toggleSkill(s.name)} className={`skill ${form.skills.includes(s.name)?"active":""}`}>{s.icon} {s.name}</button>)}
                </div>
              </motion.div>
            )}
            {step===3 && (
              <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Age</label><input type="number" value={form.age} onChange={upd("age")} placeholder="22" className="inp" style={{ fontSize:"13px" }}/></div>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Gender</label><select value={form.gender} onChange={upd("gender")} className="inp" style={{ fontSize:"13px" }}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="others">Others</option></select></div>
                </div>
                <div style={{ marginBottom:"12px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>About You</label>
                  <textarea value={form.about} onChange={upd("about")} rows={2} placeholder="Passionate developer building the future..." className="inp" style={{ resize:"none", fontSize:"13px" }}/>
                </div>
                <div style={{ marginBottom:"16px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Choose Avatar</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>
                    {AVATARS.map(a => (
                      <div key={a.seed} onClick={()=>setForm(p=>({...p,avatarSeed:a.seed,useAvatar:true}))}
                        style={{ cursor:"pointer", borderRadius:"10px", overflow:"hidden", border:`2px solid ${form.avatarSeed===a.seed?"var(--green)":"transparent"}`, transition:"all .2s", boxShadow:form.avatarSeed===a.seed?"0 0 10px rgba(0,255,135,0.4)":"none" }}>
                        <img src={getAvatarUrl(a.seed)} style={{ width:"100%", height:"auto", display:"block" }}/>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>GitHub URL</label><input value={form.github} onChange={upd("github")} placeholder="github.com/username" className="inp" style={{ fontSize:"13px" }}/></div>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Portfolio</label><input value={form.portfolio} onChange={upd("portfolio")} placeholder="mysite.dev" className="inp" style={{ fontSize:"13px" }}/></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:"12px", color:"#f87171", marginTop:"14px", fontFamily:"var(--mono)" }}>⚠ {error}</motion.div>}
          <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
            {step > 1 && <button onClick={()=>setStep(s=>s-1)} className="btn-sec" style={{ flex:1 }}>← Back</button>}
            {step < 3
              ? <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={next} className="btn-prime" style={{ flex:2, padding:"12px" }}>Next →</motion.button>
              : <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={signup} disabled={loading} className="btn-prime" style={{ flex:2, padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                  {loading?<div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>:<Zap size={14} fill="#040d08"/>}
                  {loading?"Creating...":"Launch Profile 🚀"}
                </motion.button>}
          </div>
          <p style={{ textAlign:"center", fontSize:"13px", color:"var(--text3)", marginTop:"16px" }}>
            Already have an account? <Link to="/login" style={{ color:"var(--green)", textDecoration:"none", fontWeight:600 }}>Sign in →</Link>
          </p>
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
