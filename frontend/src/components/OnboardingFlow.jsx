import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap, Users, MessageSquare, Bot, Trophy, Code } from "lucide-react";

const STEPS = [
  { icon:<Zap size={32} color="#040d08" fill="#040d08"/>, bg:"var(--green)", title:"Welcome to DevTinder! ⚡", desc:"The professional platform where developers find collaborators, build projects, and level up their careers. Let's take a quick tour!", action:"Get Started" },
  { icon:<Users size={32} color="var(--green)"/>, bg:"rgba(0,255,135,.1)", title:"Explore Developers", desc:"Swipe through developer profiles matched by tech stack. Click 'Connect' to send a connection request. When both connect — it's a MATCH! 🎉", action:"Next →" },
  { icon:<MessageSquare size={32} color="#a78bfa"/>, bg:"rgba(167,139,250,.1)", title:"Real-time Chat", desc:"Chat with your connections in real-time. Share code snippets, review pull requests, and collaborate on projects directly in the chat!", action:"Next →" },
  { icon:<Bot size={32} color="#a78bfa"/>, bg:"rgba(167,139,250,.1)", title:"Dev AI Assistant", desc:"Your personal AI coding assistant powered by Groq Llama 3. Get code reviews, debugging help, system design advice, and FAANG prep — completely free!", action:"Next →" },
  { icon:<Trophy size={32} color="#f59e0b"/>, bg:"rgba(245,158,11,.1)", title:"Dev Score & Leaderboard", desc:"Connect GitHub and LeetCode to auto-calculate your Dev Score. Compete on the global leaderboard and show off your skills!", action:"Next →" },
  { icon:<Code size={32} color="var(--green)"/>, bg:"rgba(0,255,135,.1)", title:"AI Code Review", desc:"Paste any code and get instant expert review — bugs, security issues, optimizations, and improvements. Better than GitHub Copilot!", action:"Let's Go! 🚀" },
];

export default function OnboardingFlow() {
  const user = useSelector(s => s.user);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(()=>{
    if (!user?._id) return;
    const key = `dt_onboarded_${user._id}`;
    const done = localStorage.getItem(key);
    if (done) return;
    // Only show for new accounts (created within last 10 minutes)
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const isNewAccount = createdAt && (Date.now() - createdAt.getTime() < 10 * 60 * 1000);
    if (isNewAccount) { setTimeout(()=>setVisible(true), 1200); }
    else { localStorage.setItem(key, "true"); } // mark done for existing users
  }, [user?._id]);

  const next = () => {
    if (step < STEPS.length-1) setStep(s=>s+1);
    else finish();
  };

  const finish = () => {
    setVisible(false);
    if (user?._id) localStorage.setItem(`dt_onboarded_${user._id}`, "true");
  };

  const s = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <motion.div key={step} initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20, scale:.97 }}
            style={{ background:"rgba(7,21,16,.98)", border:"1px solid rgba(0,255,135,.2)", borderRadius:"24px", padding:"40px", width:"100%", maxWidth:"440px", textAlign:"center", position:"relative" }}>

            <button onClick={finish} style={{ position:"absolute", top:"16px", right:"16px", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><X size={18}/></button>

            {/* Progress dots */}
            <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"28px" }}>
              {STEPS.map((_,i)=>(
                <div key={i} style={{ width:i===step?20:6, height:"6px", borderRadius:"3px", background:i===step?"var(--green)":i<step?"var(--green3)":"rgba(0,255,135,.2)", transition:"all .3s" }}/>
              ))}
            </div>

            {/* Icon */}
            <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }}
              style={{ width:"80px", height:"80px", borderRadius:"20px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", border:"1px solid rgba(0,255,135,.2)" }}>
              {s.icon}
            </motion.div>

            <h2 style={{ fontSize:"22px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>{s.title}</h2>
            <p style={{ fontSize:"14px", color:"var(--text2)", lineHeight:1.7, marginBottom:"28px" }}>{s.desc}</p>

            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={next}
              className="btn-prime" style={{ width:"100%", padding:"14px", fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
              {s.action} {step<STEPS.length-1?<ArrowRight size={16}/>:null}
            </motion.button>

            {step>0 && (
              <button onClick={finish} style={{ marginTop:"12px", background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"var(--text3)", fontFamily:"var(--font)" }}>
                Skip tour
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
