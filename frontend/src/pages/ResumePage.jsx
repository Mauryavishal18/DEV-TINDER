import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Download, FileText, Zap } from "lucide-react";
import { getAvatarUrl, BASE_URL, GROQ_API_KEY, GROQ_URL, GROQ_MODEL } from "../utils/constants";

export default function ResumePage() {
  const user = useSelector(s=>s.user);
  const resumeRef = useRef(null);
  const [aiSummary, setAiSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const photo = user?.useAvatar===false&&user?.photoUrl ? (user.photoUrl.startsWith("http")?user.photoUrl:`${BASE_URL}${user.photoUrl}`) : getAvatarUrl(user?.avatarSeed||user?.firstName||"dev");

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const res = await fetch(GROQ_URL, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_API_KEY}` },
        body:JSON.stringify({
          model:GROQ_MODEL,
          messages:[{
            role:"user",
            content:`Write a professional 3-sentence resume summary for a developer named ${user?.firstName} ${user?.lastName||""} with skills: ${user?.skills?.join(", ")||"JavaScript, React, Node.js"}. ${user?.about?`Their bio: ${user.about}`:""} ${user?.githubStats?`GitHub: ${user.githubStats.publicRepos} repos, ${user.githubStats.totalStars} stars, top language: ${user.githubStats.topLanguage}.`:""} ${user?.leetcodeStats?`LeetCode: ${user.leetcodeStats.totalSolved} problems solved.`:""} Write ONLY the summary, no labels.`
          }],
          max_tokens:200, temperature:0.7,
        }),
      });
      const data = await res.json();
      setAiSummary(data.choices?.[0]?.message?.content || "");
    } catch(e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      // Use browser's print to PDF
      const content = resumeRef.current?.innerHTML || "";
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html><html><head>
        <title>${user?.firstName} ${user?.lastName||""} - Resume</title>
        <style>
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:'Arial',sans-serif; color:#111; background:#fff; padding:40px; max-width:800px; margin:0 auto; }
          h1 { font-size:28px; color:#111; margin-bottom:4px; }
          h2 { font-size:13px; color:#00a854; text-transform:uppercase; letter-spacing:2px; border-bottom:2px solid #00a854; padding-bottom:6px; margin:20px 0 10px; }
          h3 { font-size:15px; margin-bottom:3px; }
          p { font-size:13px; line-height:1.6; color:#333; }
          .header { display:flex; gap:20px; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:20px; }
          .header img { width:80px; height:80px; border-radius:50%; object-fit:cover; }
          .contact { font-size:12px; color:#555; margin-top:6px; }
          .skills-grid { display:flex; flex-wrap:wrap; gap:6px; }
          .skill { padding:3px 10px; border:1px solid #00a854; border-radius:20px; font-size:11px; color:#00a854; }
          .stats { display:flex; gap:20px; }
          .stat { text-align:center; }
          .stat-num { font-size:22px; font-weight:700; color:#00a854; }
          .stat-label { font-size:10px; color:#888; text-transform:uppercase; }
          .bar { height:6px; background:#e0e0e0; border-radius:3px; margin-top:4px; }
          .bar-fill { height:100%; background:#00a854; border-radius:3px; }
          @media print { body { padding:20px; } }
        </style></head><body>
        <div class="header">
          <img src="${photo}" crossorigin="anonymous"/>
          <div>
            <h1>${user?.firstName||""} ${user?.lastName||""}</h1>
            <p style="color:#555;font-size:14px;">${user?.role||"Full Stack Developer"}</p>
            <p class="contact">
              ${user?.emailId||""} ${user?.mobile?`• ${user.mobile}`:""}<br/>
              ${user?.github?`GitHub: ${user.github}`:""} ${user?.linkedin?`• LinkedIn: ${user.linkedin}`:""}
            </p>
          </div>
        </div>
        ${aiSummary?`<h2>Professional Summary</h2><p>${aiSummary}</p>`:""}
        ${user?.skills?.length>0?`<h2>Technical Skills</h2><div class="skills-grid">${user.skills.map(s=>`<span class="skill">${s}</span>`).join("")}</div>`:""}
        ${user?.githubStats?`
        <h2>GitHub Stats</h2>
        <div class="stats">
          <div class="stat"><div class="stat-num">${user.githubStats.publicRepos}</div><div class="stat-label">Repositories</div></div>
          <div class="stat"><div class="stat-num">${user.githubStats.totalStars}</div><div class="stat-label">Stars</div></div>
          <div class="stat"><div class="stat-num">${user.githubStats.followers}</div><div class="stat-label">Followers</div></div>
          <div class="stat"><div class="stat-num">${user.githubStats.topLanguage}</div><div class="stat-label">Top Language</div></div>
        </div>`:""}
        ${user?.leetcodeStats?`
        <h2>LeetCode Stats</h2>
        <div class="stats">
          <div class="stat"><div class="stat-num">${user.leetcodeStats.totalSolved}</div><div class="stat-label">Problems Solved</div></div>
          <div class="stat"><div class="stat-num">${user.leetcodeStats.easySolved}</div><div class="stat-label">Easy</div></div>
          <div class="stat"><div class="stat-num">${user.leetcodeStats.mediumSolved}</div><div class="stat-label">Medium</div></div>
          <div class="stat"><div class="stat-num">${user.leetcodeStats.hardSolved}</div><div class="stat-label">Hard</div></div>
        </div>`:""}
        ${user?.about?`<h2>About</h2><p>${user.about}</p>`:""}
        <p style="margin-top:30px;font-size:10px;color:#aaa;text-align:center;">Generated by DEV-TINDER</p>
        </body></html>
      `);
      printWindow.document.close();
      setTimeout(()=>{ printWindow.print(); setDownloading(false); }, 500);
    } catch(e) { console.error(e); setDownloading(false); }
  };

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px", marginBottom:"28px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
            Resume <span style={{ color:"var(--green)" }}>Builder</span>
          </h1>
          <p style={{ fontSize:"14px", color:"var(--text2)" }}>Auto-generated from your DevTinder profile — download as PDF</p>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={generateSummary} disabled={generating}
            className="btn-sec" style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"13px" }}>
            {generating ? <div style={{ width:"13px", height:"13px", border:"2px solid var(--green)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Zap size={13} color="var(--green)"/>}
            AI Summary
          </motion.button>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={downloadPDF} disabled={downloading}
            className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"13px" }}>
            {downloading ? <div style={{ width:"13px", height:"13px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Download size={13}/>}
            Download PDF
          </motion.button>
        </div>
      </motion.div>

      {/* Resume Preview */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} ref={resumeRef}
        style={{ background:"#fff", borderRadius:"16px", padding:"40px", boxShadow:"0 4px 40px rgba(0,0,0,.3)", color:"#111", fontFamily:"Arial,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", gap:"20px", alignItems:"flex-start", marginBottom:"24px", paddingBottom:"20px", borderBottom:"2px solid #00ff87" }}>
          <img src={photo} style={{ width:"80px", height:"80px", borderRadius:"50%", objectFit:"cover", border:"3px solid #00a854" }}/>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:"28px", fontWeight:800, color:"#111", marginBottom:"4px" }}>{user?.firstName||""} {user?.lastName||""}</h1>
            <p style={{ fontSize:"14px", color:"#00a854", fontWeight:600, marginBottom:"6px" }}>{user?.role||"Full Stack Developer"}{user?.age?` · ${user.age} years old`:""}</p>
            <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", fontSize:"12px", color:"#555" }}>
              {user?.emailId && <span>✉ {user.emailId}</span>}
              {user?.mobile && <span>📱 {user.mobile}</span>}
              {user?.github && <span>🔗 {user.github}</span>}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"24px", fontWeight:800, color:"#00a854" }}>{user?.devScore||0}</div>
            <div style={{ fontSize:"10px", color:"#888", textTransform:"uppercase", letterSpacing:"1px" }}>Dev Score</div>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div style={{ marginBottom:"20px" }}>
            <h2 style={{ fontSize:"13px", color:"#00a854", textTransform:"uppercase", letterSpacing:"2px", borderBottom:"2px solid #00a854", paddingBottom:"5px", marginBottom:"10px" }}>Professional Summary</h2>
            <p style={{ fontSize:"13px", lineHeight:1.7, color:"#333" }}>{aiSummary}</p>
          </div>
        )}

        {/* About */}
        {user?.about && (
          <div style={{ marginBottom:"20px" }}>
            <h2 style={{ fontSize:"13px", color:"#00a854", textTransform:"uppercase", letterSpacing:"2px", borderBottom:"2px solid #00a854", paddingBottom:"5px", marginBottom:"10px" }}>About</h2>
            <p style={{ fontSize:"13px", lineHeight:1.7, color:"#333" }}>{user.about}</p>
          </div>
        )}

        {/* Skills */}
        {user?.skills?.length > 0 && (
          <div style={{ marginBottom:"20px" }}>
            <h2 style={{ fontSize:"13px", color:"#00a854", textTransform:"uppercase", letterSpacing:"2px", borderBottom:"2px solid #00a854", paddingBottom:"5px", marginBottom:"10px" }}>Technical Skills</h2>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {user.skills.map(s=>(
                <span key={s} style={{ padding:"4px 12px", border:"1px solid #00a854", borderRadius:"20px", fontSize:"11px", color:"#00a854", fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Stats */}
        {user?.githubStats && (
          <div style={{ marginBottom:"20px" }}>
            <h2 style={{ fontSize:"13px", color:"#00a854", textTransform:"uppercase", letterSpacing:"2px", borderBottom:"2px solid #00a854", paddingBottom:"5px", marginBottom:"10px" }}>GitHub Statistics</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
              {[{l:"Repositories",v:user.githubStats.publicRepos},{l:"Stars",v:user.githubStats.totalStars},{l:"Followers",v:user.githubStats.followers},{l:"Top Language",v:user.githubStats.topLanguage}].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"12px", background:"#f0fff4", borderRadius:"8px" }}>
                  <div style={{ fontSize:"22px", fontWeight:800, color:"#00a854" }}>{s.v}</div>
                  <div style={{ fontSize:"10px", color:"#888", textTransform:"uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LeetCode Stats */}
        {user?.leetcodeStats && (
          <div style={{ marginBottom:"20px" }}>
            <h2 style={{ fontSize:"13px", color:"#00a854", textTransform:"uppercase", letterSpacing:"2px", borderBottom:"2px solid #00a854", paddingBottom:"5px", marginBottom:"10px" }}>LeetCode Statistics</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
              {[{l:"Total Solved",v:user.leetcodeStats.totalSolved,c:"#00a854"},{l:"Easy",v:user.leetcodeStats.easySolved,c:"#22c55e"},{l:"Medium",v:user.leetcodeStats.mediumSolved,c:"#f59e0b"},{l:"Hard",v:user.leetcodeStats.hardSolved,c:"#ef4444"}].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"12px", background:"#fff7ed", borderRadius:"8px" }}>
                  <div style={{ fontSize:"22px", fontWeight:800, color:s.c }}>{s.v}</div>
                  <div style={{ fontSize:"10px", color:"#888", textTransform:"uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize:"12px", color:"#666", marginTop:"8px" }}>Rank: #{user.leetcodeStats.ranking?.toLocaleString()} · Acceptance: {user.leetcodeStats.acceptanceRate?.toFixed(1)}%</p>
          </div>
        )}

        <p style={{ fontSize:"10px", color:"#aaa", textAlign:"center", marginTop:"20px", paddingTop:"20px", borderTop:"1px solid #eee" }}>
          Generated by DEV-TINDER
        </p>
      </motion.div>

      {!user?.githubStats && !user?.leetcodeStats && (
        <div className="glass" style={{ padding:"20px", marginTop:"16px" }}>
          <p style={{ fontSize:"13px", color:"var(--text3)", textAlign:"center" }}>
            💡 Connect GitHub and LeetCode profiles to make your resume more impressive!
          </p>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
