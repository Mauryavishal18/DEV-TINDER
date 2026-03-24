import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Briefcase, ExternalLink, MapPin, DollarSign, Clock, RefreshCw } from "lucide-react";

// Remotive API - completely free, no key needed
const fetchJobs = async (skills) => {
  // Try Remotive API (free, no key needed)
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=40", {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.jobs || [];
  } catch(e) {
    // Fallback: return empty so user sees proper message
    throw new Error("Could not load jobs — Remotive API may be temporarily unavailable. Try again in a moment.");
  }
};

export default function JobsPage() {
  const user = useSelector(s=>s.user);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("all");

  const load = () => {
    setLoading(true); setError("");
    fetchJobs(user?.skills)
      .then(setJobs)
      .catch(e=>setError("Could not load jobs. Try again later."))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{
    load();
    // Auto-filter by user's top skill
    if (user?.skills?.length > 0) setFilter(user.skills[0]);
  }, []);

  const filtered = jobs.filter(j=>{
    const q = filter.toLowerCase();
    const match = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q) || j.tags?.some(t=>t.toLowerCase().includes(q));
    const catMatch = category==="all" || j.job_type?.toLowerCase().includes(category);
    return match && catMatch;
  });

  // Highlight jobs matching user's skills
  const isRecommended = (job) => user?.skills?.some(s => job.tags?.some(t=>t.toLowerCase().includes(s.toLowerCase())));

  return (
    <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
              Remote <span style={{ color:"var(--green)" }}>Dev Jobs</span>
            </h1>
            <p style={{ fontSize:"14px", color:"var(--text2)" }}>
              Live remote jobs — matched to your stack ({user?.skills?.slice(0,3).join(", ")||"your skills"})
            </p>
          </div>
          <button onClick={load} disabled={loading} className="btn-sec" style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"13px" }}>
            <RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":"none" }}/> Refresh
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"20px" }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search role, company, skill..." className="inp" style={{ maxWidth:"320px" }}/>
        {["all","full-time","contract","freelance"].map(c=>(
          <button key={c} onClick={()=>setCategory(c)}
            className={category===c?"btn-prime":"btn-sec"}
            style={{ padding:"9px 16px", fontSize:"12px", textTransform:"capitalize" }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
          <p style={{ fontSize:"13px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Fetching remote jobs...</p>
        </div>
      ) : error ? (
        <div className="glass" style={{ padding:"40px", textAlign:"center" }}>
          <p style={{ color:"#f87171", marginBottom:"12px" }}>{error}</p>
          <button onClick={load} className="btn-prime">Try Again</button>
        </div>
      ) : (
        <>
          <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"14px", fontFamily:"var(--mono)" }}>
            {filtered.length} jobs found · {jobs.filter(isRecommended).length} match your stack
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {filtered.map((job,i)=>{
              const rec = isRecommended(job);
              return (
                <motion.div key={job.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.02 }}
                  className="glass" style={{ padding:"18px 22px", borderColor:rec?"rgba(0,255,135,.3)":"var(--border)", background:rec?"rgba(0,255,135,.02)":"var(--card)" }}>
                  <div style={{ display:"flex", alignItems:"start", gap:"14px", flexWrap:"wrap" }}>
                    <div style={{ flex:1, minWidth:"200px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px", flexWrap:"wrap" }}>
                        <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)" }}>{job.title}</h3>
                        {rec && <span className="tag-g" style={{ fontSize:"9px", padding:"1px 6px" }}>Matches your stack</span>}
                        <span className="tag-n" style={{ fontSize:"9px", padding:"1px 6px" }}>{job.job_type}</span>
                      </div>
                      <p style={{ fontSize:"13px", color:"var(--green)", fontWeight:600, marginBottom:"6px" }}>{job.company_name}</p>
                      <div style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
                        {job.candidate_required_location && <span style={{ fontSize:"11px", color:"var(--text3)", display:"flex", alignItems:"center", gap:"4px" }}><MapPin size={10}/>{job.candidate_required_location}</span>}
                        {job.salary && <span style={{ fontSize:"11px", color:"var(--text3)", display:"flex", alignItems:"center", gap:"4px" }}><DollarSign size={10}/>{job.salary}</span>}
                        <span style={{ fontSize:"11px", color:"var(--text3)", display:"flex", alignItems:"center", gap:"4px" }}><Clock size={10}/>{new Date(job.publication_date).toLocaleDateString()}</span>
                      </div>
                      {job.tags?.length>0 && (
                        <div style={{ display:"flex", gap:"5px", marginTop:"8px", flexWrap:"wrap" }}>
                          {job.tags.slice(0,6).map(t=><span key={t} className="tag-n" style={{ fontSize:"9px", padding:"1px 6px" }}>{t}</span>)}
                        </div>
                      )}
                    </div>
                    <a href={job.url} target="_blank" rel="noreferrer">
                      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                        className="btn-prime" style={{ fontSize:"12px", padding:"8px 16px", display:"flex", alignItems:"center", gap:"5px", whiteSpace:"nowrap" }}>
                        Apply <ExternalLink size={11}/>
                      </motion.button>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
