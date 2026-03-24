import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Github, Users, Star, Award, X, UserCircle } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL} from "../utils/constants";
import { useToast } from "../components/ToastProvider";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endorseTarget, setEndorseTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [endorseText, setEndorseText] = useState("");
  const [endorseRating, setEndorseRating] = useState(5);
  const [endorseLoading, setEndorseLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const submitReport = async (action) => {
    if (action === "block") {
      try {
        await axios.post(`/user/block/${reportTarget._id}`);
        setConnections(p => p.filter(c => c._id !== reportTarget._id));
        setBlockedIds(p => new Set([...p, reportTarget._id]));
        toast(`${reportTarget.firstName} blocked.`, "info");
        setReportTarget(null);
      } catch(e) { toast(e.response?.data?.message || "Failed", "error"); }
    } else {
      if (!reportReason.trim()) { toast("Please select a reason", "error"); return; }
      setReportLoading(true);
      try {
        await axios.post(`/user/report/${reportTarget._id}`, { reason: reportReason });
        toast("Report submitted. Thank you!", "success");
        setReportTarget(null); setReportReason("");
      } catch(e) { toast(e.response?.data?.message || "Failed", "error"); }
      finally { setReportLoading(false); }
    }
  };

  const submitEndorse = async () => {
    if (!endorseText.trim()) { toast("Write something about them!", "error"); return; }
    setEndorseLoading(true);
    try {
      await axios.post(`/profile/endorse/${endorseTarget._id}`, { text: endorseText, rating: endorseRating });
      toast(`Endorsed ${endorseTarget.firstName}! ⭐`, "success");
      setEndorseTarget(null); setEndorseText(""); setEndorseRating(5);
    } catch(e) { toast(e.response?.data?.message || "Failed", "error"); }
    finally { setEndorseLoading(false); }
  };
  useEffect(() => {
    axios.get("/user/connections").then(r=>setConnections(r.data.data||[])).catch(console.error).finally(()=>setLoading(false));
  }, []);
  return (
    <>
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>Your <span style={{ color:"var(--green)", textShadow:"0 0 20px rgba(0,255,135,0.4)" }}>Connections</span></h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Developers you have matched with</p>
      </motion.div>
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,0.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : connections.length===0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass" style={{ textAlign:"center", padding:"64px 40px" }}>
          <Users size={48} style={{ color:"var(--text3)", margin:"0 auto 16px" }}/>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>No Connections Yet</h3>
          <p style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px", lineHeight:1.6 }}>Start exploring developers and make your first match!</p>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>navigate("/")} className="btn-prime" style={{ padding:"10px 24px" }}>Explore Developers →</motion.button>
        </motion.div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {connections.map((c,i) => {
            const photo = c.useAvatar===false && c.photoUrl ? `${BASE_URL}${c.photoUrl}` : getAvatarUrl(c.avatarSeed||c.firstName||"dev");
            return (
              <motion.div key={c._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}
                className="glass" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={photo} style={{ width:"56px", height:"56px", borderRadius:"14px", border:"1px solid rgba(0,255,135,0.2)", objectFit:"cover" }}/>
                  <div className="online-dot" style={{ position:"absolute", bottom:"-2px", right:"-2px", border:"2px solid var(--bg)" }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{c.firstName} {c.lastName}</h3>
                  {c.about && <p style={{ fontSize:"13px", color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"6px" }}>{c.about}</p>}
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {c.skills?.slice(0,3).map(s=><span key={s} className="tag-g" style={{ fontSize:"10px", padding:"2px 8px" }}>{s}</span>)}
                    {c.githubStats && <span style={{ fontSize:"11px", color:"#f59e0b", fontFamily:"var(--mono)" }}><Star size={9} style={{ display:"inline" }}/> {c.githubStats.totalStars}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>navigate(`/user/${c._id}`)} className="btn-sec" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", fontSize:"12px" }} title="View profile"><UserCircle size={13}/> Profile</motion.button>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>navigate(`/chat/${c._id}`)} className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", fontSize:"12px" }}><MessageSquare size={13}/> Chat</motion.button>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>setEndorseTarget(c)} className="btn-sec" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", fontSize:"12px" }} title="Endorse this developer"><Award size={13}/> Endorse</motion.button>
                  {c.github && <a href={c.github} target="_blank" rel="noreferrer"><button className="btn-ico"><Github size={14}/></button></a>}
                  <button onClick={()=>setReportTarget(c)} className="btn-ico" title="Block or Report" style={{ width:"34px", height:"34px", color:"#f87171" }}>
                    <span style={{ fontSize:"16px", lineHeight:1 }}>⋮</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>

      {/* Block / Report Modal */}
      <AnimatePresence>
        {reportTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e=>e.target===e.currentTarget&&setReportTarget(null)}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20 }}
              style={{ background:"rgba(7,21,16,0.98)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <h3 style={{ fontSize:"17px", fontWeight:700, color:"var(--text)" }}>Block or Report</h3>
                <button onClick={()=>setReportTarget(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><X size={18}/></button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px", padding:"12px", background:"rgba(239,68,68,0.06)", borderRadius:"10px", border:"1px solid rgba(239,68,68,0.15)" }}>
                <p style={{ fontSize:"13px", color:"var(--text2)" }}>Action against <strong style={{ color:"var(--text)" }}>{reportTarget.firstName}</strong></p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
                <p style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", marginBottom:"4px" }}>Report Reason</p>
                {["Spam or fake profile","Harassment or abuse","Inappropriate content","Scam or fraud","Other"].map(r => (
                  <button key={r} type="button" onClick={()=>setReportReason(r)}
                    style={{ padding:"10px 14px", borderRadius:"8px", background:reportReason===r?"rgba(239,68,68,0.12)":"rgba(255,255,255,0.03)", border:`1px solid ${reportReason===r?"rgba(239,68,68,0.4)":"var(--border)"}`, color:reportReason===r?"#f87171":"var(--text2)", fontSize:"13px", cursor:"pointer", textAlign:"left", fontFamily:"var(--font)" }}>
                    {r}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={()=>submitReport("report")} disabled={reportLoading || !reportReason}
                  style={{ flex:1, padding:"11px", borderRadius:"10px", background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)", color:"#fb923c", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", opacity:!reportReason?0.5:1 }}>
                  {reportLoading ? "Reporting..." : "Report"}
                </motion.button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={()=>submitReport("block")}
                  style={{ flex:1, padding:"11px", borderRadius:"10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"var(--font)" }}>
                  Block User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Endorsement Modal */}
      <AnimatePresence>
        {endorseTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e=>e.target===e.currentTarget&&setEndorseTarget(null)}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20 }}
              style={{ background:"rgba(7,21,16,0.98)", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"420px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)" }}>Endorse {endorseTarget.firstName}</h3>
                <button onClick={()=>setEndorseTarget(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><X size={18}/></button>
              </div>
              <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"16px" }}>Write a genuine endorsement — this will appear on their profile.</p>
              <div style={{ marginBottom:"16px" }}>
                <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Rating</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {[1,2,3,4,5].map(r => (
                    <svg key={r} width="32" height="32" viewBox="0 0 24 24"
                      onClick={() => setEndorseRating(r)}
                      style={{ cursor:"pointer", transition:"all 0.15s", transform: r<=endorseRating ? "scale(1.15)" : "scale(1)" }}
                      fill={r<=endorseRating ? "#f59e0b" : "none"}
                      stroke={r<=endorseRating ? "#f59e0b" : "#4a6a54"}
                      strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:"20px" }}>
                <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Your Endorsement</label>
                <textarea value={endorseText} onChange={e=>setEndorseText(e.target.value)}
                  placeholder={`What makes ${endorseTarget.firstName} a great developer?`}
                  className="inp" rows={4} style={{ resize:"none", fontSize:"13px", lineHeight:1.6 }}/>
                <p style={{ fontSize:"10px", color:"var(--text3)", marginTop:"4px", fontFamily:"var(--mono)" }}>{endorseText.length}/200</p>
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={submitEndorse} disabled={endorseLoading || !endorseText.trim()}
                className="btn-prime" style={{ width:"100%", padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:!endorseText.trim()?0.5:1 }}>
                {endorseLoading ? <div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Award size={15}/>}
                {endorseLoading ? "Submitting..." : "Submit Endorsement ⭐"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
