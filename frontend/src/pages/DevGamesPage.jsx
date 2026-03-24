import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, Zap, Clock, RefreshCw, Code } from "lucide-react";

const TYPING_CHALLENGES = [
  { code: "const sum = (a, b) => a + b;", lang: "JS" },
  { code: "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)", lang: "PY" },
  { code: "SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC;", lang: "SQL" },
  { code: "git commit -m 'fix: resolve null pointer exception in auth middleware'", lang: "GIT" },
  { code: "docker run -d -p 3000:3000 --name devtinder devtinder:latest", lang: "CMD" },
];

const BUG_HUNT = [
  { code: `function greet(name) {\n  console.log("Hello, " + name)\n  return "Hello " + nane; // bug here\n}`, bug: "nane", fix: "name", hint: "Typo in variable name" },
  { code: `const arr = [1, 2, 3];\nfor (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}`, bug: "<=", fix: "<", hint: "Off-by-one error in loop condition" },
  { code: `async function getData() {\n  const data = fetch('/api/data');\n  return data.json();\n}`, bug: "fetch", fix: "await fetch", hint: "Missing await keyword" },
];

export default function DevGamesPage() {
  const [game, setGame] = useState(null); // null | "typing" | "bughunt" | "trivia"
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("idle"); // idle | playing | ended
  const [typingInput, setTypingInput] = useState("");
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [mistakes, setMistakes] = useState(0);
  const [bugIdx, setBugIdx] = useState(0);
  const [bugGuess, setBugGuess] = useState("");
  const [bugResult, setBugResult] = useState(null);
  const [wpm, setWpm] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (gameState === "playing" && game === "typing") {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setGameState("ended"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, game]);

  const startGame = (g) => {
    setGame(g); setScore(0); setGameState("playing");
    setTypingInput(""); setChallengeIdx(0); setTimeLeft(60); setMistakes(0); setWpm(0);
    setBugIdx(0); setBugGuess(""); setBugResult(null);
  };

  const handleTyping = (val) => {
    const target = TYPING_CHALLENGES[challengeIdx].code;
    setTypingInput(val);
    const elapsed = (Date.now() - startRef.current) / 60000;
    const words = val.split(" ").length;
    setWpm(Math.round(words / elapsed) || 0);
    if (val === target) {
      setScore(s => s + 10);
      setTypingInput("");
      if (challengeIdx < TYPING_CHALLENGES.length - 1) setChallengeIdx(c => c + 1);
      else { clearInterval(timerRef.current); setGameState("ended"); }
    }
  };

  const checkBug = () => {
    const current = BUG_HUNT[bugIdx];
    if (bugGuess.trim() === current.bug) {
      setBugResult("correct");
      setScore(s => s + 20);
      setTimeout(() => {
        setBugResult(null); setBugGuess("");
        if (bugIdx < BUG_HUNT.length - 1) setBugIdx(i => i + 1);
        else setGameState("ended");
      }, 1200);
    } else {
      setBugResult("wrong");
      setMistakes(m => m + 1);
      setTimeout(() => setBugResult(null), 800);
    }
  };

  const current = TYPING_CHALLENGES[challengeIdx];
  const currentBug = BUG_HUNT[bugIdx];

  const GAMES = [
    { id:"typing", icon:"⌨️", title:"Code Typing Race", desc:"Type code snippets as fast as you can. Beat your WPM record!", color:"var(--green)", stat:"Best: 87 WPM" },
    { id:"bughunt", icon:"🐛", title:"Bug Hunt", desc:"Find the bug in the code. Faster = more points!", color:"#fb923c", stat:"Top: 3/3 perfect" },
    { id:"trivia", icon:"🧠", title:"Dev Trivia", desc:"Test your CS knowledge. 15 questions, 30 seconds each.", color:"#a78bfa", stat:"Record: 1400pts" },
  ];

  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"36px 24px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#7c3aed,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Gamepad2 size={18} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)" }}>Dev Games <span style={{ color:"#ec4899" }}>🎮</span></h1>
            <p style={{ fontSize:"13px", color:"var(--text3)" }}>Sharpen your skills through play. Compete. Improve. Win.</p>
          </div>
        </div>
      </motion.div>

      {!game || gameState === "idle" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"16px" }}>
          {GAMES.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
              whileHover={{ y:-4, boxShadow:`0 20px 40px rgba(0,0,0,0.3)` }}
              onClick={() => startGame(g.id)}
              className="glass" style={{ padding:"24px", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>{g.icon}</div>
              <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>{g.title}</h3>
              <p style={{ fontSize:"12px", color:"var(--text3)", lineHeight:1.5, marginBottom:"14px" }}>{g.desc}</p>
              <span style={{ fontSize:"11px", color:g.color, fontFamily:"var(--mono)" }}>{g.stat}</span>
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                style={{ marginTop:"16px", padding:"9px", borderRadius:"9px", background:`${g.color}12`, border:`1px solid ${g.color}30`, fontSize:"13px", fontWeight:600, color:g.color }}>
                Play Now →
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : gameState === "playing" ? (
        <AnimatePresence mode="wait">
          {game === "typing" && (
            <motion.div key="typing" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {/* HUD */}
              <div style={{ display:"flex", gap:"16px", marginBottom:"20px" }}>
                {[{l:"Time",v:`${timeLeft}s`,c:timeLeft<10?"#f87171":"var(--green)"},{l:"Score",v:score,c:"#f59e0b"},{l:"WPM",v:wpm,c:"#38bdf8"},{l:"Mistakes",v:mistakes,c:"#f87171"}].map(s=>(
                  <div key={s.l} style={{ flex:1, textAlign:"center", padding:"12px", background:"rgba(0,255,135,0.04)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.08)" }}>
                    <div style={{ fontSize:"20px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="glass" style={{ padding:"20px", marginBottom:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                  <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Challenge {challengeIdx+1}/{TYPING_CHALLENGES.length}</span>
                  <span style={{ padding:"2px 8px", borderRadius:"4px", background:"rgba(0,255,135,0.08)", fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>{current.lang}</span>
                </div>
                <div style={{ fontFamily:"var(--mono)", fontSize:"14px", lineHeight:1.8, padding:"16px", background:"rgba(0,0,0,0.2)", borderRadius:"8px", marginBottom:"14px", position:"relative" }}>
                  {current.code.split("").map((ch, i) => {
                    const typed = typingInput[i];
                    let color = "var(--text3)";
                    if (typed !== undefined) color = typed === ch ? "var(--green)" : "#f87171";
                    return <span key={i} style={{ color, background: i === typingInput.length ? "rgba(0,255,135,0.2)" : "transparent" }}>{ch}</span>;
                  })}
                </div>
                <input value={typingInput} onChange={e => handleTyping(e.target.value)} autoFocus
                  className="inp" style={{ fontFamily:"var(--mono)", fontSize:"14px" }} placeholder="Start typing..."/>
              </div>
            </motion.div>
          )}

          {game === "bughunt" && (
            <motion.div key="bughunt" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <div style={{ display:"flex", gap:"16px", marginBottom:"20px" }}>
                {[{l:"Score",v:score,c:"#f59e0b"},{l:"Bug",v:`${bugIdx+1}/${BUG_HUNT.length}`,c:"var(--green)"},{l:"Wrong",v:mistakes,c:"#f87171"}].map(s=>(
                  <div key={s.l} style={{ flex:1, textAlign:"center", padding:"12px", background:"rgba(0,255,135,0.04)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.08)" }}>
                    <div style={{ fontSize:"20px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="glass" style={{ padding:"24px", marginBottom:"16px" }}>
                <p style={{ fontSize:"12px", color:"#fb923c", marginBottom:"12px", fontFamily:"var(--mono)" }}>🐛 Find and type the buggy part:</p>
                <pre style={{ fontFamily:"var(--mono)", fontSize:"13px", color:"var(--text)", lineHeight:1.8, padding:"16px", background:"rgba(0,0,0,0.2)", borderRadius:"8px", marginBottom:"14px", overflowX:"auto" }}>
                  <code>{currentBug.code}</code>
                </pre>
                <p style={{ fontSize:"11px", color:"var(--text3)", marginBottom:"12px" }}>💡 Hint: {currentBug.hint}</p>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input value={bugGuess} onChange={e=>setBugGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkBug()}
                    className="inp" placeholder="Type the buggy part..." autoFocus
                    style={{ fontFamily:"var(--mono)", border:`1px solid ${bugResult==="correct"?"var(--green)":bugResult==="wrong"?"#f87171":"var(--border)"}` }}/>
                  <motion.button whileTap={{ scale:.95 }} onClick={checkBug} className="btn-prime" style={{ padding:"0 20px", flexShrink:0 }}>Check</motion.button>
                </div>
                {bugResult && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:"10px", fontSize:"13px", color:bugResult==="correct"?"var(--green)":"#f87171", fontFamily:"var(--mono)" }}>
                    {bugResult==="correct" ? "✅ Correct! +20 pts" : "❌ Wrong! Try again"}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {game === "trivia" && (
            <motion.div key="trivia" initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="glass" style={{ padding:"32px", textAlign:"center" }}>
              <p style={{ fontSize:"14px", color:"var(--text3)" }}>Trivia mode coming soon! 🧠</p>
              <button onClick={() => setGame(null)} className="btn-sec" style={{ marginTop:"16px", padding:"10px 24px" }}>Back to Games</button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // Game ended
        <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} className="glass"
          style={{ padding:"40px", textAlign:"center" }}>
          <div style={{ fontSize:"56px", marginBottom:"12px" }}>{score >= 50 ? "🏆" : score >= 20 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize:"24px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>Game Over!</h2>
          {game === "typing" && <p style={{ fontSize:"15px", color:"var(--text2)", marginBottom:"16px" }}>Final WPM: <strong style={{ color:"var(--green)" }}>{wpm}</strong> · Score: <strong style={{ color:"#f59e0b" }}>{score}</strong></p>}
          {game === "bughunt" && <p style={{ fontSize:"15px", color:"var(--text2)", marginBottom:"16px" }}>Bugs Found: <strong style={{ color:"var(--green)" }}>{bugIdx}/{BUG_HUNT.length}</strong> · Score: <strong style={{ color:"#f59e0b" }}>{score}</strong></p>}
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={() => startGame(game)} className="btn-prime" style={{ padding:"12px 24px" }}>
              <RefreshCw size={14} style={{ display:"inline", marginRight:"6px" }}/> Play Again
            </motion.button>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={() => { setGame(null); setGameState("idle"); }} className="btn-sec" style={{ padding:"12px 20px" }}>
              All Games
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
