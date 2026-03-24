import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader, ExternalLink, Github, Linkedin } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../utils/store";
import { useToast } from "./ToastProvider";

const fetchGitHub = async (username) => {
  const clean = username.replace(/.*github\.com\//,"").replace(/\//,"").trim();
  const [uRes, rRes] = await Promise.all([
    fetch(`https://api.github.com/users/${clean}`),
    fetch(`https://api.github.com/users/${clean}/repos?per_page=100&sort=pushed`),
  ]);
  if (!uRes.ok) throw new Error("GitHub user not found. Check username.");
  const u = await uRes.json();
  const repos = await rRes.json();
  const stars = Array.isArray(repos) ? repos.reduce((s,r)=>s+r.stargazers_count,0) : 0;

  // Aggregate real language BYTES (not just count) for accurate skill mastery %
  const langBytes = {};
  if (Array.isArray(repos)) {
    await Promise.all(
      repos.slice(0, 15).map(async (repo) => {
        try {
          const lRes = await fetch(`https://api.github.com/repos/${clean}/${repo.name}/languages`);
          if (lRes.ok) {
            const lData = await lRes.json();
            Object.entries(lData).forEach(([lang, bytes]) => {
              langBytes[lang] = (langBytes[lang] || 0) + bytes;
            });
          }
        } catch {}
      })
    );
  }
  const topLang = Object.entries(langBytes).sort((a,b)=>b[1]-a[1])[0]?.[0] || "Various";

  return {
    username:u.login, name:u.name||u.login, avatar:u.avatar_url,
    bio:u.bio, followers:u.followers, following:u.following,
    publicRepos:u.public_repos, totalStars:stars,
    topLanguage:topLang, languages:langBytes,
    profileUrl:u.html_url,
  };
};

const fetchLC = async (username) => {
  const clean = username.replace(/.*leetcode\.com\//,"").replace(/\//,"").trim();
  // Try multiple free APIs in order
  const apis = [
    `https://leetcode-api-faisalshohag.vercel.app/${clean}`,
    `https://alfa-leetcode-api.onrender.com/${clean}`,
  ];
  
  let d = null;
  for (const url of apis) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const json = await res.json();
        if (json && (json.totalSolved !== undefined || json.solvedProblem !== undefined)) {
          d = json; break;
        }
      }
    } catch {}
  }
  
  if (!d) throw new Error("LeetCode user not found. Check your username.");
  
  // Normalize different API response shapes
  const totalSolved = d.totalSolved ?? d.solvedProblem ?? 0;
  const easySolved = d.easySolved ?? d.easySolvedCount ?? 0;
  const mediumSolved = d.mediumSolved ?? d.mediumSolvedCount ?? 0;
  const hardSolved = d.hardSolved ?? d.hardSolvedCount ?? 0;
  const acceptanceRate = d.acceptanceRate ?? d.acceptanceRateCount ?? 0;
  const ranking = d.ranking ?? d.userRank ?? 0;
  
  if (totalSolved === 0 && !d.username && !d.matchedUser) {
    throw new Error("LeetCode user not found. Check your username.");
  }
  
  return {
    username: clean, totalSolved, easySolved, mediumSolved, hardSolved,
    acceptanceRate, ranking,
    profileUrl: `https://leetcode.com/${clean}`,
  };
};

const PLATFORMS = [
  { id:"github",   name:"GitHub",       icon:"GH", color:"#e2e8f0", bg:"#161b22", placeholder:"username or github.com/username", desc:"Repos, stars, top language, followers" },
  { id:"leetcode", name:"LeetCode",     icon:"LC", color:"#fb923c", bg:"#1a0a0a", placeholder:"username or leetcode.com/username", desc:"Problems solved, ranking, acceptance rate" },
  { id:"linkedin", name:"LinkedIn",     icon:"LI", color:"#0ea5e9", bg:"#0a1628", placeholder:"linkedin.com/in/yourprofile", desc:"Your LinkedIn profile URL" },
  { id:"gfg",      name:"GeeksForGeeks",icon:"GF", color:"#22c55e", bg:"#0a2010", placeholder:"Your GFG profile URL", desc:"GeeksForGeeks profile URL" },
];

export default function PlatformConnect({ connectedPlatforms={} }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const openModal = (p) => { setActive(p); setInput(""); setError(""); setPreview(null); };
  const closeModal = () => { setActive(null); setInput(""); setError(""); setPreview(null); };

  const handleFetch = async () => {
    if (!input.trim()) { setError("Enter a username or URL"); return; }
    setLoading(true); setError(""); setPreview(null);
    try {
      let data;
      if (active.id==="github") data = await fetchGitHub(input.trim());
      else if (active.id==="leetcode") data = await fetchLC(input.trim());
      else {
        // LinkedIn / GFG — just save the URL
        const url = input.trim().startsWith("http") ? input.trim() : `https://${input.trim()}`;
        data = { username:input.trim(), profileUrl:url, manual:true };
      }
      setPreview(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      const res = await axios.post("/profile/save-platform", { platform:active.id, data:preview });
      dispatch(updateUser(res.data.user));
      toast(`${active.name} connected! ✅`, "success");
      closeModal();
    } catch(e) { setError(e.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const isConnected = (id) => {
    const d = connectedPlatforms[id];
    if (!d) return false;
    if (typeof d === "string") return !!d;
    return !!(d?.username || d?.profileUrl);
  };

  const getLabel = (id) => {
    const d = connectedPlatforms[id];
    if (!d) return null;
    if (typeof d === "string") return d;
    return d?.username || "Connected";
  };

  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {PLATFORMS.map(p => {
          const conn = isConnected(p.id);
          const label = getLabel(p.id);
          return (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"10px", background:conn?"rgba(0,255,135,0.04)":"transparent", border:`1px solid ${conn?"rgba(0,255,135,0.2)":"var(--border)"}`, transition:"all .2s" }}>
              <div style={{ width:"34px", height:"34px", borderRadius:"8px", background:p.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:p.color, fontFamily:"var(--mono)", flexShrink:0 }}>{p.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text)" }}>{p.name}</p>
                {conn
                  ? <p style={{ fontSize:"10px", color:"var(--green)", fontFamily:"var(--mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>✓ @{label}</p>
                  : <p style={{ fontSize:"10px", color:"var(--text3)" }}>{p.desc}</p>}
              </div>
              <button onClick={()=>openModal(p)} className={conn?"btn-sec":"btn-prime"} style={{ fontSize:"11px", padding:"5px 12px", flexShrink:0 }}>
                {conn?"Update":"Add"}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e=>e.target===e.currentTarget&&closeModal()}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20 }}
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
                <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>
                  {active.id==="linkedin"||active.id==="gfg" ? "Profile URL" : "Username"}
                </label>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleFetch()}
                    placeholder={active.placeholder} className="inp" style={{ fontSize:"13px", flex:1 }} autoFocus/>
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
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px" }}>
                        <img src={preview.avatar} style={{ width:"48px", height:"48px", borderRadius:"12px", border:"1px solid rgba(0,255,135,0.2)" }}/>
                        <div>
                          <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>{preview.name}</p>
                          <a href={preview.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"var(--green)", textDecoration:"none", display:"flex", alignItems:"center", gap:"4px" }}>@{preview.username} <ExternalLink size={10}/></a>
                        </div>
                      </div>
                      {preview.bio && <p style={{ fontSize:"12px", color:"var(--text2)", marginBottom:"12px" }}>{preview.bio}</p>}
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
                        {[{l:"Repos",v:preview.publicRepos,c:"var(--green)"},{l:"Stars",v:preview.totalStars,c:"#f59e0b"},{l:"Followers",v:preview.followers,c:"#38bdf8"},{l:"Top Lang",v:preview.topLanguage,c:"#a78bfa"}].map(s=>(
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
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px", alignItems:"center" }}>
                        <div>
                          <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>@{preview.username}</p>
                          <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                            Global Rank: #{preview.ranking?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                        <a href={preview.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"#fb923c", textDecoration:"none", display:"flex", alignItems:"center", gap:"4px" }}>Profile <ExternalLink size={10}/></a>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
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
                        <p style={{ fontSize:"13px", color:"var(--text)", fontWeight:600 }}>Profile URL saved!</p>
                        <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", wordBreak:"break-all" }}>{preview.profileUrl}</p>
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
