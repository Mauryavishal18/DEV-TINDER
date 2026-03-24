import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Globe, MessageSquare, ArrowLeft, Star, ExternalLink, Award } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/user/profile/${userId}`)
      .then(r => setProfile(r.data.data))
      .catch(e => setError(e.response?.data?.message || "Could not load profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  const getPhoto = (u) => u?.useAvatar===false&&u?.photoUrl
    ? (u.photoUrl.startsWith("http") ? u.photoUrl : `${BASE_URL}${u.photoUrl}`)
    : getAvatarUrl(u?.avatarSeed||u?.firstName||"dev");

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"80px" }}>
      <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
        style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,0.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth:"600px", margin:"80px auto", textAlign:"center" }}>
      <p style={{ color:"#f87171", fontSize:"16px", marginBottom:"16px" }}>{error}</p>
      <button onClick={() => navigate(-1)} className="btn-sec" style={{ padding:"10px 20px" }}>← Go Back</button>
    </div>
  );

  if (!profile) return null;

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:"13px", marginBottom:"24px", fontFamily:"var(--font)" }}>
        <ArrowLeft size={15}/> Back
      </button>

      {/* Profile header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass" style={{ padding:"32px", marginBottom:"20px" }}>
        <div style={{ display:"flex", gap:"24px", alignItems:"flex-start", flexWrap:"wrap" }}>
          <img src={getPhoto(profile)} style={{ width:"100px", height:"100px", borderRadius:"50%", border:"3px solid rgba(0,255,135,0.3)", objectFit:"cover", flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:"200px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{profile.firstName} {profile.lastName}</h1>
            <p style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"10px" }}>
              {profile.role||"Developer"}{profile.age ? ` · Age ${profile.age}` : ""}{profile.gender ? ` · ${profile.gender}` : ""}
            </p>
            {profile.about && <p style={{ fontSize:"14px", color:"var(--text2)", lineHeight:1.7, marginBottom:"14px" }}>{profile.about}</p>}
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
              {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", color:"var(--text3)", textDecoration:"none", padding:"5px 12px", border:"1px solid var(--border)", borderRadius:"8px" }}><Github size={12}/> GitHub</a>}
              {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", color:"var(--text3)", textDecoration:"none", padding:"5px 12px", border:"1px solid var(--border)", borderRadius:"8px" }}><Globe size={12}/> Portfolio</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", color:"#0ea5e9", textDecoration:"none", padding:"5px 12px", border:"1px solid rgba(14,165,233,0.2)", borderRadius:"8px" }}>LI LinkedIn</a>}
              {profile.gfg && <a href={profile.gfg} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", color:"#22c55e", textDecoration:"none", padding:"5px 12px", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"8px" }}>GFG</a>}
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
            <button onClick={() => navigate(`/chat/${userId}`)} className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 18px", fontSize:"13px" }}>
              <MessageSquare size={14}/> Message
            </button>
          </div>
        </div>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"20px", alignItems:"start" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="glass" style={{ padding:"20px" }}>
              <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"14px" }}>Skills</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {profile.skills.map(s => <span key={s} className="tag-g" style={{ fontSize:"12px" }}>{s}</span>)}
              </div>
            </motion.div>
          )}

          {/* GitHub stats */}
          {profile.githubStats?.username && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="glass" style={{ padding:"20px" }}>
              <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"14px" }}>GitHub Stats</p>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
                <img src={profile.githubStats.avatar} style={{ width:"40px", height:"40px", borderRadius:"10px" }}/>
                <div>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>@{profile.githubStats.username}</p>
                  <a href={profile.githubStats.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"var(--green)", textDecoration:"none" }}>View on GitHub →</a>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
                {[{l:"Stars",v:profile.githubStats.totalStars,c:"#f59e0b"},{l:"Repos",v:profile.githubStats.publicRepos,c:"var(--green)"},{l:"Followers",v:profile.githubStats.followers,c:"#38bdf8"},{l:"Top Lang",v:profile.githubStats.topLanguage,c:"#a78bfa"}].map(s=>(
                  <div key={s.l} style={{ textAlign:"center", padding:"10px", background:"rgba(0,255,135,0.04)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"16px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v||"—"}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LeetCode stats */}
          {profile.leetcodeStats?.username && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="glass" style={{ padding:"20px" }}>
              <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"14px" }}>LeetCode Stats</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
                {[{l:"Total",v:profile.leetcodeStats.totalSolved,c:"var(--green)"},{l:"Easy",v:profile.leetcodeStats.easySolved,c:"#22c55e"},{l:"Medium",v:profile.leetcodeStats.mediumSolved,c:"#f59e0b"},{l:"Hard",v:profile.leetcodeStats.hardSolved,c:"#ef4444"}].map(s=>(
                  <div key={s.l} style={{ textAlign:"center", padding:"10px", background:"rgba(0,0,0,0.15)", borderRadius:"10px" }}>
                    <div style={{ fontSize:"18px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v||0}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"10px", fontFamily:"var(--mono)" }}>
                Rank #{profile.leetcodeStats.ranking?.toLocaleString()||"N/A"} · {profile.leetcodeStats.acceptanceRate?.toFixed(1)||0}% acceptance
              </p>
            </motion.div>
          )}

          {/* Endorsements */}
          {profile.endorsements?.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="glass" style={{ padding:"20px" }}>
              <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"14px" }}>Endorsements ({profile.endorsements.length})</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {profile.endorsements.map((e,i) => (
                  <div key={i} style={{ padding:"14px", background:"rgba(0,255,135,0.03)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.1)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                      <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{e.fromName}</p>
                      <span style={{ color:"#f59e0b" }}>{"★".repeat(e.rating)}{"☆".repeat(5-e.rating)}</span>
                    </div>
                    <p style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.6, fontStyle:"italic" }}>"{e.text}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="glass" style={{ padding:"16px" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>Dev Score</p>
            <div style={{ fontSize:"36px", fontWeight:700, color:"var(--green)", fontFamily:"var(--mono)", textShadow:"0 0 20px rgba(0,255,135,0.4)", textAlign:"center", padding:"16px 0" }}>
              {profile.devScore || 0}
            </div>
            <p style={{ fontSize:"11px", color:"var(--text3)", textAlign:"center", fontFamily:"var(--mono)" }}>pts</p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="glass" style={{ padding:"16px" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"12px" }}>Quick Stats</p>
            {[
              { l:"GitHub Stars", v:profile.githubStats?.totalStars||"—", c:"#f59e0b" },
              { l:"LC Solved", v:profile.leetcodeStats?.totalSolved||"—", c:"#fb923c" },
              { l:"Skills", v:profile.skills?.length||0, c:"var(--green)" },
              { l:"Repos", v:profile.githubStats?.publicRepos||"—", c:"#38bdf8" },
            ].map(s => (
              <div key={s.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:"12px", color:"var(--text3)" }}>{s.l}</span>
                <span style={{ fontSize:"14px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
