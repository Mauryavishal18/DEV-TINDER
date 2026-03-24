import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, CheckCircle, Briefcase } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL, TECH_SKILLS } from "../utils/constants";
import { useToast } from "../components/ToastProvider";

export default function CollabPage() {
  const user = useSelector(s=>s.user);
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [applying, setApplying] = useState(null);
  const [form, setForm] = useState({ title:"", description:"", skills:[] });
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    axios.get("/collab/projects").then(r=>setProjects(r.data.data||[])).catch(console.error).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); }, []);

  const post = async () => {
    if (!form.title.trim()||!form.description.trim()) { toast("Title and description required","error"); return; }
    setPosting(true);
    try {
      await axios.post("/collab/projects", form);
      toast("Project posted! 🚀","success");
      setShowForm(false);
      setForm({ title:"", description:"", skills:[] });
      load();
    } catch(e) { toast(e.response?.data?.message||"Failed to post","error"); }
    finally { setPosting(false); }
  };

  const apply = async (ownerId, projectId) => {
    setApplying(projectId);
    try {
      await axios.post(`/collab/projects/${ownerId}/${projectId}/apply`);
      toast("Application sent! 🎉","success");
      load();
    } catch(e) { toast(e.response?.data?.message||"Failed to apply","error"); }
    finally { setApplying(null); }
  };

  const getPhoto = (u) => u?.useAvatar===false&&u?.photoUrl ? (u.photoUrl.startsWith("http")?u.photoUrl:`${BASE_URL}${u.photoUrl}`) : getAvatarUrl(u?.avatarSeed||u?.firstName||"dev");

  const filtered = projects.filter(p=>!filter || p.skills?.some(s=>s.toLowerCase().includes(filter.toLowerCase())) || p.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"14px", marginBottom:"28px" }}>
        <div>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
            Project <span style={{ color:"var(--green)" }}>Collab Board</span>
          </h1>
          <p style={{ fontSize:"14px", color:"var(--text2)" }}>Find co-founders, collaborators & open source contributors</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>setShowForm(true)}
          className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"7px" }}>
          <Plus size={15}/> Post a Project
        </motion.button>
      </motion.div>

      {/* Filter */}
      <div style={{ marginBottom:"18px" }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter by skill or keyword (React, Node, Python...)" className="inp" style={{ maxWidth:"400px" }}/>
      </div>

      {/* Post form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
            onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
            <motion.div initial={{ opacity:0, y:20, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }}
              style={{ background:"rgba(7,21,16,.98)", border:"1px solid rgba(0,255,135,.2)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"520px", maxHeight:"90vh", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
                <h2 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)" }}>Post a Project</h2>
                <button onClick={()=>setShowForm(false)} className="btn-ico" style={{ width:"32px", height:"32px" }}><X size={14}/></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Project Title *</label>
                  <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Building a real-time code collaboration tool" className="inp"/>
                </div>
                <div>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"6px" }}>Description *</label>
                  <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={4} placeholder="What are you building? What kind of collaborator do you need? What's the vision?" className="inp" style={{ resize:"none" }}/>
                </div>
                <div>
                  <label style={{ fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"8px" }}>Tech Stack Needed</label>
                  <div style={{ display:"flex", flexWrap:"wrap" }}>
                    {TECH_SKILLS.slice(0,12).map(s=>(
                      <button key={s.name} onClick={()=>setForm(p=>({...p, skills:p.skills.includes(s.name)?p.skills.filter(x=>x!==s.name):[...p.skills,s.name]}))}
                        className={`skill ${form.skills.includes(s.name)?"active":""}`}>{s.icon} {s.name}</button>
                    ))}
                  </div>
                </div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={post} disabled={posting}
                  className="btn-prime" style={{ padding:"13px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                  {posting ? <div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Briefcase size={14}/>}
                  {posting ? "Posting..." : "Post Project 🚀"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }} style={{ width:"32px", height:"32px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%" }}/>
        </div>
      ) : filtered.length===0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass" style={{ padding:"64px 40px", textAlign:"center" }}>
          <Briefcase size={48} style={{ color:"var(--text3)", margin:"0 auto 16px" }}/>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>No Projects Yet</h3>
          <p style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Be the first to post a project and find your dream collaborator!</p>
          <button onClick={()=>setShowForm(true)} className="btn-prime" style={{ padding:"10px 24px" }}>Post First Project →</button>
        </motion.div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"14px" }}>
          {filtered.map((p,i)=>{
            const isOwn = p.owner?._id===user?._id;
            const applied = p.applicants?.includes(user?._id);
            return (
              <motion.div key={p._id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.05 }}
                className="glass" style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <img src={getPhoto(p.owner)} style={{ width:"36px", height:"36px", borderRadius:"50%", objectFit:"cover" }}/>
                  <div>
                    <p style={{ fontSize:"12px", fontWeight:600, color:"var(--text)" }}>{p.owner?.firstName} {p.owner?.lastName||""}</p>
                    <p style={{ fontSize:"10px", color:"var(--green)", fontFamily:"var(--mono)" }}>Score: {p.owner?.devScore||0} pts</p>
                  </div>
                  {isOwn && <span className="tag-g" style={{ fontSize:"9px", marginLeft:"auto" }}>Your project</span>}
                </div>
                <div>
                  <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>{p.title}</h3>
                  <p style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.6 }}>{p.description}</p>
                </div>
                {p.skills?.length>0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                    {p.skills.map(s=><span key={s} className="tag-g" style={{ fontSize:"10px" }}>{s}</span>)}
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <Users size={12} color="var(--text3)"/>
                    <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{p.applicants?.length||0} applied</span>
                  </div>
                  {!isOwn && (
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                      onClick={()=>apply(p.owner._id, p._id)}
                      disabled={applied||applying===p._id}
                      className={applied?"btn-sec":"btn-prime"}
                      style={{ fontSize:"12px", padding:"7px 16px", display:"flex", alignItems:"center", gap:"5px" }}>
                      {applying===p._id ? <div style={{ width:"12px", height:"12px", border:"2px solid currentColor", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : applied ? <CheckCircle size={12}/> : <Plus size={12}/>}
                      {applied ? "Applied" : "Apply"}
                    </motion.button>
                  )}
                </div>
                <p style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)" }}>{new Date(p.createdAt).toLocaleDateString()}</p>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
