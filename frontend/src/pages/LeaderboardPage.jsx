import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Trophy, Star, Github, Code, RefreshCw, Zap } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL } from "../utils/constants";
import { useToast } from "../components/ToastProvider";

const medals = ["🥇","🥈","🥉"];

export default function LeaderboardPage() {
  const user = useSelector(s=>s.user);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalc, setRecalc] = useState(false);
  const [myRank, setMyRank] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get("/leaderboard").then(r=>{
      const data = r.data.data||[];
      setUsers(data);
      const idx = data.findIndex(u=>u._id===user?._id);
      setMyRank(idx>=0 ? idx+1 : null);
    }).catch(console.error).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); }, []);

  const recalcScore = async () => {
    setRecalc(true);
    try {
      const r = await axios.post("/dev-score/recalculate");
      toast(`Your score: ${r.data.devScore} pts 🔥`, "success");
      load();
    } catch(e) { toast("Failed to recalculate", "error"); }
    finally { setRecalc(false); }
  };

  const getPhoto = (u) => u?.useAvatar===false&&u?.photoUrl ? (u.photoUrl.startsWith("http")?u.photoUrl:`${BASE_URL}${u.photoUrl}`) : getAvatarUrl(u?.avatarSeed||u?.firstName||"dev");

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px", display:"flex", alignItems:"center", gap:"12px" }}>
              <Trophy size={26} color="#f59e0b" /> Dev <span style={{ color:"var(--green)" }}>Leaderboard</span>
            </h1>
            <p style={{ fontSize:"14px", color:"var(--text2)" }}>Rankings based on GitHub, LeetCode, skills & profile completeness</p>
          </div>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            {myRank && <span className="tag-g" style={{ fontSize:"13px" }}>Your rank: #{myRank}</span>}
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={recalcScore} disabled={recalc}
              className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"13px" }}>
              {recalc ? <div style={{ width:"13px", height:"13px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <RefreshCw size={13}/>}
              Recalculate My Score
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Top 3 podium */}
      {!loading && users.length >= 3 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"24px" }}>
          {[users[1], users[0], users[2]].map((u,i)=>{
            const pos = i===0?2 : i===1?1 : 3;
            const heights = [120,160,100];
            return (
              <div key={u._id} className="glass" style={{ padding:"20px", textAlign:"center", position:"relative", borderColor: pos===1?"rgba(245,158,11,0.4)":"var(--border)", paddingTop:`${heights[i]-60}px` }}>
                {pos===1 && <div style={{ position:"absolute", top:"-14px", left:"50%", transform:"translateX(-50%)", fontSize:"28px" }}>👑</div>}
                <img src={getPhoto(u)} style={{ width:"56px", height:"56px", borderRadius:"50%", border:`2px solid ${pos===1?"#f59e0b":pos===2?"#94a3b8":"#cd7f32"}`, objectFit:"cover", margin:"0 auto 10px" }}/>
                <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{u.firstName} {u.lastName||""}</p>
                <div style={{ fontSize:"24px", fontWeight:900, color:pos===1?"#f59e0b":pos===2?"#94a3b8":"#cd7f32", fontFamily:"var(--mono)" }}>{u.devScore}</div>
                <p style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px" }}>pts · #{pos}</p>
                {u.skills?.slice(0,2).map(s=><span key={s} className="tag-g" style={{ fontSize:"9px", margin:"2px" }}>{s}</span>)}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Full list */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {users.map((u,i)=>{
            const isMe = u._id === user?._id;
            return (
              <motion.div key={u._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.03 }}
                className="glass" style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:"14px", borderColor:isMe?"rgba(0,255,135,.35)":"var(--border)", background:isMe?"rgba(0,255,135,.04)":"var(--card)" }}>
                <div style={{ width:"36px", textAlign:"center", fontFamily:"var(--mono)", fontWeight:700, fontSize:"14px", color:i<3?"#f59e0b":"var(--text3)", flexShrink:0 }}>
                  {i<3 ? medals[i] : `#${i+1}`}
                </div>
                <img src={getPhoto(u)} style={{ width:"40px", height:"40px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>{u.firstName} {u.lastName||""}</p>
                    {isMe && <span className="tag-g" style={{ fontSize:"9px", padding:"1px 6px" }}>You</span>}
                  </div>
                  <div style={{ display:"flex", gap:"6px", marginTop:"4px", flexWrap:"wrap" }}>
                    {u.githubStats && <span style={{ fontSize:"10px", color:"#f59e0b", fontFamily:"var(--mono)" }}>⭐{u.githubStats.totalStars}</span>}
                    {u.leetcodeStats && <span style={{ fontSize:"10px", color:"#fb923c", fontFamily:"var(--mono)" }}>LC:{u.leetcodeStats.totalSolved}</span>}
                    {u.skills?.slice(0,3).map(s=><span key={s} className="tag-n" style={{ fontSize:"9px", padding:"1px 6px" }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:"20px", fontWeight:700, color:"var(--green)", fontFamily:"var(--mono)" }}>{u.devScore}</div>
                  <div style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)" }}>pts</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Score breakdown */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.3 }}
        className="glass" style={{ padding:"20px", marginTop:"24px" }}>
        <div className="section-label">How Dev Score is Calculated</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
          {[
            { icon:"⭐", label:"GitHub Stars", pts:"×2 pts each (max 200)" },
            { icon:"📁", label:"Repositories", pts:"×3 pts each (max 150)" },
            { icon:"👥", label:"Followers", pts:"×1 pt each (max 100)" },
            { icon:"💻", label:"LC Solved", pts:"×2 pts each (max 300)" },
            { icon:"🔴", label:"Hard Problems", pts:"×5 pts each" },
            { icon:"🎯", label:"Profile Complete", pts:"Up to +100 pts" },
          ].map(s=>(
            <div key={s.label} style={{ padding:"12px", background:"rgba(0,255,135,.04)", borderRadius:"10px", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:"18px", marginBottom:"5px" }}>{s.icon}</div>
              <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", marginBottom:"2px" }}>{s.label}</p>
              <p style={{ fontSize:"11px", color:"var(--text3)" }}>{s.pts}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
