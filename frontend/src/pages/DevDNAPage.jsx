import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Dna, ChevronRight, BarChart2, Zap } from "lucide-react";

const QUESTIONS = [
  { id:"commit_style", q:"Your commit style?", opts:[{v:"atomic",l:"Atomic — one feature per commit"},{ v:"bulk",l:"Bulk pusher — one big commit at end"},{v:"wip",l:"WIP commits — messy but honest"},{v:"clean",l:"Squash everything — clean history"}] },
  { id:"debug_method", q:"How do you debug?", opts:[{v:"console",l:"console.log everything 😅"},{v:"debugger",l:"Proper debugger/breakpoints"},{v:"rubber",l:"Rubber duck method — talk it out"},{v:"rewrite",l:"Delete and rewrite from scratch"}] },
  { id:"time", q:"When do you code best?", opts:[{v:"morning",l:"Early morning (5-9 AM)"},{v:"day",l:"Day time (9-5 PM)"},{v:"evening",l:"Evening (6-10 PM)"},{v:"night",l:"Late night (10 PM - 3 AM) 🦉"}] },
  { id:"approach", q:"Your dev approach?", opts:[{v:"plan",l:"Plan everything before coding"},{v:"prototype",l:"Prototype first, refine later"},{v:"tdd",l:"Tests first (TDD)"},{v:"vibe",l:"Just vibe and ship 🚀"}] },
  { id:"stack_feel", q:"How do you feel about your stack?", opts:[{v:"master",l:"Master of one — deep expertise"},{v:"fullstack",l:"Full-stack generalist"},{v:"explorer",l:"Always learning new things"},{v:"legacy",l:"Stuck in legacy but making it work"}] },
  { id:"review", q:"Code reviews for you are?", opts:[{v:"love",l:"Love giving detailed reviews"},{v:"hate",l:"Dread them but they help"},{v:"nitpick",l:"I nitpick everything"},{v:"approve",l:"LGTM and ship it 😂"}] },
  { id:"error_handling", q:"Error handling philosophy?", opts:[{v:"paranoid",l:"Handle every possible error"},{v:"happy",l:"Happy path first, errors later"},{v:"crash",l:"Crash loudly — fail fast"},{v:"ignore",l:"Try-catch everything silently"}] },
  { id:"collab", q:"Preferred work style?", opts:[{v:"solo",l:"Solo — deep focus, no meetings"},{v:"pair",l:"Pair programming is life"},{v:"async",l:"Async collaboration — PRs & docs"},{v:"mob",l:"Mob programming — whole team"}] },
];

const PERSONAS = {
  "night-owl-vibe": { name:"The Vibe Coder", emoji:"🌙", color:"#a78bfa", desc:"Ships at 2 AM, no tests, it just works somehow. Legend." },
  "morning-plan": { name:"The Architect", emoji:"📐", color:"#38bdf8", desc:"Diagrams before code. Comments in 3 languages. Never ships." },
  "day-tdd": { name:"The Craftsperson", emoji:"⚒️", color:"var(--green)", desc:"TDD, clean code, proper reviews. The team's backbone." },
  "night-prototype": { name:"The Hacker", emoji:"⚡", color:"#f59e0b", desc:"Prototypes in 4 hours, refactors for weeks. Chaotic good." },
  default: { name:"The Full-Stack Wizard", emoji:"🧙", color:"#fb923c", desc:"Does everything, masters nothing, gets everything done." },
};

export default function DevDNAPage() {
  const user = useSelector(s => s.user);
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const answer = (val) => {
    const newAnswers = { ...answers, [QUESTIONS[qIdx].id]: val };
    setAnswers(newAnswers);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      // Calculate persona
      const key = `${newAnswers.time}-${newAnswers.approach}`;
      const persona = PERSONAS[key] || PERSONAS.default;
      // Calculate compatibility traits
      const traits = [
        { name:"Night Owl", val: newAnswers.time === "night" ? 95 : newAnswers.time === "evening" ? 70 : 30 },
        { name:"Planner", val: newAnswers.approach === "plan" ? 90 : newAnswers.approach === "tdd" ? 75 : 35 },
        { name:"Solo Coder", val: newAnswers.collab === "solo" ? 88 : newAnswers.collab === "async" ? 65 : 40 },
        { name:"Clean Code", val: newAnswers.error_handling === "paranoid" ? 92 : newAnswers.review === "nitpick" ? 80 : 50 },
        { name:"Vibe Coder", val: newAnswers.approach === "vibe" ? 94 : newAnswers.debug_method === "console" ? 72 : 30 },
      ];
      setResult({ persona, traits, answers: newAnswers });
      setPhase("result");
    }
  };

  const q = QUESTIONS[qIdx];
  const progress = (qIdx / QUESTIONS.length) * 100;

  return (
    <div style={{ maxWidth:"700px", margin:"0 auto", padding:"36px 24px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#059669,#00ff87)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Dna size={18} color="#040d08"/>
          </div>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)" }}>Dev DNA <span style={{ color:"var(--green)" }}>✦</span></h1>
            <p style={{ fontSize:"13px", color:"var(--text3)" }}>Discover your developer personality. Find your perfect coding partner.</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
            <div className="glass" style={{ padding:"32px", textAlign:"center", marginBottom:"20px" }}>
              <div style={{ fontSize:"64px", marginBottom:"16px" }}>🧬</div>
              <h2 style={{ fontSize:"22px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>What kind of developer are you?</h2>
              <p style={{ fontSize:"14px", color:"var(--text2)", lineHeight:1.7, marginBottom:"24px" }}>8 questions about your coding habits, personality, and work style. Get your Dev DNA profile + find developers who complement your style.</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"28px" }}>
                {[{e:"🌙",l:"Night Owl?"},{e:"📐",l:"Architect?"},{e:"⚡",l:"Hacker?"},{e:"⚒️",l:"Craftsperson?"},{e:"🚀",l:"Vibe Coder?"},{e:"🧙",l:"Wizard?"}].map(p=>(
                  <div key={p.l} style={{ padding:"12px", background:"rgba(0,255,135,0.04)", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.1)" }}>
                    <div style={{ fontSize:"24px", marginBottom:"4px" }}>{p.e}</div>
                    <p style={{ fontSize:"11px", color:"var(--text3)" }}>{p.l}</p>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={() => setPhase("quiz")}
                className="btn-prime" style={{ padding:"13px 32px", fontSize:"15px" }}>
                Discover My Dev DNA 🧬
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div key={`q-${qIdx}`} initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-50 }}>
            {/* Progress */}
            <div style={{ marginBottom:"24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                <span style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Question {qIdx+1} of {QUESTIONS.length}</span>
                <span style={{ fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height:"4px", background:"rgba(0,255,135,0.1)", borderRadius:"2px" }}>
                <motion.div animate={{ width:`${progress}%` }} style={{ height:"100%", background:"var(--green)", borderRadius:"2px" }}/>
              </div>
            </div>

            <div className="glass" style={{ padding:"28px" }}>
              <h2 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"24px", lineHeight:1.4 }}>{q.q}</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {q.opts.map(o => (
                  <motion.button key={o.v} whileHover={{ scale:1.01, x:4 }} whileTap={{ scale:.98 }}
                    onClick={() => answer(o.v)}
                    style={{ padding:"14px 18px", borderRadius:"12px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.12)", color:"var(--text)", fontSize:"14px", cursor:"pointer", textAlign:"left", fontFamily:"var(--font)", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    {o.l} <ChevronRight size={15} style={{ color:"var(--text3)", flexShrink:0 }}/>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div key="result" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            {/* Persona card */}
            <motion.div initial={{ scale:.9 }} animate={{ scale:1 }} transition={{ delay:0.1 }}
              className="glass" style={{ padding:"32px", textAlign:"center", marginBottom:"20px", border:`1px solid ${result.persona.color}30` }}>
              <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:2, repeat:Infinity }}>
                <div style={{ fontSize:"72px", marginBottom:"12px" }}>{result.persona.emoji}</div>
              </motion.div>
              <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:"20px", background:`${result.persona.color}15`, border:`1px solid ${result.persona.color}30`, marginBottom:"12px" }}>
                <span style={{ fontSize:"11px", fontFamily:"var(--mono)", color:result.persona.color, fontWeight:600 }}>YOUR DEV PERSONA</span>
              </div>
              <h2 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"10px" }}>{result.persona.name}</h2>
              <p style={{ fontSize:"15px", color:"var(--text2)", lineHeight:1.6 }}>{result.persona.desc}</p>
            </motion.div>

            {/* DNA Traits */}
            <div className="glass" style={{ padding:"24px", marginBottom:"16px" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"18px" }}>Your Dev DNA Traits</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                {result.traits.map((t,i) => (
                  <div key={t.name}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                      <span style={{ fontSize:"13px", color:"var(--text2)" }}>{t.name}</span>
                      <span style={{ fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)", fontWeight:700 }}>{t.val}%</span>
                    </div>
                    <div style={{ height:"6px", background:"rgba(0,255,135,0.08)", borderRadius:"3px" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${t.val}%` }} transition={{ delay: i * 0.1 + 0.3, duration:0.8 }}
                        style={{ height:"100%", borderRadius:"3px", background:`linear-gradient(90deg, var(--green3), var(--green))` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} className="btn-prime" style={{ flex:1, padding:"12px" }}>
                <Zap size={14} style={{ display:"inline", marginRight:"6px" }}/> Find My DNA Match
              </motion.button>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} className="btn-sec"
                onClick={() => { setPhase("intro"); setQIdx(0); setAnswers({}); setResult(null); }}
                style={{ padding:"12px 20px" }}>Retake</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
