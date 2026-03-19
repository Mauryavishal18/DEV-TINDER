import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Github, Users, Star } from "lucide-react";
import axios from "axios";
import { getAvatarUrl } from "../utils/constants";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get("/user/connections").then(r=>setConnections(r.data.data||[])).catch(console.error).finally(()=>setLoading(false));
  }, []);
  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>Your <span style={{ color:"var(--green)", textShadow:"0 0 20px rgba(0,255,135,0.4)" }}>Connections</span></h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Developers you have matched with</p>
      </motion.div>
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,0.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : connections.length===0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass" style={{ textAlign:"center", padding:"64px 40px" }}>
          <Users size={48} style={{ color:"var(--text3)", margin:"0 auto 16px" }}/>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>No Connections Yet</h3>
          <p style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px", lineHeight:1.6 }}>Start exploring developers and make your first match!</p>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>navigate("/")} className="btn-prime" style={{ padding:"10px 24px" }}>Explore Developers →</motion.button>
        </motion.div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {connections.map((c,i) => {
            const photo = c.useAvatar===false && c.photoUrl ? `http://localhost:3000${c.photoUrl}` : getAvatarUrl(c.avatarSeed||c.firstName||"dev");
            return (
              <motion.div key={c._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}
                className="glass" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={photo} style={{ width:"56px", height:"56px", borderRadius:"14px", border:"1px solid rgba(0,255,135,0.2)", objectFit:"cover" }}/>
                  <div className="online-dot" style={{ position:"absolute", bottom:"-2px", right:"-2px", border:"2px solid var(--bg)" }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{c.firstName} {c.lastName}</h3>
                  {c.about && <p style={{ fontSize:"13px", color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"6px" }}>{c.about}</p>}
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {c.skills?.slice(0,3).map(s=><span key={s} className="tag-g" style={{ fontSize:"10px", padding:"2px 8px" }}>{s}</span>)}
                    {c.githubStats && <span style={{ fontSize:"11px", color:"#f59e0b", fontFamily:"var(--mono)" }}><Star size={9} style={{ display:"inline" }}/> {c.githubStats.totalStars}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>navigate(`/chat/${c._id}`)} className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", fontSize:"12px" }}><MessageSquare size={13}/> Chat</motion.button>
                  {c.github && <a href={c.github} target="_blank" rel="noreferrer"><button className="btn-ico"><Github size={14}/></button></a>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
