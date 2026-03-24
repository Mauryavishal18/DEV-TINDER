import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Code, Heart, X, Eye, EyeOff, Terminal, Zap } from "lucide-react";
import axios from "axios";
import { useToast } from "../components/ToastProvider";

const SAMPLE_SNIPPETS = [
  { code: `async function fetchUser(id) {\n  try {\n    const res = await api.get(\`/users/\${id}\`);\n    return res.data;\n  } catch(e) {\n    logger.error('fetchUser failed', { id, error: e.message });\n    throw new ServiceError('USER_NOT_FOUND');\n  }\n}`, lang: "javascript" },
  { code: `def merge_sorted(a, b):\n    result, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]: result.append(a[i]); i+=1\n        else: result.append(b[j]); j+=1\n    return result + a[i:] + b[j:]`, lang: "python" },
  { code: `const useDebounce = (value, delay) => {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n};`, lang: "react" },
  { code: `router.get('/users', auth, cache(300), async (req, res) => {\n  const { page=1, limit=20, role } = req.query;\n  const filter = role ? { role } : {};\n  const users = await User.find(filter)\n    .skip((page-1)*limit).limit(+limit)\n    .select('-password -tokens');\n  res.json({ data: users, page: +page });\n});`, lang: "node.js" },
];

export default function BlindDevDatePage() {
  const user = useSelector(s => s.user);
  const toast = useToast();
  const [phase, setPhase] = useState("intro"); // intro | viewing | reveal | matched
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [mySnippet, setMySnippet] = useState("");
  const [myLang, setMyLang] = useState("javascript");
  const [revealed, setRevealed] = useState(null);
  const [swipeDir, setSwipeDir] = useState(null);
  const [snippetIdx, setSnippetIdx] = useState(0);

  const startBrowsing = () => {
    if (!mySnippet.trim()) { toast("Write your code snippet first!", "error"); return; }
    setCurrentSnippet(SAMPLE_SNIPPETS[snippetIdx]);
    setPhase("viewing");
  };

  const swipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      setSwipeDir(null);
      if (dir === "right") {
        // It's a match! Reveal identity
        setRevealed({ name: "Anjani K.", role: "Full Stack Developer", skills: ["React", "Node.js", "MongoDB"], match: 87 });
        setPhase("reveal");
      } else {
        const nextIdx = (snippetIdx + 1) % SAMPLE_SNIPPETS.length;
        setSnippetIdx(nextIdx);
        setCurrentSnippet(SAMPLE_SNIPPETS[nextIdx]);
      }
    }, 400);
  };

  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"36px 24px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <EyeOff size={18} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)" }}>Blind Dev Date <span style={{ color:"#a78bfa" }}>✦</span></h1>
            <p style={{ fontSize:"13px", color:"var(--text3)" }}>Judge by code, not by looks. No names. No photos. Pure skill.</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            {/* How it works */}
            <div className="glass" style={{ padding:"24px", marginBottom:"20px" }}>
              <p style={{ fontSize:"13px", fontWeight:600, color:"var(--green)", marginBottom:"16px", textTransform:"uppercase", letterSpacing:"1.5px" }}>How it works</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {[
                  { n:"1", t:"Share your code", d:"Write a snippet that shows your style — a function, a hook, anything you're proud of" },
                  { n:"2", t:"See anonymous code", d:"Browse other developers' snippets — no name, no photo, just pure code" },
                  { n:"3", t:"Swipe right if impressed", d:"Like the code? Swipe right. Both swipe right = identity revealed!" },
                  { n:"4", t:"It's a match!", d:"When both connect, names and photos are revealed. Start chatting!" },
                ].map(s => (
                  <div key={s.n} style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                    <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:"#a78bfa", flexShrink:0, fontFamily:"var(--mono)" }}>{s.n}</div>
                    <div><p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"2px" }}>{s.t}</p><p style={{ fontSize:"12px", color:"var(--text3)" }}>{s.d}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Write snippet */}
            <div className="glass" style={{ padding:"24px" }}>
              <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"14px" }}>Your Code Snippet <span style={{ color:"var(--text3)", fontWeight:400 }}>(this is all they'll see)</span></p>
              <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                {["javascript","python","react","node.js","other"].map(l => (
                  <button key={l} onClick={() => setMyLang(l)} style={{ padding:"4px 12px", borderRadius:"6px", border:`1px solid ${myLang===l?"#a78bfa":"var(--border)"}`, background:myLang===l?"rgba(167,139,250,0.12)":"transparent", color:myLang===l?"#a78bfa":"var(--text3)", fontSize:"11px", cursor:"pointer", fontFamily:"var(--mono)" }}>{l}</button>
                ))}
              </div>
              <textarea value={mySnippet} onChange={e=>setMySnippet(e.target.value)}
                placeholder="// Paste your best code here...\n// Make it count — this is your first impression!"
                className="inp"
                style={{ fontFamily:"var(--mono)", fontSize:"12px", lineHeight:1.7, minHeight:"160px", resize:"vertical" }}/>
              <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"6px" }}>💡 Tip: Show your problem-solving style, error handling, and code clarity</p>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={startBrowsing}
                className="btn-prime" style={{ width:"100%", marginTop:"16px", padding:"13px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none" }}>
                <Eye size={15}/> Start Blind Dating →
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === "viewing" && currentSnippet && (
          <motion.div key="viewing" initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.97 }}>
            <div style={{ textAlign:"center", marginBottom:"20px" }}>
              <span style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Anonymous Developer #{snippetIdx + 1} • Judge the code, not the coder</span>
            </div>
            <motion.div
              animate={swipeDir === "right" ? { x:400, opacity:0, rotate:20 } : swipeDir === "left" ? { x:-400, opacity:0, rotate:-20 } : {}}
              transition={{ duration:0.35 }}
              className="glass" style={{ padding:"0", overflow:"hidden", marginBottom:"24px" }}>
              <div style={{ background:"rgba(0,255,135,0.04)", padding:"12px 18px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ display:"flex", gap:"5px" }}>
                  <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#f87171" }}/>
                  <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#fbbf24" }}/>
                  <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"var(--green)" }}/>
                </div>
                <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>anonymous.{currentSnippet.lang}</span>
              </div>
              <pre style={{ padding:"24px", margin:0, fontFamily:"var(--mono)", fontSize:"13px", color:"var(--green)", lineHeight:1.8, overflowX:"auto", background:"rgba(0,0,0,0.2)" }}>
                <code>{currentSnippet.code}</code>
              </pre>
            </motion.div>

            {/* Swipe buttons */}
            <div style={{ display:"flex", justifyContent:"center", gap:"32px" }}>
              <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.93 }} onClick={() => swipe("left")}
                style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(239,68,68,0.1)", border:"2px solid rgba(239,68,68,0.35)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={26} color="#f87171"/>
              </motion.button>
              <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:.93 }} onClick={() => swipe("right")}
                style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(0,255,135,0.1)", border:"2px solid rgba(0,255,135,0.35)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Heart size={26} color="var(--green)"/>
              </motion.button>
            </div>
            <p style={{ textAlign:"center", fontSize:"12px", color:"var(--text3)", marginTop:"14px" }}>← Pass &nbsp;&nbsp;|&nbsp;&nbsp; Connect →</p>

            <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginTop:"20px" }}>
              <button onClick={() => setPhase("intro")} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--font)" }}>← Change my snippet</button>
            </div>
          </motion.div>
        )}

        {phase === "reveal" && revealed && (
          <motion.div key="reveal" initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:"center" }}>
            <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:0.6 }}>
              <div style={{ fontSize:"64px", marginBottom:"16px" }}>🎉</div>
            </motion.div>
            <h2 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>It's a Match!</h2>
            <p style={{ fontSize:"14px", color:"var(--text3)", marginBottom:"28px" }}>You both liked each other's code. Identity revealed!</p>

            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="glass" style={{ padding:"28px", maxWidth:"360px", margin:"0 auto 24px", textAlign:"center" }}>
              <div style={{ width:"80px", height:"80px", borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:"32px" }}>👩‍💻</div>
              <h3 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{revealed.name}</h3>
              <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"12px" }}>{revealed.role}</p>
              <div style={{ display:"flex", gap:"6px", justifyContent:"center", flexWrap:"wrap", marginBottom:"14px" }}>
                {revealed.skills.map(s => <span key={s} className="tag-g" style={{ fontSize:"11px" }}>{s}</span>)}
              </div>
              <div style={{ padding:"10px", background:"rgba(0,255,135,0.06)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.15)" }}>
                <p style={{ fontSize:"13px", color:"var(--green)", fontFamily:"var(--mono)", fontWeight:700 }}>{revealed.match}% code compatibility</p>
              </div>
            </motion.div>

            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} className="btn-prime"
                style={{ padding:"12px 28px", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none" }}>
                💬 Start Chatting
              </motion.button>
              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} className="btn-sec"
                onClick={() => { setPhase("viewing"); setRevealed(null); }}>
                Keep Browsing
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
