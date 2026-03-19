import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Inbox } from "lucide-react";
import axios from "axios";
import { useToast } from "../components/ToastProvider";
import { getAvatarUrl } from "../utils/constants";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  useEffect(() => {
    axios.get("/user/requests/received").then(r=>setRequests(r.data.data||[])).catch(console.error).finally(()=>setLoading(false));
  }, []);
  const review = async (id, status) => {
    try {
      await axios.post(`/request/review/${status}/${id}`);
      setRequests(p=>p.filter(r=>r._id!==id));
      toast(status==="accepted"?"🎉 Connection accepted!":"Request declined", status==="accepted"?"success":"info");
    } catch(e) { toast("Something went wrong","error"); }
  };
  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>Connection <span style={{ color:"var(--green)" }}>Requests</span></h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Developers who want to collaborate with you</p>
      </motion.div>
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,0.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : requests.length===0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass" style={{ textAlign:"center", padding:"64px 40px" }}>
          <Inbox size={48} style={{ color:"var(--text3)", margin:"0 auto 16px" }}/>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>No Pending Requests</h3>
          <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>When developers are interested in you, they will appear here.</p>
        </motion.div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <p style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"4px" }}>{requests.length} pending request{requests.length>1?"s":""}</p>
          <AnimatePresence>
            {requests.map((req,i) => {
              const s = req.fromUserId;
              const photo = s?.useAvatar===false&&s?.photoUrl ? `http://localhost:3000${s.photoUrl}` : getAvatarUrl(s?.avatarSeed||s?.firstName||"dev");
              return (
                <motion.div key={req._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-100 }} transition={{ delay:i*.06 }}
                  className="glass" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:"16px" }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <img src={photo} style={{ width:"52px", height:"52px", borderRadius:"14px", border:"1px solid rgba(0,255,135,0.2)", objectFit:"cover" }}/>
                    <div style={{ position:"absolute", top:"-3px", right:"-3px", width:"12px", height:"12px", borderRadius:"50%", background:"linear-gradient(135deg, var(--green3), var(--green))", border:"2px solid var(--bg)", boxShadow:"0 0 6px rgba(0,255,135,0.5)" }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{s?.firstName} {s?.lastName}</h3>
                    {s?.about && <p style={{ fontSize:"13px", color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"6px" }}>{s.about}</p>}
                    <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                      {s?.skills?.slice(0,3).map(sk=><span key={sk} className="tag-g" style={{ fontSize:"10px", padding:"1px 7px" }}>{sk}</span>)}
                    </div>
                    <p style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)", marginTop:"6px" }}>{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>review(req._id,"rejected")} style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={15} color="#f87171"/></motion.button>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={()=>review(req._id,"accepted")} style={{ width:"38px", height:"38px", borderRadius:"10px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.25)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Check size={15} color="var(--green)"/></motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
