import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, MessageSquare, Zap, Star, Code } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

export default function OpenSourcePage() {
  const user = useSelector(s => s.user);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("/opensource/matches")
      .then(r => {
        setMatches(r.data.data || []);
        if (r.data.message) setMsg(r.data.message);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPhoto = (u) => u?.useAvatar===false&&u?.photoUrl
    ? (u.photoUrl.startsWith("http") ? u.photoUrl : `${BASE_URL}${u.photoUrl}`)
    : getAvatarUrl(u?.avatarSeed||u?.firstName||"dev");

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
          <Github size={24} style={{ display:"inline", verticalAlign:"middle", marginRight:"10px", color:"var(--green)" }}/>
          Open Source <span style={{ color:"var(--green)" }}>Matcher</span>
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>
          Developers matched to you by shared language ({user?.githubStats?.topLanguage || "—"}) and tech skills
        </p>
      </motion.div>

      {/* Your stack */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="glass" style={{ padding:"18px 22px", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
            <Code size={14} color="var(--green)" />
            <span style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Your top language:</span>
            <span className="tag-g" style={{ fontSize:"11px" }}>{user?.githubStats?.topLanguage || "Not connected"}</span>
          </div>
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {user?.skills?.slice(0,5).map(s => <span key={s} className="tag-n" style={{ fontSize:"10px" }}>{s}</span>)}
          </div>
          {!user?.githubStats && (
            <button onClick={() => navigate("/profile")} className="btn-prime" style={{ fontSize:"12px", padding:"7px 14px", marginLeft:"auto" }}>
              Connect GitHub →
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
            style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : msg ? (
        <div className="glass" style={{ padding:"40px", textAlign:"center" }}>
          <Github size={40} style={{ color:"var(--text3)", margin:"0 auto 14px" }}/>
          <p style={{ fontSize:"14px", color:"var(--text2)", marginBottom:"16px" }}>{msg}</p>
          <button onClick={() => navigate("/profile")} className="btn-prime">Connect GitHub & Add Skills →</button>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass" style={{ padding:"40px", textAlign:"center" }}>
          <p style={{ fontSize:"14px", color:"var(--text3)" }}>No matches found yet. More developers will join soon!</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <p style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{matches.length} developers matched</p>
          {matches.map((m, i) => {
            const u = m.user;
            return (
              <motion.div key={u._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.04 }}
                className="glass" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:"16px" }}>
                <img src={getPhoto(u)} style={{ width:"52px", height:"52px", borderRadius:"12px", objectFit:"cover", border:"1px solid rgba(0,255,135,0.2)", flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px" }}>
                    <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)" }}>{u.firstName} {u.lastName||""}</h3>
                    {/* Match score badge */}
                    <span style={{ padding:"2px 10px", borderRadius:"20px", fontSize:"10px", fontWeight:700, fontFamily:"var(--mono)",
                      background: m.matchScore>=70?"rgba(0,255,135,0.12)":m.matchScore>=40?"rgba(251,146,60,0.1)":"rgba(255,255,255,0.05)",
                      color: m.matchScore>=70?"var(--green)":m.matchScore>=40?"#fb923c":"var(--text3)",
                      border: `1px solid ${m.matchScore>=70?"rgba(0,255,135,0.25)":m.matchScore>=40?"rgba(251,146,60,0.2)":"rgba(255,255,255,0.08)"}` }}>
                      {m.matchScore}% match
                    </span>
                  </div>
                  {/* Shared skills */}
                  {m.sharedSkills.length > 0 && (
                    <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"6px" }}>
                      <span style={{ fontSize:"11px", color:"var(--text3)" }}>Shared:</span>
                      {m.sharedSkills.slice(0,4).map(s => <span key={s} className="tag-g" style={{ fontSize:"10px" }}>{s}</span>)}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                    {u.githubStats && (
                      <>
                        <span style={{ fontSize:"11px", color:"#6e7681", fontFamily:"var(--mono)" }}>
                          <Github size={9} style={{ display:"inline" }}/> {u.githubStats.topLanguage}
                        </span>
                        <span style={{ fontSize:"11px", color:"#f59e0b", fontFamily:"var(--mono)" }}>
                          <Star size={9} style={{ display:"inline" }}/> {u.githubStats.totalStars}
                        </span>
                      </>
                    )}
                    <span style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>
                      <Zap size={9} style={{ display:"inline" }}/> {u.devScore} pts
                    </span>
                  </div>
                </div>
                <button onClick={() => navigate(`/chat/${u._id}`)}
                  className="btn-prime" style={{ fontSize:"12px", padding:"8px 14px", display:"flex", alignItems:"center", gap:"5px", flexShrink:0 }}>
                  <MessageSquare size={12}/> Message
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
