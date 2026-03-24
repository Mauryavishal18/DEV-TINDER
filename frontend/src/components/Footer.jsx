import { Link } from "react-router-dom";
import { Zap, Heart } from "lucide-react";
export default function Footer() {
  return (
    <footer style={{ borderTop:"1px solid rgba(0,255,135,0.08)", marginTop:"auto" }}>
      <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(0,255,135,0.2),transparent)" }}/>
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Zap size={14} color="var(--green)" fill="var(--green)"/>
          <span style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
            © 2026 DEVTINDER · Built with{" "}
            <Heart size={10} style={{ display:"inline", color:"#f87171", fill:"#f87171", verticalAlign:"middle" }}/> by{" "}
            <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none", fontWeight:600 }}>Vishal Maurya</a>
          </span>
        </div>
        <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
          {["React","Node.js","MongoDB"].map(t=><span key={t} style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{t}</span>)}
          <span style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>Groq AI</span>
          <Link to="/about" style={{ fontSize:"11px", color:"var(--text3)", textDecoration:"none" }} onMouseEnter={e=>e.target.style.color="var(--green)"} onMouseLeave={e=>e.target.style.color="var(--text3)"}>About</Link>
        </div>
      </div>
    </footer>
  );
}
