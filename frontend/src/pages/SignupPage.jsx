import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Zap, X, Phone } from "lucide-react";
import axios from "axios";
import { addUser } from "../utils/store";
import { TECH_SKILLS } from "../utils/constants";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName:"", lastName:"", emailId:"", password:"", confirmPassword:"",
    mobile:"", age:"", gender:"", about:"", skills:[], github:"", portfolio:"",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [captchaNum1] = useState(Math.floor(Math.random()*9)+1);
  const [captchaNum2] = useState(Math.floor(Math.random()*9)+1);
  const [captchaInput, setCaptchaInput] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const toggleSkill = s => setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x=>x!==s) : [...p.skills, s] }));

  const validate1 = () => {
    if (!form.firstName || form.firstName.trim().length < 2) return "First name must be at least 2 characters";
    if (!form.emailId || !form.emailId.includes("@")) return "Enter a valid email";
    // ✅ Gmail only — reject non-gmail addresses
    const emailDomain = form.emailId.toLowerCase().split("@")[1];
    if (emailDomain !== "gmail.com") return "Only Gmail addresses (@gmail.com) are accepted";
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
    if (!termsAccepted) { setError("Please accept the Terms & Conditions"); return; }
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) { setError("Incorrect CAPTCHA answer. Try again."); return; }
    try {
      setLoading(true); setError("");
      await axios.post("/signup", {
        firstName: form.firstName, lastName: form.lastName,
        emailId: form.emailId, password: form.password,
        mobile: form.mobile, age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender, about: form.about,
        skills: form.skills, github: form.github, portfolio: form.portfolio,
      });
      const r = await axios.post("/login", { emailId: form.emailId, password: form.password });
      dispatch(addUser(r.data.user || r.data));
      navigate("/");
    } catch(e) { setError(e.response?.data?.message || "Signup failed"); }
    finally { setLoading(false); }
  };

  const steps = ["Profile Info", "Skills", "Finalize"];

  const inputStyle = { background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"10px", padding:"11px 14px", fontSize:"13px", color:"var(--text)", fontFamily:"var(--font)", outline:"none", width:"100%" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:"500px", height:"300px", background:"radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>

      {/* Logo */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 25px rgba(0,255,135,0.5)" }}>
          <Zap size={20} color="#040d08" fill="#040d08"/>
        </div>
        <span style={{ fontSize:"18px", fontWeight:700, letterSpacing:"2px", color:"var(--text)", fontFamily:"var(--mono)" }}>
          DEV<span style={{ color:"var(--green)" }}>TINDER</span>
        </span>
      </motion.div>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        style={{ width:"100%", maxWidth:"460px", background:"rgba(7,21,16,0.9)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"20px", overflow:"hidden" }}>
        <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,var(--green),transparent)" }}/>
        <div style={{ padding:"28px" }}>
          <h1 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", textAlign:"center", marginBottom:"18px" }}>Create Your Profile</h1>

          {/* Steps */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"6px" }}>
            {steps.map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"30px", height:"30px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700, fontFamily:"var(--mono)", background:step>i+1||step===i+1?"var(--green)":"transparent", color:step>=i+1?"#040d08":"var(--text3)", border:step<i+1?"1px solid var(--dim)":"none", boxShadow:step===i+1?"0 0 15px rgba(0,255,135,0.4)":"none", transition:"all .3s" }}>
                  {step>i+1 ? "✓" : i+1}
                </div>
                {i<steps.length-1 && <div style={{ width:"36px", height:"1px", background:step>i+1?"var(--green)":"var(--dim)", transition:"background .3s" }}/>}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"22px" }}>
            {steps.map((s,i) => <span key={i} style={{ fontSize:"10px", color:step===i+1?"var(--green)":"var(--text3)", fontFamily:"var(--mono)" }}>{s}</span>)}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>First Name *</label>
                    <div style={{ position:"relative" }}>
                      <User size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
                      <input value={form.firstName} onChange={upd("firstName")} placeholder="Vishal" style={{ ...inputStyle, paddingLeft:"34px" }} autoFocus/>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Last Name</label>
                    <input value={form.lastName} onChange={upd("lastName")} placeholder="Maurya" style={inputStyle}/>
                  </div>
                </div>

                <div style={{ marginBottom:"12px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Email *</label>
                  <div style={{ position:"relative" }}>
                    <Mail size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
                    <input type="email" value={form.emailId} onChange={upd("emailId")} placeholder="you@example.com" style={{ ...inputStyle, paddingLeft:"34px" }}/>
                  </div>
                </div>

                <div style={{ marginBottom:"12px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Mobile (Optional)</label>
                  <div style={{ position:"relative" }}>
                    <Phone size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
                    <input type="tel" value={form.mobile} onChange={upd("mobile")} placeholder="+91 9876543210" style={{ ...inputStyle, paddingLeft:"34px" }}/>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Password *</label>
                    <div style={{ position:"relative" }}>
                      <Lock size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
                      <input type={showPass?"text":"password"} value={form.password} onChange={upd("password")} placeholder="••••••••" style={{ ...inputStyle, paddingLeft:"34px", paddingRight:"34px" }}/>
                      <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>
                        {showPass?<EyeOff size={13}/>:<Eye size={13}/>}
                      </button>
                    </div>
                    {form.password && <p style={{ fontSize:"10px", marginTop:"4px", fontFamily:"var(--mono)", color:form.password.length<8?"#f87171":form.password.length<12?"#fb923c":"var(--green)" }}>
                      {form.password.length<8?"Weak":form.password.length<12?"Medium":"Strong ✓"}
                    </p>}
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Confirm *</label>
                    <div style={{ position:"relative" }}>
                      <Lock size={13} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--green)" }}/>
                      <input type="password" value={form.confirmPassword} onChange={upd("confirmPassword")} placeholder="••••••••" style={{ ...inputStyle, paddingLeft:"34px", borderColor:form.confirmPassword&&form.confirmPassword!==form.password?"rgba(248,113,113,0.4)":undefined }}/>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <p style={{ fontSize:"12px", color:"var(--text3)", marginBottom:"10px", fontFamily:"var(--mono)" }}>Select your tech stack ({form.skills.length} selected)</p>
                {form.skills.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", marginBottom:"10px", padding:"10px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.08)", borderRadius:"8px" }}>
                    {form.skills.map(s => (
                      <span key={s} onClick={()=>toggleSkill(s)}
                        style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"6px", fontSize:"11px", margin:"2px", background:"rgba(0,255,135,0.1)", border:"1px solid rgba(0,255,135,0.25)", color:"var(--green)", cursor:"pointer" }}>
                        {s} <X size={9}/>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display:"flex", flexWrap:"wrap", maxHeight:"220px", overflowY:"auto" }}>
                  {TECH_SKILLS.map(s => (
                    <button key={s.name} onClick={()=>toggleSkill(s.name)}
                      className={`skill ${form.skills.includes(s.name)?"active":""}`}>
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Age</label>
                    <input type="number" value={form.age} onChange={upd("age")} placeholder="22" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Gender</label>
                    <select value={form.gender} onChange={upd("gender")} style={{ ...inputStyle, cursor:"pointer" }}>
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom:"12px" }}>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>About You</label>
                  <textarea value={form.about} onChange={upd("about")} rows={3} placeholder="Passionate developer building the future..." style={{ ...inputStyle, resize:"none" }}/>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>GitHub URL</label>
                    <input value={form.github} onChange={upd("github")} placeholder="github.com/username" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Portfolio</label>
                    <input value={form.portfolio} onChange={upd("portfolio")} placeholder="mysite.dev" style={inputStyle}/>
                  </div>
                </div>

                {/* Profile summary */}
                <div style={{ padding:"12px", borderRadius:"10px", background:"rgba(0,255,135,0.04)", border:"1px solid rgba(0,255,135,0.1)", marginBottom:"14px" }}>
                  <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{form.firstName} {form.lastName}</p>
                  <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{form.emailId}</p>
                  {form.mobile && <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>📱 {form.mobile}</p>}
                  {form.skills.length>0 && <p style={{ fontSize:"11px", color:"var(--green)", marginTop:"4px", fontFamily:"var(--mono)" }}>{form.skills.slice(0,4).join(" · ")}{form.skills.length>4?` +${form.skills.length-4}`:""}</p>}
                </div>

                {/* CAPTCHA */}
                <div style={{ padding:"14px", borderRadius:"10px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.12)", marginBottom:"12px" }}>
                  <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"10px" }}>Security Check</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ padding:"10px 16px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"8px", fontSize:"18px", fontWeight:700, color:"var(--green)", fontFamily:"var(--mono)", userSelect:"none" }}>
                      {captchaNum1} + {captchaNum2} = ?
                    </div>
                    <input type="number" value={captchaInput} onChange={e=>setCaptchaInput(e.target.value)}
                      placeholder="Answer" style={{ ...inputStyle, width:"90px", textAlign:"center", fontSize:"16px", fontFamily:"var(--mono)", fontWeight:700 }}/>
                    {captchaInput && parseInt(captchaInput)===captchaNum1+captchaNum2 && <span style={{ color:"var(--green)", fontSize:"20px" }}>✓</span>}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div style={{ marginBottom:"14px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                    <div onClick={()=>setTermsAccepted(!termsAccepted)}
                      style={{ width:"18px", height:"18px", borderRadius:"5px", border:`1.5px solid ${termsAccepted?"var(--green)":"rgba(0,255,135,0.25)"}`, background:termsAccepted?"var(--green)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, marginTop:"1px", transition:"all .2s" }}>
                      {termsAccepted && <span style={{ fontSize:"11px", color:"#040d08", fontWeight:900 }}>✓</span>}
                    </div>
                    <p style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.6 }}>
                      I agree to the{" "}
                      <span onClick={()=>setShowTerms(true)} style={{ color:"var(--green)", cursor:"pointer", textDecoration:"underline", fontWeight:600 }}>Terms & Conditions</span>
                      {" "}and{" "}
                      <span onClick={()=>setShowTerms(true)} style={{ color:"var(--green)", cursor:"pointer", textDecoration:"underline", fontWeight:600 }}>Privacy Policy</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:"12px", color:"#f87171", marginBottom:"14px", fontFamily:"var(--mono)" }}>
              ⚠ {error}
            </motion.div>
          )}

          {/* Buttons */}
          <div style={{ display:"flex", gap:"10px" }}>
            {step > 1 && (
              <button onClick={()=>setStep(s=>s-1)} className="btn-sec" style={{ flex:1 }}>← Back</button>
            )}
            {step < 3 ? (
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={next}
                className="btn-prime" style={{ flex:2, padding:"12px" }}>
                Next →
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={signup} disabled={loading}
                className="btn-prime" style={{ flex:2, padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                {loading ? <div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Zap size={14} fill="#040d08"/>}
                {loading ? "Creating..." : "Launch Profile 🚀"}
              </motion.button>
            )}
          </div>

          <p style={{ textAlign:"center", fontSize:"13px", color:"var(--text3)", marginTop:"14px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"var(--green)", textDecoration:"none", fontWeight:600 }}>Sign in →</Link>
          </p>
        </div>
      </motion.div>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e=>e.target===e.currentTarget&&setShowTerms(false)}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }}
              style={{ background:"rgba(7,21,16,0.98)", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"20px", width:"100%", maxWidth:"500px", maxHeight:"80vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,var(--green),transparent)" }}/>
              <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h2 style={{ fontSize:"17px", fontWeight:700, color:"var(--text)" }}>Terms & Conditions</h2>
                <button onClick={()=>setShowTerms(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:"18px" }}>✕</button>
              </div>
              <div style={{ padding:"20px 24px", overflowY:"auto", flex:1 }}>
                {[
                  { title:"1. Acceptance", text:"By creating an account on DevTinder, you agree to these Terms. If you do not agree, please do not use this platform." },
                  { title:"2. Account Responsibility", text:"You are responsible for maintaining the confidentiality of your account credentials. Provide accurate and complete information during registration." },
                  { title:"3. Appropriate Use", text:"DevTinder is a professional developer collaboration platform. Do not use it for harassment, spam, or any illegal activities." },
                  { title:"4. Content Policy", text:"You retain ownership of content you post. Do not post offensive, copyrighted, or harmful content." },
                  { title:"5. Privacy & Data", text:"We collect only necessary data to provide our services. Your email and profile are stored securely. We never sell your data." },
                  { title:"6. Platform Stats", text:"GitHub, LeetCode, and other platform data is fetched from public APIs with your consent when you connect these platforms." },
                  { title:"7. Termination", text:"We reserve the right to suspend accounts that violate these terms. You may delete your account at any time." },
                  { title:"8. Disclaimer", text:"DevTinder is provided 'as is'. We are not responsible for any damages arising from platform use." },
                  { title:"9. Contact", text:"For questions about these terms, reach out through the platform. " },
                ].map(s => (
                  <div key={s.title} style={{ marginBottom:"16px" }}>
                    <h3 style={{ fontSize:"12px", fontWeight:700, color:"var(--green)", marginBottom:"5px", fontFamily:"var(--mono)" }}>{s.title}</h3>
                    <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.7 }}>{s.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding:"14px 24px", borderTop:"1px solid rgba(0,255,135,0.08)", display:"flex", gap:"10px" }}>
                <button onClick={()=>setShowTerms(false)} className="btn-sec" style={{ flex:1, padding:"10px" }}>Close</button>
                <button onClick={()=>{ setTermsAccepted(true); setShowTerms(false); }} className="btn-prime" style={{ flex:1.5, padding:"10px" }}>
                  Accept & Continue ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::-ms-reveal,input::-ms-clear{display:none}`}</style>
    </div>
  );
}
