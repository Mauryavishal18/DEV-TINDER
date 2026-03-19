import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Copy, CheckCheck, Terminal, Zap } from "lucide-react";
import { GROQ_API_KEY, GROQ_URL, GROQ_MODEL } from "../utils/constants";
import { getAvatarUrl } from "../utils/constants";

const fmt = (text) =>
  text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) =>
    `<div class="code-block"><div class="code-header"><span>${l||"code"}</span></div><pre>${c.trim()}</pre></div>`)
  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>')
  .replace(/`([^`]+)`/g, '<code style="background:rgba(0,255,135,0.08);color:var(--green);padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:11px">$1</code>')
  .replace(/\n/g, "<br/>");

const QUICK = [
  "Review my React component for best practices",
  "Best tech stack for a real-time app?",
  "Write a custom debounce React hook",
  "How to crack FAANG interviews?",
  "Debug my Node.js MongoDB error",
  "System design for DevTinder at scale",
];

export default function AIPage() {
  const user = useSelector(s => s.user);
  const [messages, setMessages] = useState([{
    id:1, role:"assistant",
    content: `Hey **${user?.firstName||"Developer"}**! I am your **Dev AI** powered by **Groq (Llama 3)** — completely free and super fast!\n\nI know your stack: **${user?.skills?.slice(0,3).join(", ")||"React, Node.js, MongoDB"}**\n\nAsk me anything — code reviews, debugging, system design, career advice. I give real answers! 🚀`,
    time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const userPhoto = user?.useAvatar===false && user?.photoUrl
    ? `http://localhost:3000${user.photoUrl}`
    : getAvatarUrl(user?.avatarSeed||user?.firstName||"dev");

  const send = async (text) => {
    const content = (text||input).trim();
    if (!content || loading) return;
    const userMsg = { id:Date.now(), role:"user", content, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
    setMessages(p => [...p, userMsg]);
    setInput(""); setError(""); setLoading(true);
    if (taRef.current) taRef.current.style.height = "44px";

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content.replace(/<[^>]*>/g,"") }));

      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role:"system", content:`You are Dev AI, an expert assistant in DevTinder — a developer collaboration platform. User: ${user?.firstName||"Developer"}, Stack: ${user?.skills?.join(", ")||"JavaScript, React, Node.js"}. Be concise, practical, developer-focused. Use markdown with code blocks.` },
            ...history
          ],
          max_tokens: 1024, temperature: 0.7,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message||`Error ${res.status}`); }
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "Could not generate response.";
      setMessages(p => [...p, { id:Date.now()+1, role:"assistant", content:aiText, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    } catch(e) { setError(e.message||"Failed. Check your Groq API key."); }
    finally { setLoading(false); }
  };

  const handleKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const resize = e => { e.target.style.height="44px"; e.target.style.height=Math.min(e.target.scrollHeight,140)+"px"; };

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"36px 28px", height:"calc(100vh - 62px)", display:"flex", flexDirection:"column" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:700, color:"var(--text)" }}>Dev <span style={{ color:"#a78bfa", textShadow:"0 0 25px rgba(167,139,250,0.5)" }}>AI</span></h1>
            <span className="tag-p" style={{ fontSize:"10px" }}>Groq Free</span>
            <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <div className="online-dot" style={{ background:"#22c55e", boxShadow:"0 0 6px #22c55e" }}/>
              <span style={{ fontSize:"11px", color:"#22c55e", fontFamily:"var(--mono)" }}>Online</span>
            </div>
          </div>
          <p style={{ fontSize:"13px", color:"var(--text2)" }}>Powered by Groq + Llama 3 · Completely free · Super fast</p>
        </div>
        <button onClick={()=>{ setMessages([{ id:Date.now(), role:"assistant", content:`Chat cleared! What are you working on, ${user?.firstName}? 🚀`, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]); }} className="btn-ico" title="Clear">
          <Trash2 size={15}/>
        </button>
      </motion.div>
      <div style={{ display:"grid", gridTemplateColumns:"210px 1fr", gap:"16px", flex:1, minHeight:0 }}>
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1 }} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div className="glass" style={{ padding:"16px" }}>
            <div className="section-label">Quick Prompts</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              {QUICK.map(q => (
                <button key={q} onClick={()=>send(q)} disabled={loading}
                  style={{ background:"rgba(0,255,135,0.04)", border:"1px solid rgba(0,255,135,0.1)", borderRadius:"8px", padding:"9px 12px", fontSize:"12px", color:"var(--text2)", cursor:"pointer", textAlign:"left", transition:"all .2s", fontFamily:"var(--font)", lineHeight:1.4 }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,0.3)";e.currentTarget.style.color="var(--green)";e.currentTarget.style.background="rgba(0,255,135,0.08)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,0.1)";e.currentTarget.style.color="var(--text2)";e.currentTarget.style.background="rgba(0,255,135,0.04)"}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="glass" style={{ padding:"14px", borderColor:"rgba(167,139,250,0.15)" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:"#a78bfa", marginBottom:"6px", letterSpacing:".5px" }}>✦ GROQ AI (Free)</p>
            <p style={{ fontSize:"11px", color:"var(--text3)", lineHeight:1.6, marginBottom:"8px" }}>Llama 3 · 14,400 req/day · Completely free</p>
            <p style={{ fontSize:"11px", color:"var(--text3)" }}>Stack: <span style={{ color:"#a78bfa", fontFamily:"var(--mono)" }}>{user?.skills?.slice(0,2).join(", ")||"React, Node.js"}</span></p>
            <div style={{ marginTop:"10px", padding:"8px", background:"rgba(167,139,250,0.08)", borderRadius:"8px", border:"1px solid rgba(167,139,250,0.15)" }}>
              <p style={{ fontSize:"10px", color:"#a78bfa", fontFamily:"var(--mono)", fontWeight:600 }}>Setup:</p>
              <p style={{ fontSize:"10px", color:"var(--text3)", marginTop:"3px" }}>1. Go to console.groq.com</p>
              <p style={{ fontSize:"10px", color:"var(--text3)" }}>2. Get free API key</p>
              <p style={{ fontSize:"10px", color:"var(--text3)" }}>3. Add to constants.js</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }} className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
          <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,#a78bfa,#7c3aed,transparent)", flexShrink:0 }}/>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={16} color="#a78bfa"/>
            </div>
            <div>
              <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>Dev AI</p>
              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}><div className="online-dot" style={{ width:"6px", height:"6px", boxShadow:"none", background:"#3fb950" }}/><span style={{ fontSize:"11px", color:"#3fb950" }}>Groq Llama 3 · Ready</span></div>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isMe = msg.role==="user";
                const parts = [];
                const re = /```(\w*)\n?([\s\S]*?)```/g;
                let last=0, m;
                while((m=re.exec(msg.content))!==null){
                  if(m.index>last) parts.push({type:"text",content:msg.content.slice(last,m.index)});
                  parts.push({type:"code",lang:m[1]||"code",content:m[2].trim()});
                  last=m.index+m[0].length;
                }
                if(last<msg.content.length) parts.push({type:"text",content:msg.content.slice(last)});
                return (
                  <motion.div key={msg.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", gap:"12px", flexDirection:isMe?"row-reverse":"row" }}>
                    {isMe
                      ? <img src={userPhoto} style={{ width:"32px", height:"32px", borderRadius:"9px", flexShrink:0, border:"1px solid rgba(0,255,135,0.2)", objectFit:"cover" }}/>
                      : <div style={{ width:"32px", height:"32px", borderRadius:"9px", background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Zap size={14} color="#a78bfa"/></div>}
                    <div style={{ maxWidth:"540px", display:"flex", flexDirection:"column", gap:"4px", alignItems:isMe?"flex-end":"flex-start" }}>
                      <span style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{isMe?(user?.firstName||"You"):"Dev AI"} · {msg.time}</span>
                      <div className={isMe?"chat-me":"chat-ai"} style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.7 }}>
                        {parts.map((p,i) => p.type==="code"
                          ? <div key={i} className="code-block"><div className="code-header"><span>{p.lang}</span><button onClick={()=>navigator.clipboard.writeText(p.content)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--green)",fontSize:"11px",fontFamily:"var(--mono)",display:"flex",alignItems:"center",gap:"4px" }}><Copy size={10}/>Copy</button></div><pre>{p.content}</pre></div>
                          : <span key={i} dangerouslySetInnerHTML={{ __html: fmt(p.content) }}/>)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:"flex", gap:"12px" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"9px", background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Zap size={14} color="#a78bfa"/></div>
                  <div className="chat-ai" style={{ display:"flex", gap:"5px", alignItems:"center" }}>
                    {[0,.2,.4].map((d,i)=><motion.div key={i} animate={{ y:[0,-5,0], opacity:[.4,1,.4] }} transition={{ duration:1, delay:d, repeat:Infinity }} style={{ width:"7px", height:"7px", borderRadius:"50%", background:"var(--green)" }}/>)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <div style={{ padding:"10px 14px", borderRadius:"10px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:"12px", color:"#f87171", fontFamily:"var(--mono)" }}>⚠ {error}</div>}
            <div ref={endRef}/>
          </div>
          <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(0,255,135,0.08)", flexShrink:0 }}>
            <div style={{ display:"flex", gap:"10px", alignItems:"flex-end" }}>
              <textarea ref={taRef} value={input} onChange={e=>{setInput(e.target.value);resize(e);}} onKeyDown={handleKey} placeholder="Ask about code, career, system design..." disabled={loading} rows={1} className="inp" style={{ flex:1, resize:"none", minHeight:"44px", maxHeight:"140px", paddingTop:"11px", paddingBottom:"11px", lineHeight:1.5, fontSize:"13px" }}/>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>send()} disabled={loading||!input.trim()} className="btn-prime" style={{ height:"44px", width:"44px", padding:0, borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:loading||!input.trim()?.5:1 }}>
                {loading?<div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>:<Send size={15}/>}
              </motion.button>
            </div>
            <p style={{ fontSize:"11px", color:"var(--text3)", textAlign:"center", marginTop:"8px", fontFamily:"var(--mono)" }}>Enter to send · Shift+Enter for newline · Groq Llama 3 (Free)</p>
          </div>
        </motion.div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
