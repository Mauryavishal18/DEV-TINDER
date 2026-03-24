import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Send, Copy, CheckCheck, Zap, Terminal, Trash2 } from "lucide-react";
import { GROQ_API_KEY, GROQ_URL, GROQ_MODEL } from "../utils/constants";

const LANGS = ["javascript","typescript","python","java","go","rust","cpp","sql","bash","jsx","tsx"];

const fmtText = t => t
  .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => `<div class="code-block"><div class="code-header"><span>${l||"code"}</span></div><pre>${c.trim()}</pre></div>`)
  .replace(/\*\*(.*?)\*\*/g, "<strong style='color:var(--text)'>$1</strong>")
  .replace(/`([^`]+)`/g, "<code style='background:rgba(0,255,135,.08);color:var(--green);padding:1px 5px;border-radius:4px;font-family:var(--mono);font-size:11px'>$1</code>")
  .replace(/^### (.*)/gm, "<p style='font-size:14px;font-weight:600;color:var(--text);margin:10px 0 5px'>$1</p>")
  .replace(/^## (.*)/gm, "<p style='font-size:16px;font-weight:700;color:var(--text);margin:12px 0 6px'>$1</p>")
  .replace(/^\* (.*)/gm, "<div style='display:flex;gap:8px;margin:3px 0'><span style='color:var(--green)'>▸</span><span>$1</span></div>")
  .replace(/^- (.*)/gm, "<div style='display:flex;gap:8px;margin:3px 0'><span style='color:var(--green)'>▸</span><span>$1</span></div>")
  .replace(/\n/g, "<br/>");

export default function AICodeReviewPage() {
  const user = useSelector(s=>s.user);
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("javascript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("review"); // review | explain | optimize | bugs

  const MODES = [
    { id:"review", label:"Full Review", desc:"Bugs, improvements, best practices" },
    { id:"bugs", label:"Find Bugs", desc:"Only find bugs & security issues" },
    { id:"optimize", label:"Optimize", desc:"Performance & efficiency improvements" },
    { id:"explain", label:"Explain Code", desc:"Line-by-line explanation" },
  ];

  const PROMPTS = {
    review: `You are an expert code reviewer. Review this ${lang} code and provide:
1. **Overall Assessment** (1-2 sentences)
2. **Bugs & Issues** (list specific bugs with line references)
3. **Security Issues** (any security vulnerabilities)
4. **Performance** (optimization opportunities)
5. **Best Practices** (coding standards improvements)
6. **Improved Version** (rewrite key parts with fixes)

Be specific, practical, and developer-focused. Use markdown.`,
    bugs: `Find ALL bugs, errors, and security vulnerabilities in this ${lang} code. For each:
- Line reference
- What the bug is
- Why it's a problem
- How to fix it
Also provide a fixed version of the code.`,
    optimize: `Optimize this ${lang} code for maximum performance. Provide:
1. **Performance Issues Found**
2. **Time Complexity Analysis** 
3. **Optimized Version** with comments explaining improvements
4. **Benchmark difference** (estimated improvement)`,
    explain: `Explain this ${lang} code in detail:
1. **What it does** (simple explanation)
2. **How it works** (step by step, reference line numbers)
3. **Key concepts used**
4. **Potential use cases`
  };

  const review_ = async () => {
    if (!code.trim()) { setError("Paste your code first"); return; }
    setLoading(true); setReview(""); setError("");
    try {
      const res = await fetch(GROQ_URL, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_API_KEY}` },
        body:JSON.stringify({
          model:GROQ_MODEL,
          messages:[
            { role:"system", content:PROMPTS[mode] },
            { role:"user", content:`Here is my ${lang} code:\n\n\`\`\`${lang}\n${code}\n\`\`\`` }
          ],
          max_tokens:2000, temperature:0.3,
        }),
      });
      if (!res.ok) { const e=await res.json(); throw new Error(e.error?.message||`Error ${res.status}`); }
      const data = await res.json();
      setReview(data.choices?.[0]?.message?.content || "No review generated");
    } catch(e) { setError(e.message||"Review failed. Check your Groq API key."); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"24px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px", display:"flex", alignItems:"center", gap:"12px" }}>
          <Code size={26} color="var(--green)"/> AI Code <span style={{ color:"var(--green)" }}>Review</span>
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Powered by Groq Llama 3 — paste code, get instant expert review</p>
      </motion.div>

      {/* Mode selector */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"18px", flexWrap:"wrap" }}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            className={mode===m.id?"btn-prime":"btn-sec"}
            style={{ padding:"8px 16px", fontSize:"12px", display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
            <span style={{ fontWeight:700 }}>{m.label}</span>
            <span style={{ fontSize:"10px", opacity:.7 }}>{m.desc}</span>
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", minHeight:"500px" }}>
        {/* Code input */}
        <div className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,var(--green),transparent)" }}/>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(0,255,135,.08)", display:"flex", alignItems:"center", gap:"10px" }}>
            <Terminal size={14} color="var(--green)"/>
            <span style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", flex:1 }}>Your Code</span>
            <select value={lang} onChange={e=>setLang(e.target.value)}
              style={{ background:"rgba(0,255,135,.06)", border:"1px solid rgba(0,255,135,.2)", borderRadius:"6px", padding:"4px 8px", fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)", cursor:"pointer", outline:"none" }}>
              {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={copy} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)", display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", fontFamily:"var(--mono)" }}>
              {copied?<CheckCheck size={12}/>:<Copy size={12}/>}{copied?"Copied":"Copy"}
            </button>
            <button onClick={()=>setCode("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><Trash2 size={12}/></button>
          </div>
          <textarea
            value={code} onChange={e=>setCode(e.target.value)}
            placeholder={`// Paste your ${lang} code here...\n// Example:\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}`}
            style={{ flex:1, resize:"none", background:"#020905", border:"none", outline:"none", padding:"16px", fontFamily:"var(--mono)", fontSize:"12px", color:"#00ff87", lineHeight:1.75, minHeight:"400px" }}
          />
          <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(0,255,135,.08)" }}>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
              onClick={review_} disabled={loading||!code.trim()}
              className="btn-prime" style={{ width:"100%", padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:!code.trim()?0.5:1 }}>
              {loading ? <div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Zap size={14} fill="#040d08"/>}
              {loading ? "Reviewing..." : `${MODES.find(m=>m.id===mode)?.label} →`}
            </motion.button>
          </div>
        </div>

        {/* Review output */}
        <div className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:"2px", background:"linear-gradient(90deg,transparent,#a78bfa,transparent)" }}/>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(0,255,135,.08)", display:"flex", alignItems:"center", gap:"10px" }}>
            <Zap size={14} color="#a78bfa"/>
            <span style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", flex:1 }}>AI Review</span>
            <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <div className="online-dot" style={{ background:"#22c55e", boxShadow:"0 0 6px #22c55e", width:"6px", height:"6px" }}/>
              <span style={{ fontSize:"10px", color:"#22c55e", fontFamily:"var(--mono)" }}>Groq Llama 3</span>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"20px 0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"16px", height:"16px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
                  <span style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Analyzing code...</span>
                </div>
                {["Checking syntax and logic...","Scanning for security issues...","Generating improvements..."].map((t,i)=>(
                  <motion.p key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.8+.5 }} style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>• {t}</motion.p>
                ))}
              </div>
            ) : error ? (
              <div style={{ padding:"14px", borderRadius:"10px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", fontSize:"12px", color:"#f87171" }}>⚠ {error}</div>
            ) : review ? (
              <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.8 }} dangerouslySetInnerHTML={{ __html:fmtText(review) }}/>
            ) : (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <Code size={40} style={{ color:"var(--text3)", margin:"0 auto 14px" }}/>
                <p style={{ fontSize:"13px", color:"var(--text3)", lineHeight:1.7 }}>Paste your code on the left and click the review button.<br/>Get instant expert-level code review powered by AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick review buttons */}
      <div style={{ marginTop:"16px" }}>
        <p style={{ fontSize:"11px", color:"var(--text3)", marginBottom:"10px", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px" }}>Quick review examples:</p>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {[
            { label:"Review bubble sort", code:"function bubbleSort(arr) {\n  for(let i=0;i<arr.length;i++){\n    for(let j=0;j<arr.length-i-1;j++){\n      if(arr[j]>arr[j+1]) {\n        let t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t;\n      }\n    }\n  }\n  return arr;\n}", lang:"javascript" },
            { label:"Review SQL query", code:"SELECT * FROM users WHERE id = " + "'" + "user_input" + "'", lang:"sql" },
            { label:"Review async code", code:"async function fetchData() {\n  const res = await fetch('/api/data');\n  const data = res.json();\n  return data;\n}", lang:"javascript" },
          ].map(ex=>(
            <button key={ex.label} onClick={()=>{ setCode(ex.code); setLang(ex.lang); }}
              style={{ padding:"7px 14px", fontSize:"11px", background:"rgba(0,255,135,.04)", border:"1px solid rgba(0,255,135,.12)", borderRadius:"8px", color:"var(--text2)", cursor:"pointer", fontFamily:"var(--font)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,.35)";e.currentTarget.style.color="var(--green)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,.12)";e.currentTarget.style.color="var(--text2)"}}>
              {ex.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
