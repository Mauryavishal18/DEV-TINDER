
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader, ExternalLink } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../utils/store";

const fetchGitHub = async (username) => {
  const [uRes, rRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`),
  ]);
  if (!uRes.ok) throw new Error("GitHub user not found");
  const u = await uRes.json();
  const repos = await rRes.json();
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const langs = {};
  repos.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
  const topLang = Object.entries(langs).sort((a,b) => b[1]-a[1])[0]?.[0] || "Various";
  return { username: u.login, name: u.name || u.login, avatar: u.avatar_url, bio: u.bio, followers: u.followers, publicRepos: u.public_repos, totalStars: stars, topLanguage: topLang, profileUrl: u.html_url };
};

const fetchLC = async (username) => {
  const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
  if (!res.ok) throw new Error("Cannot fetch LeetCode stats");
  const d = await res.json();
  if (d.status === "error") throw new Error("LeetCode user not found");
  return { username, totalSolved: d.totalSolved, easySolved: d.easySolved, mediumSolved: d.mediumSolved, hardSolved: d.hardSolved, acceptanceRate: d.acceptanceRate, ranking: d.ranking, profileUrl: `https://leetcode.com/${username}` };
};

const PLATFORMS = [
  { id:"github", name:"GitHub", icon:"GH", color:"#6e7681", bg:"#161b22", placeholder:"e.g. Mauryavishal18", desc:"Repos, stars, languages, followers" },
  { id:"leetcode", name:"LeetCode", icon:"LC", color:"#fb923c", bg:"#1a0a0a", placeholder:"LeetCode username", desc:"Problems solved, ranking, acceptance" },
  { id:"linkedin", name:"LinkedIn", icon:"LI", color:"#0ea5e9", bg:"#0a1628", placeholder:"linkedin.com/in/yourprofile", desc:"Profile URL" },
  { id:"gfg", name:"GeeksForGeeks", icon:"GF", color:"#22c55e", bg:"#0a2010", placeholder:"GFG username", desc:"Score, problems, articles" },
];

export default function PlatformConnect({ connectedPlatforms = {} }) {
  const dispatch = useDispatch();
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const openModal = (p) => { setActive(p); setInput(""); setError(""); setPreview(null); };
  const closeModal = () => { setActive(null); setInput(""); setError(""); setPreview(null); };

  const handleFetch = async () => {
    if (!input.trim()) { setError("Enter a username"); return; }
    setLoading(true); setError(""); setPreview(null);
    try {
      let data;
      if (active.id === "github") data = await fetchGitHub(input.trim());
      else if (active.id === "leetcode") data = await fetchLC(input.trim());
      else data = { username: input.trim(), profileUrl: input.trim(), manual: true };
      setPreview(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const res = await axios.post("/profile/save-platform", { platform: active.id, data: preview });
      dispatch(updateUser(res.data.user));
      closeModal();
    } catch(e) { setError(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {PLATFORMS.map(p => {
          const isConn = !!connectedPlatforms[p.id];
          return (
            <div key={p.id} className="platform-row">
              <div style={{ width:"34px", height:"34px", borderRadius:"8px", background:p.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"10px", fontWeight:700, color:p.color, fontFamily:"var(--mono)" }}>{p.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{p.name}</p>
                {isConn ? <p style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>✓ Connected</p>
                        : <p style={{ fontSize:"11px", color:"var(--text3)" }}>{p.desc}</p>}
              </div>
              <button onClick={() => openModal(p)} className={isConn ? "btn-sec" : "btn-prime"} style={{ fontSize:"11px", padding:"5px 14px" }}>
                {isConn ? "Edit" : "Add"}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:.97 }}
              style={{ background:"rgba(7,21,16,0.98)", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"440px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:active.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:active.color, fontFamily:"var(--mono)" }}>{active.icon}</div>
                  <div>
                    <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--text)" }}>Connect {active.name}</h3>
                    <p style={{ fontSize:"11px", color:"var(--text3)" }}>{active.desc}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="btn-ico" style={{ width:"32px", height:"32px" }}><X size={14}/></button>
              </div>
              <div style={{ marginBottom:"14px" }}>
                <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>{active.id==="linkedin"?"Profile URL":"Username"}</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleFetch()} placeholder={active.placeholder} className="inp" style={{ fontSize:"13px", flex:1 }} autoFocus/>
                  <button onClick={handleFetch} disabled={loading} className="btn-prime" style={{ padding:"0 16px", fontSize:"12px", flexShrink:0, display:"flex", alignItems:"center", gap:"6px" }}>
                    {loading ? <Loader size={13} style={{ animation:"spin 1s linear infinite" }}/> : "Fetch"}
                  </button>
                </div>
              </div>
              {error && <div style={{ padding:"10px 14px", borderRadius:"8px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:"12px", color:"#f87171", marginBottom:"14px" }}>⚠ {error}</div>}
              {preview && (
                <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  style={{ padding:"16px", borderRadius:"12px", background:"rgba(0,255,135,0.04)", border:"1px solid rgba(0,255,135,0.15)", marginBottom:"16px" }}>
                  {active.id==="github" && (
                    <>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
                        <img src={preview.avatar} style={{ width:"48px", height:"48px", borderRadius:"12px", border:"1px solid rgba(0,255,135,0.2)" }}/>
                        <div>
                          <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>{preview.name}</p>
                          <a href={preview.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"var(--green)", textDecoration:"none", display:"flex", alignItems:"center", gap:"4px" }}>@{preview.username} <ExternalLink size={10}/></a>
                        </div>
                      </div>
                      {preview.bio && <p style={{ fontSize:"12px", color:"var(--text2)", marginBottom:"12px" }}>{preview.bio}</p>}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px" }}>
                        {[{l:"Repos",v:preview.publicRepos,c:"var(--green)"},{l:"Stars",v:preview.totalStars,c:"#f59e0b"},{l:"Followers",v:preview.followers,c:"#38bdf8"},{l:"Lang",v:preview.topLanguage,c:"#a78bfa"}].map(s=>(
                          <div key={s.l} style={{ textAlign:"center", padding:"8px", background:"rgba(0,0,0,0.2)", borderRadius:"8px" }}>
                            <div style={{ fontSize:"13px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</div>
                            <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"2px" }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {active.id==="leetcode" && (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                        <div>
                          <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>@{preview.username}</p>
                          <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Rank #{preview.ranking?.toLocaleString()}</p>
                        </div>
                        <a href={preview.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"#fb923c", textDecoration:"none", display:"flex", alignItems:"center", gap:"4px" }}>Profile <ExternalLink size={10}/></a>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px" }}>
                        {[{l:"Total",v:preview.totalSolved,c:"var(--green)"},{l:"Easy",v:preview.easySolved,c:"#22c55e"},{l:"Medium",v:preview.mediumSolved,c:"#f59e0b"},{l:"Hard",v:preview.hardSolved,c:"#ef4444"}].map(s=>(
                          <div key={s.l} style={{ textAlign:"center", padding:"8px", background:"rgba(0,0,0,0.2)", borderRadius:"8px" }}>
                            <div style={{ fontSize:"16px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</div>
                            <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"2px" }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"8px" }}>Acceptance: <span style={{ color:"var(--green)" }}>{preview.acceptanceRate?.toFixed(1)}%</span></p>
                    </>
                  )}
                  {(active.id==="linkedin"||active.id==="gfg") && (
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <CheckCircle size={18} color="var(--green)"/>
                      <div>
                        <p style={{ fontSize:"13px", color:"var(--text)", fontWeight:600 }}>Ready to save!</p>
                        <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{input}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              {preview && (
                <button onClick={handleSave} disabled={saving} className="btn-prime" style={{ width:"100%", padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                  {saving ? <Loader size={14} style={{ animation:"spin 1s linear infinite" }}/> : <CheckCircle size={15}/>}
                  {saving ? "Saving to profile..." : `Save ${active.name} Profile`}
                </button>
              )}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
