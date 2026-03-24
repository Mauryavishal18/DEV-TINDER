import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Trophy, Globe, Zap, Users, Medal, Flag } from "lucide-react";

const COUNTRIES = [
  { code:"IN", name:"India", flag:"🇮🇳", color:"#ff9933", devs:4821, score:94230, rank:1 },
  { code:"US", name:"USA", flag:"🇺🇸", color:"#3c3b6e", devs:3920, score:88450, rank:2 },
  { code:"DE", name:"Germany", flag:"🇩🇪", color:"#ffce00", devs:2341, score:72100, rank:3 },
  { code:"CN", name:"China", flag:"🇨🇳", color:"#de2910", devs:3201, score:68900, rank:4 },
  { code:"BR", name:"Brazil", flag:"🇧🇷", color:"#009c3b", devs:1890, score:55200, rank:5 },
  { code:"GB", name:"UK", flag:"🇬🇧", color:"#012169", devs:1654, score:49800, rank:6 },
  { code:"JP", name:"Japan", flag:"🇯🇵", color:"#bc002d", devs:1432, score:44300, rank:7 },
  { code:"CA", name:"Canada", flag:"🇨🇦", color:"#ff0000", devs:1210, score:41200, rank:8 },
];

const WEEKLY_CHALLENGE = {
  title: "Build a Rate Limiter",
  desc: "Implement a token bucket rate limiter in any language. Must handle concurrent requests, configurable limits, and proper error responses.",
  difficulty: "Medium",
  timeLeft: "2d 14h 23m",
  participants: 1247,
  languages: ["Any"],
  prize: "🥇 Country +500pts | Personal Badge: Rate Limit Master",
};

export default function DevWorldCupPage() {
  const user = useSelector(s => s.user);
  const [tab, setTab] = useState("leaderboard");
  const [joined, setJoined] = useState(false);
  const [solution, setSolution] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState({ d:2, h:14, m:23, s:0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => {
        let {d,h,m,s} = t;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        return { d: Math.max(0,d), h: Math.max(0,h), m: Math.max(0,m), s: Math.max(0,s) };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const userCountry = COUNTRIES[0]; // India - based on user location

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 24px" }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#f59e0b,#ef4444)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Trophy size={18} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)" }}>Dev World Cup <span style={{ color:"#f59e0b" }}>🏆</span></h1>
            <p style={{ fontSize:"13px", color:"var(--text3)" }}>Country vs Country coding battles. Represent your nation. Win glory.</p>
          </div>
        </div>

        {/* User's country card */}
        <div style={{ padding:"14px 18px", background:"rgba(255,153,51,0.08)", borderRadius:"12px", border:"1px solid rgba(255,153,51,0.2)", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"28px" }}>🇮🇳</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>You're representing <strong style={{ color:"#ff9933" }}>India</strong></p>
            <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Rank #1 · 94,230 pts · 4,821 devs</p>
          </div>
          <div style={{ padding:"4px 12px", borderRadius:"20px", background:"rgba(255,153,51,0.15)", border:"1px solid rgba(255,153,51,0.3)" }}>
            <span style={{ fontSize:"11px", color:"#ff9933", fontFamily:"var(--mono)", fontWeight:600 }}>🥇 LEADING</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"2px", marginBottom:"24px", background:"rgba(0,255,135,0.04)", borderRadius:"12px", padding:"4px", border:"1px solid rgba(0,255,135,0.1)" }}>
        {[["leaderboard","🏆 Leaderboard"],["challenge","⚡ This Week's Challenge"],["history","📊 My Contributions"]].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ flex:1, padding:"9px", borderRadius:"9px", border:"none", background:tab===v?"rgba(0,255,135,0.12)":"transparent", color:tab===v?"var(--green)":"var(--text3)", fontSize:"12px", fontWeight:tab===v?600:400, cursor:"pointer", fontFamily:"var(--font)", transition:"all .2s" }}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "leaderboard" && (
          <motion.div key="lb" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {COUNTRIES.map((c, i) => (
                <motion.div key={c.code} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                  style={{ padding:"16px 20px", borderRadius:"14px", background: c.code==="IN" ? "rgba(255,153,51,0.06)" : "rgba(0,255,135,0.02)", border:`1px solid ${c.code==="IN" ? "rgba(255,153,51,0.25)" : "rgba(0,255,135,0.08)"}`, display:"flex", alignItems:"center", gap:"16px" }}>
                  <div style={{ fontSize:"20px", fontWeight:700, color: i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#fb923c":"var(--text3)", fontFamily:"var(--mono)", width:"28px", textAlign:"center" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <span style={{ fontSize:"28px" }}>{c.flag}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>{c.name}</p>
                    <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{c.devs.toLocaleString()} developers</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"16px", fontWeight:700, color: c.code==="IN"?"#ff9933":"var(--green)", fontFamily:"var(--mono)" }}>{c.score.toLocaleString()}</p>
                    <p style={{ fontSize:"10px", color:"var(--text3)" }}>points</p>
                  </div>
                  {/* Score bar */}
                  <div style={{ width:"80px", height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(c.score/94230)*100}%`, background: c.code==="IN"?"#ff9933":"var(--green)", borderRadius:"3px" }}/>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "challenge" && (
          <motion.div key="ch" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="glass" style={{ padding:"24px", marginBottom:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
                <div>
                  <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                    <span style={{ padding:"3px 10px", borderRadius:"20px", background:"rgba(251,146,60,0.12)", border:"1px solid rgba(251,146,60,0.25)", fontSize:"11px", color:"#fb923c", fontFamily:"var(--mono)" }}>MEDIUM</span>
                    <span style={{ padding:"3px 10px", borderRadius:"20px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.15)", fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>WEEK 12</span>
                  </div>
                  <h2 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>{WEEKLY_CHALLENGE.title}</h2>
                  <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>{WEEKLY_CHALLENGE.desc}</p>
                </div>
                {/* Countdown */}
                <div style={{ textAlign:"center", padding:"14px 18px", background:"rgba(0,255,135,0.04)", borderRadius:"12px", border:"1px solid rgba(0,255,135,0.1)", flexShrink:0 }}>
                  <p style={{ fontSize:"10px", color:"var(--text3)", marginBottom:"8px", textTransform:"uppercase", letterSpacing:"1px" }}>Time Left</p>
                  <div style={{ display:"flex", gap:"6px" }}>
                    {[["d","Days"],["h","Hrs"],["m","Min"],["s","Sec"]].map(([k,l]) => (
                      <div key={k} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:"20px", fontWeight:700, color:"var(--green)", fontFamily:"var(--mono)", minWidth:"32px" }}>{String(time[k]).padStart(2,"0")}</div>
                        <div style={{ fontSize:"9px", color:"var(--text3)" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", padding:"12px 16px", background:"rgba(0,255,135,0.04)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.08)" }}>
                <span style={{ fontSize:"12px", color:"var(--text3)" }}>👥 {WEEKLY_CHALLENGE.participants.toLocaleString()} participants</span>
                <span style={{ fontSize:"12px", color:"#f59e0b" }}>🏆 {WEEKLY_CHALLENGE.prize}</span>
              </div>
            </div>

            {!submitted ? (
              <div className="glass" style={{ padding:"24px" }}>
                <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"12px" }}>Submit Your Solution</p>
                <textarea value={solution} onChange={e=>setSolution(e.target.value)}
                  placeholder="// Paste your solution here...\n// Any language accepted\n// Include time & space complexity in comments"
                  className="inp" style={{ fontFamily:"var(--mono)", fontSize:"12px", lineHeight:1.7, minHeight:"200px", resize:"vertical", marginBottom:"12px" }}/>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                  onClick={() => { if(solution.trim()) setSubmitted(true); }}
                  disabled={!solution.trim()}
                  className="btn-prime" style={{ width:"100%", padding:"12px", opacity:solution.trim()?1:0.5 }}>
                  <Zap size={14} style={{ display:"inline", marginRight:"6px" }}/> Submit for India 🇮🇳
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} className="glass"
                style={{ padding:"32px", textAlign:"center" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎉</div>
                <h3 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>Solution Submitted!</h3>
                <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"16px" }}>Your contribution will be reviewed and scored. Results in 48 hours.</p>
                <div style={{ padding:"12px", background:"rgba(0,255,135,0.06)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.15)" }}>
                  <p style={{ fontSize:"13px", color:"var(--green)", fontWeight:600 }}>+50 XP added to India's score 🇮🇳</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div key="hist" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="glass" style={{ padding:"32px", textAlign:"center" }}>
            <Medal size={40} style={{ color:"var(--text3)", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:"15px", color:"var(--text)", marginBottom:"8px" }}>No submissions yet</p>
            <p style={{ fontSize:"13px", color:"var(--text3)" }}>Complete weekly challenges to contribute to India's score!</p>
            <button onClick={() => setTab("challenge")} className="btn-prime" style={{ marginTop:"20px", padding:"10px 24px" }}>View This Week's Challenge</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
