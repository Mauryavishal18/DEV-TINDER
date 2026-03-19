import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Code, Paperclip, MessageSquare, Edit3 } from "lucide-react";
import axios from "axios";
import { getAvatarUrl } from "../utils/constants";

export default function ChatPage() {
  const { userId } = useParams();
  const user = useSelector(s => s.user);
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const DEMO = [
    { id:1, text:"Hey! Can you review my pull request?", sent:false, time:"10:30 AM" },
    { id:2, text:"Sure! Which file is it in?", sent:true, time:"10:31 AM" },
    { id:3, text:"It is in `pkg/controller/scaler.go` — check the middleware logic.", sent:false, time:"10:32 AM" },
  ];

  useEffect(() => {
    axios.get("/user/connections").then(r => {
      const data = r.data.data||[];
      setConnections(data);
      if (userId) setActive(data.find(c=>c._id===userId)||data[0]);
      else if (data.length>0) setActive(data[0]);
    }).catch(console.error).finally(()=>setLoading(false));
  }, [userId]);

  useEffect(() => { if (active) setMessages(DEMO); }, [active]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(p=>[...p,{ id:Date.now(), text:input, sent:true, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]);
    setInput("");
  };

  const getPhoto = (u) => u?.useAvatar===false&&u?.photoUrl ? `http://localhost:3000${u.photoUrl}` : getAvatarUrl(u?.avatarSeed||u?.firstName||"dev");

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 28px", height:"calc(100vh - 62px)", display:"flex", flexDirection:"column" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"20px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}><span style={{ color:"var(--green)" }}>Messages</span></h1>
        <p style={{ fontSize:"13px", color:"var(--text2)" }}>Real-time chat with your connections</p>
      </motion.div>
      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr 200px", gap:"14px", flex:1, minHeight:0 }}>
        <div className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
            <span style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px" }}>Connections</span>
            <Edit3 size={12} color="var(--text3)" style={{ cursor:"pointer" }}/>
          </div>
          <div style={{ flex:1, overflowY:"auto" }}>
            {loading ? (
              <div style={{ display:"flex", justifyContent:"center", padding:"30px" }}>
                <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"24px", height:"24px", border:"2px solid rgba(0,255,135,0.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
              </div>
            ) : connections.length===0 ? (
              <div style={{ padding:"20px", textAlign:"center" }}>
                <MessageSquare size={28} style={{ color:"var(--text3)", margin:"0 auto 10px" }}/>
                <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>No connections yet</p>
              </div>
            ) : connections.map(c => (
              <div key={c._id} onClick={()=>{setActive(c);navigate(`/chat/${c._id}`);}}
                style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", display:"flex", gap:"10px", alignItems:"center", background:active?._id===c._id?"rgba(0,255,135,0.06)":"transparent", borderLeft:active?._id===c._id?"2px solid var(--green)":"2px solid transparent", transition:"all .2s" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={getPhoto(c)} style={{ width:"36px", height:"36px", borderRadius:"10px", objectFit:"cover" }}/>
                  <div className="online-dot" style={{ position:"absolute", bottom:"-1px", right:"-1px", width:"7px", height:"7px", border:"1px solid var(--bg)" }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.firstName}</p>
                    <span style={{ fontSize:"9px", color:"var(--green)", fontFamily:"var(--mono)" }}>ONLINE</span>
                  </div>
                  <p style={{ fontSize:"11px", color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:"2px" }}>Hey, review my pull request?</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {active ? (
            <>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
                <div style={{ position:"relative" }}>
                  <img src={getPhoto(active)} style={{ width:"36px", height:"36px", borderRadius:"10px", border:"1px solid rgba(0,255,135,0.2)", objectFit:"cover" }}/>
                  <div className="online-dot" style={{ position:"absolute", bottom:"-1px", right:"-1px", width:"7px", height:"7px", border:"1px solid var(--bg)" }}/>
                </div>
                <div>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>{active.firstName} {active.lastName}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>● Online</span>
                    {active.skills?.slice(0,2).map(s=><span key={s} className="tag-g" style={{ fontSize:"9px", padding:"1px 6px" }}>{s}</span>)}
                  </div>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"14px" }}>
                <AnimatePresence initial={false}>
                  {messages.map(m => (
                    <motion.div key={m.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", gap:"10px", flexDirection:m.sent?"row-reverse":"row", alignItems:"flex-end" }}>
                      <img src={m.sent?getPhoto(user):getPhoto(active)} style={{ width:"26px", height:"26px", borderRadius:"50%", flexShrink:0, objectFit:"cover" }}/>
                      <div style={{ maxWidth:"340px", display:"flex", flexDirection:"column", gap:"3px", alignItems:m.sent?"flex-end":"flex-start" }}>
                        <div className={m.sent?"chat-me":"chat-ai"} style={{ fontSize:"13px", color:"var(--text)", lineHeight:1.6 }}>
                          {m.text.includes("`") ? <span dangerouslySetInnerHTML={{ __html:m.text.replace(/`([^`]+)`/g,"<code style='background:rgba(0,255,135,0.08);color:var(--green);padding:1px 5px;border-radius:4px;font-family:var(--mono);font-size:11px'>$1</code>") }}/> : m.text}
                        </div>
                        <span style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{m.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={endRef}/>
              </div>
              <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(0,255,135,0.08)", display:"flex", gap:"8px", alignItems:"flex-end", flexShrink:0 }}>
                <button className="btn-ico" style={{ width:"36px", height:"36px" }}><Paperclip size={14}/></button>
                <button className="btn-ico" style={{ width:"36px", height:"36px" }}><Code size={14}/></button>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message..." className="inp" style={{ flex:1, padding:"9px 14px", fontSize:"13px" }}/>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={sendMsg} className="btn-prime" style={{ height:"36px", width:"36px", padding:0, borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Send size={14}/>
                </motion.button>
              </div>
            </>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px" }}>
              <MessageSquare size={40} style={{ color:"var(--text3)" }}/>
              <p style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Select a connection to chat</p>
            </div>
          )}
        </div>
        <div className="glass" style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {active ? (
            <>
              <div style={{ padding:"14px", borderBottom:"1px solid rgba(0,255,135,0.08)", flexShrink:0 }}>
                <p style={{ fontSize:"10px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px" }}>Collaborator</p>
              </div>
              <div style={{ padding:"16px", textAlign:"center" }}>
                <img src={getPhoto(active)} style={{ width:"60px", height:"60px", borderRadius:"16px", border:"2px solid rgba(0,255,135,0.25)", margin:"0 auto 12px", display:"block", objectFit:"cover" }}/>
                <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{active.firstName}</p>
                <span className="tag-g" style={{ fontSize:"10px", padding:"2px 8px" }}>Active</span>
                {active.about && <p style={{ fontSize:"11px", color:"var(--text2)", marginTop:"10px", lineHeight:1.5 }}>{active.about}</p>}
                {active.githubStats && <p style={{ fontSize:"11px", color:"#f59e0b", marginTop:"8px", fontFamily:"var(--mono)" }}>⭐ {active.githubStats.totalStars} stars</p>}
                {active.leetcodeStats && <p style={{ fontSize:"11px", color:"#fb923c", marginTop:"4px", fontFamily:"var(--mono)" }}>LC: {active.leetcodeStats.totalSolved} solved</p>}
              </div>
              {active.skills?.length>0 && (
                <div style={{ padding:"0 14px 14px" }}>
                  <p style={{ fontSize:"10px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"8px", fontFamily:"var(--mono)" }}>Skills</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                    {active.skills.slice(0,5).map(s=><span key={s} className="tag-g" style={{ fontSize:"9px", padding:"2px 6px" }}>{s}</span>)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textAlign:"center", padding:"16px" }}>Select a chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
