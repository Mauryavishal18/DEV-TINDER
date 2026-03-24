import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Eye, TrendingUp, Users, Zap } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

export default function AnalyticsPage() {
  const user = useSelector(s=>s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    axios.get("/profile/analytics").then(r=>setData(r.data)).catch(console.error).finally(()=>setLoading(false));
  },[]);

  const maxVal = data ? Math.max(...Object.values(data.byDay||{}), 1) : 1;

  const getPhoto = (v) => v?.avatar ? (v.avatar.startsWith("http")?v.avatar:`${BASE_URL}${v.avatar}`) : getAvatarUrl("dev");

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
          Profile <span style={{ color:"var(--green)" }}>Analytics</span>
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>See who's viewing your profile and how your Dev Score grows</p>
      </motion.div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : !data ? (
        <div className="glass" style={{ padding:"40px", textAlign:"center" }}>
          <p style={{ color:"var(--text3)" }}>No analytics data yet. Share your profile to get views!</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
            style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"20px" }}>
            {[
              { icon:<Eye size={20} color="var(--green)"/>, label:"Total Views", value:data.totalViews, color:"var(--green)" },
              { icon:<TrendingUp size={20} color="#38bdf8"/>, label:"This Week", value:data.weekViews, color:"#38bdf8" },
              { icon:<Users size={20} color="#a78bfa"/>, label:"Today", value:data.todayViews, color:"#a78bfa" },
              { icon:<Zap size={20} color="#f59e0b"/>, label:"Dev Score", value:data.devScore, color:"#f59e0b" },
            ].map(s=>(
              <div key={s.label} className="stat-card" style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {s.icon}
                <div style={{ fontSize:"26px", fontWeight:700, color:s.color, fontFamily:"var(--mono)" }}>{s.value}</div>
                <div style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1px" }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* View graph */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
            className="glass" style={{ padding:"24px", marginBottom:"20px" }}>
            <div className="section-label">Profile Views — Last 30 Days</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:"4px", height:"120px", overflowX:"auto" }}>
              {Object.entries(data.byDay||{}).map(([date,count])=>{
                const h = Math.max((count/maxVal)*100, count>0?8:2);
                const d = new Date(date);
                const label = `${d.getMonth()+1}/${d.getDate()}`;
                return (
                  <div key={date} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", flex:"1", minWidth:"16px" }}
                    title={`${label}: ${count} views`}>
                    <motion.div initial={{ height:0 }} animate={{ height:`${h}%` }} transition={{ duration:.8, delay:.2 }}
                      style={{ width:"100%", background:count>0?"linear-gradient(to top,var(--green3),var(--green))":"rgba(0,255,135,.08)", borderRadius:"3px 3px 0 0", boxShadow:count>0?"0 0 6px rgba(0,255,135,.3)":"none", minHeight:"2px" }}/>
                    {Object.keys(data.byDay).indexOf(date)%7===0 && <span style={{ fontSize:"9px", color:"var(--text3)", fontFamily:"var(--mono)", whiteSpace:"nowrap" }}>{label}</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent viewers */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
            className="glass" style={{ padding:"24px" }}>
            <div className="section-label">Recent Viewers</div>
            {data.recentViewers?.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <Eye size={36} style={{ color:"var(--text3)", margin:"0 auto 12px" }}/>
                <p style={{ fontSize:"13px", color:"var(--text3)" }}>No profile views yet. Complete your profile to attract developers!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {data.recentViewers.map((v,i)=>(
                  <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.05 }}
                    style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", borderRadius:"10px", background:"rgba(0,255,135,.03)", border:"1px solid var(--border)" }}>
                    <img src={getPhoto(v)} style={{ width:"36px", height:"36px", borderRadius:"50%", objectFit:"cover" }}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{v.name||"Anonymous Developer"}</p>
                      <p style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                        {new Date(v.time).toLocaleDateString()} at {new Date(v.time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                    <div className="online-dot" style={{ width:"6px", height:"6px", boxShadow:"none" }}/>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
