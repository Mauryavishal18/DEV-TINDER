import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Zap } from "lucide-react";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <motion.div animate={{ y:[0,-12,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }} style={{ marginBottom:"24px" }}>
        <p style={{ fontSize:"clamp(80px,15vw,140px)", fontWeight:900, fontFamily:"var(--mono)", lineHeight:1, color:"transparent", WebkitTextStroke:"1px rgba(0,255,135,0.3)", textShadow:"0 0 60px rgba(0,255,135,0.1)" }}>404</p>
      </motion.div>
      <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px", boxShadow:"0 0 30px rgba(0,255,135,0.4)" }}><Zap size={24} color="#040d08" fill="#040d08"/></div>
      <h1 style={{ fontSize:"22px", fontWeight:700, color:"var(--text)", marginBottom:"10px", fontFamily:"var(--mono)", letterSpacing:"2px" }}>LOST IN THE MATRIX</h1>
      <p style={{ fontSize:"14px", color:"var(--text2)", marginBottom:"28px", textAlign:"center", maxWidth:"360px", lineHeight:1.6 }}>This page drifted into the void. The URL you entered does not exist.</p>
      <div style={{ display:"flex", gap:"12px" }}>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>navigate("/")} className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"8px", padding:"11px 24px" }}><Home size={15}/> Go Home</motion.button>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>navigate(-1)} className="btn-sec" style={{ padding:"11px 24px" }}>← Go Back</motion.button>
      </div>
      <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"40px", fontFamily:"var(--mono)" }}>DevTinder · Built by <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none" }}>Vishal Maurya</a></p>
    </div>
  );
}
