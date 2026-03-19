import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Save, Github, Globe, Edit3, X, ExternalLink, Upload, Camera, Star } from "lucide-react";
import axios from "axios";
import { updateUser } from "../utils/store";
import { TECH_SKILLS, AVATARS, getAvatarUrl } from "../utils/constants";
import { useToast } from "../components/ToastProvider";
import PlatformConnect from "../components/PlatformConnect";

const ContribGraph = ({ githubStats }) => {
  const colors = ["#0a1d14","#0e4429","#1a6a3a","#26a641","#3ddc72"];
  return (
    <div>
      <div style={{ display:"flex", gap:"2px", overflowX:"auto" }}>
        {Array.from({ length:52 },(_,w) => (
          <div key={w} style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
            {Array.from({ length:7 },(_,d) => {
              const lvl = Math.floor(Math.random()*5);
              return <div key={d} className="csq" style={{ background:colors[lvl], boxShadow:lvl>2?`0 0 3px ${colors[lvl]}`:"none" }}/>;
            })}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"8px" }}>
        <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Less</span>
        {colors.map((c,i) => <div key={i} style={{ width:"11px", height:"11px", borderRadius:"2px", background:c }}/>)}
        <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>More</span>
        {!githubStats && <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", marginLeft:"8px" }}>· Connect GitHub for real data</span>}
      </div>
    </div>
  );
};

const SkillBar = ({ skill, level }) => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
      <span style={{ fontSize:"12px", color:"var(--text2)", fontFamily:"var(--mono)" }}>{skill}</span>
      <span style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)", fontWeight:600 }}>{level}%</span>
    </div>
    <div className="prog"><motion.div className="prog-fill" initial={{ width:0 }} animate={{ width:`${level}%` }} transition={{ duration:1.2, delay:.2 }}/></div>
  </div>
);

export default function ProfilePage() {
  const user = useSelector(s => s.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName||"", lastName: user?.lastName||"",
    photoUrl: user?.photoUrl||"", age: user?.age||"", gender: user?.gender||"",
    about: user?.about||"", skills: user?.skills||[], github: user?.github||"", portfolio: user?.portfolio||"",
    useAvatar: user?.useAvatar!==false, avatarSeed: user?.avatarSeed||user?.firstName||"dev",
  });

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const toggleSkill = s => setForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x=>x!==s) : [...p.skills,s] }));

  const save = async () => {
    try {
      setSaving(true);
      const res = await axios.patch("/profile/edit", { ...form, age: form.age ? parseInt(form.age) : undefined });
      dispatch(updateUser(res.data.user||res.data));
      toast("Profile updated! ✅", "success");
      setEditing(false);
    } catch(e) { toast(e.response?.data?.message||"Update failed","error"); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    try {
      setUploading(true);
      const res = await axios.post("/profile/upload-photo", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      dispatch(updateUser(res.data.user));
      setForm(p => ({ ...p, photoUrl: res.data.photoUrl, useAvatar: false }));
      toast("Photo uploaded! ✅","success");
    } catch(e) { toast(e.response?.data?.message||"Upload failed","error"); }
    finally { setUploading(false); }
  };

  const selectAvatar = async (seed) => {
    try {
      setForm(p => ({ ...p, avatarSeed: seed, useAvatar: true }));
      const res = await axios.patch("/profile/edit", { avatarSeed: seed, useAvatar: true });
      dispatch(updateUser(res.data.user||res.data));
      setShowAvatarPicker(false);
      toast("Avatar updated! ✅","success");
    } catch(e) { toast("Update failed","error"); }
  };

  if (!user) return null;

  const userPhoto = user.useAvatar===false && user.photoUrl
    ? `http://localhost:3000${user.photoUrl}`
    : getAvatarUrl(user.avatarSeed||user.firstName||"dev");

  const skillLevels = [95,90,87,84,80,76,73,70];
  const connectedPlatforms = { github: user.github, leetcode: user.leetcode, linkedin: user.linkedin, gfg: user.gfg };

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"36px 28px" }}>
      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }} onClick={e=>e.target===e.currentTarget&&setShowAvatarPicker(false)}>
          <motion.div initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }}
            style={{ background:"rgba(7,21,16,0.98)", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"480px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontSize:"16px", fontWeight:700, color:"var(--text)" }}>Choose Avatar</h3>
              <button onClick={()=>setShowAvatarPicker(false)} className="btn-ico" style={{ width:"32px", height:"32px" }}><X size={14}/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"16px" }}>
              {AVATARS.map(a => (
                <div key={a.seed} onClick={()=>selectAvatar(a.seed)}
                  style={{ cursor:"pointer", borderRadius:"12px", overflow:"hidden", border:`2px solid ${form.avatarSeed===a.seed?"var(--green)":"transparent"}`, transition:"all .2s", boxShadow:form.avatarSeed===a.seed?"0 0 10px rgba(0,255,135,0.4)":"none" }}>
                  <img src={getAvatarUrl(a.seed)} style={{ width:"100%", height:"auto", display:"block" }}/>
                  <p style={{ fontSize:"10px", color:"var(--text3)", textAlign:"center", padding:"4px", fontFamily:"var(--mono)" }}>{a.label}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid rgba(0,255,135,0.1)", paddingTop:"16px", textAlign:"center" }}>
              <p style={{ fontSize:"12px", color:"var(--text3)", marginBottom:"10px" }}>Or upload your own photo</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display:"none" }}/>
              <button onClick={()=>fileRef.current?.click()} disabled={uploading} className="btn-sec" style={{ padding:"8px 20px", fontSize:"12px", display:"inline-flex", alignItems:"center", gap:"6px" }}>
                {uploading?<div style={{ width:"12px", height:"12px", border:"2px solid var(--green)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>:<Upload size={13}/>}
                {uploading?"Uploading...":"Upload Photo"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px" }}>
        <div>
          <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)", letterSpacing:"1px", marginBottom:"6px" }}>DEVTINDER · DEVELOPER PROFILE</p>
          <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>Your <span style={{ color:"var(--green)" }}>Profile</span></h1>
          <p style={{ fontSize:"13px", color:"var(--text2)" }}>Built by <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none" }}>Vishal Maurya</a></p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }} onClick={()=>setEditing(!editing)}
          className={editing?"btn-sec":"btn-prime"} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {editing?<><X size={14}/>Cancel</>:<><Edit3 size={14}/>Edit Profile</>}
        </motion.button>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:"18px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {/* Overview */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }} className="glass" style={{ padding:"24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontSize:"11px", fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"2px" }}>Professional Overview</h2>
              <span className="tag-g" style={{ fontSize:"10px", padding:"2px 8px" }}><span className="online-dot" style={{ width:"5px", height:"5px", boxShadow:"none" }}/> Public</span>
            </div>
            {editing ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>First Name</label><input value={form.firstName} onChange={upd("firstName")} className="inp" style={{ fontSize:"13px" }}/></div>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>Last Name</label><input value={form.lastName} onChange={upd("lastName")} className="inp" style={{ fontSize:"13px" }}/></div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>Age</label><input type="number" value={form.age} onChange={upd("age")} className="inp" style={{ fontSize:"13px" }}/></div>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>Gender</label><select value={form.gender} onChange={upd("gender")} className="inp" style={{ fontSize:"13px" }}><option value="">Select...</option><option value="male">Male</option><option value="female">Female</option><option value="others">Others</option></select></div>
                </div>
                <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>About</label><textarea value={form.about} onChange={upd("about")} rows={3} className="inp" style={{ resize:"none", fontSize:"13px" }} placeholder="Tell developers about yourself..."/></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>GitHub URL</label><input value={form.github} onChange={upd("github")} className="inp" style={{ fontSize:"13px" }}/></div>
                  <div><label style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:"6px" }}>Portfolio</label><input value={form.portfolio} onChange={upd("portfolio")} className="inp" style={{ fontSize:"13px" }}/></div>
                </div>
                <div style={{ display:"flex", gap:"10px" }}>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }} onClick={save} disabled={saving} className="btn-prime" style={{ display:"flex", alignItems:"center", gap:"7px", padding:"10px 20px" }}>
                    {saving?<div style={{ width:"13px", height:"13px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>:<Save size={13}/>}
                    {saving?"Saving...":"Save Changes"}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:"18px", alignItems:"start" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={userPhoto} style={{ width:"80px", height:"80px", borderRadius:"18px", border:"2px solid rgba(0,255,135,0.25)", objectFit:"cover", boxShadow:"0 0 20px rgba(0,255,135,0.12)" }}/>
                  <button onClick={()=>setShowAvatarPicker(true)}
                    style={{ position:"absolute", bottom:"-8px", right:"-8px", width:"26px", height:"26px", borderRadius:"50%", background:"var(--green)", border:"2px solid var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Camera size={11} color="#040d08"/>
                  </button>
                </div>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:"22px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{user.firstName} {user.lastName}</h2>
                  <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"10px" }}>{user.role||"Developer"}{user.age?` · Age ${user.age}`:""}{user.gender?` · ${user.gender}`:""}</p>
                  <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.7, marginBottom:"14px", maxWidth:"500px" }}>{user.about||"No bio yet. Click Edit Profile to add your story."}</p>
                  <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                    {user.github && <a href={user.github} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"var(--text2)", textDecoration:"none", padding:"6px 12px", border:"1px solid var(--border)", borderRadius:"8px", transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.color="var(--green)";e.currentTarget.style.borderColor="rgba(0,255,135,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.color="var(--text2)";e.currentTarget.style.borderColor="var(--border)"}}><Github size={12}/> GitHub <ExternalLink size={10}/></a>}
                    {user.portfolio && <a href={user.portfolio} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"var(--text2)", textDecoration:"none", padding:"6px 12px", border:"1px solid var(--border)", borderRadius:"8px", transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.color="var(--green)";e.currentTarget.style.borderColor="rgba(0,255,135,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.color="var(--text2)";e.currentTarget.style.borderColor="var(--border)"}}><Globe size={12}/> Portfolio <ExternalLink size={10}/></a>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }} className="glass" style={{ padding:"24px" }}>
            <div className="section-label">Skill Mastery</div>
            {editing ? (
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {TECH_SKILLS.map(s => <button key={s.name} onClick={()=>toggleSkill(s.name)} className={`skill ${form.skills.includes(s.name)?"active":""}`}>{s.icon} {s.name} {form.skills.includes(s.name)&&<X size={9} style={{ marginLeft:"2px" }}/>}</button>)}
              </div>
            ) : user.skills?.length > 0 ? (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                {user.skills.slice(0,8).map((s,i) => <SkillBar key={s} skill={s} level={skillLevels[i]||70}/>)}
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"10px" }}>No skills yet</p>
                <button onClick={()=>setEditing(true)} className="btn-sec" style={{ fontSize:"12px", padding:"7px 16px" }}>+ Add Skills</button>
              </div>
            )}
          </motion.div>

          {/* Contribution Graph */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }} className="glass" style={{ padding:"24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div className="section-label" style={{ margin:0 }}>Contribution Graph</div>
              <div style={{ display:"flex", gap:"20px" }}>
                <span style={{ fontSize:"12px", color:"var(--text3)" }}>Commits <strong style={{ color:"var(--text)", fontFamily:"var(--mono)" }}>—</strong></span>
                <span style={{ fontSize:"12px", color:"var(--text3)" }}>Streak <strong style={{ color:"var(--green)", fontFamily:"var(--mono)" }}>—</strong></span>
              </div>
            </div>
            <ContribGraph githubStats={user.githubStats}/>
          </motion.div>

          {/* Endorsements - REAL ONLY */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }} className="glass" style={{ padding:"24px" }}>
            <div className="section-label">Endorsements</div>
            {user.endorsements?.length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
                {user.endorsements.map((e,i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <img src={e.fromAvatar ? `http://localhost:3000${e.fromAvatar}` : getAvatarUrl(e.fromName?.split(" ")[0]||"dev")} style={{ width:"36px", height:"36px", borderRadius:"50%", flexShrink:0, objectFit:"cover" }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{e.fromName}</p>
                        <span style={{ fontSize:"12px", color:"#f59e0b" }}>{"★".repeat(e.rating)}{"☆".repeat(5-e.rating)}</span>
                      </div>
                      <p style={{ fontSize:"12px", color:"var(--text2)", marginTop:"4px", lineHeight:1.5, fontStyle:"italic" }}>"{e.text}"</p>
                      <p style={{ fontSize:"10px", color:"var(--text3)", marginTop:"4px", fontFamily:"var(--mono)" }}>{new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <Star size={32} style={{ color:"var(--text3)", margin:"0 auto 12px" }}/>
                <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"6px" }}>No endorsements yet</p>
                <p style={{ fontSize:"12px", color:"var(--text3)" }}>Endorsements appear here when other developers endorse you</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          {/* Stats */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              {[
                { n: user.githubStats?.totalStars||"—", l:"GitHub Stars", c:"#f59e0b" },
                { n: user.leetcodeStats?.totalSolved||"—", l:"LC Solved", c:"#fb923c" },
                { n: user.skills?.length||"—", l:"Skills", c:"var(--green)" },
                { n: user.githubStats?.publicRepos||"—", l:"Repos", c:"#38bdf8" },
              ].map(s => (
                <div key={s.l} className="stat-card">
                  <div style={{ fontSize:"22px", fontWeight:700, color:s.c, fontFamily:"var(--mono)", textShadow:`0 0 15px ${s.c}60` }}>{s.n}</div>
                  <div style={{ fontSize:"11px", color:"var(--text3)", marginTop:"4px", textTransform:"uppercase", letterSpacing:"1px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* GitHub Stats if connected */}
          {user.githubStats && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.12 }} className="glass" style={{ padding:"16px" }}>
              <div className="section-label">GitHub Stats</div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                <img src={user.githubStats.avatar} style={{ width:"36px", height:"36px", borderRadius:"8px" }}/>
                <div>
                  <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>@{user.githubStats.username}</p>
                  <a href={user.githubStats.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize:"11px", color:"var(--green)", textDecoration:"none" }}>View GitHub →</a>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                {[{l:"Stars",v:user.githubStats.totalStars},{l:"Repos",v:user.githubStats.publicRepos},{l:"Followers",v:user.githubStats.followers},{l:"Top Lang",v:user.githubStats.topLanguage}].map(s => (
                  <div key={s.l} style={{ padding:"8px", background:"rgba(0,255,135,0.04)", borderRadius:"8px", textAlign:"center" }}>
                    <div style={{ fontSize:"14px", fontWeight:700, color:"var(--green)", fontFamily:"var(--mono)" }}>{s.v}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", textTransform:"uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LeetCode stats if connected */}
          {user.leetcodeStats && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.13 }} className="glass" style={{ padding:"16px" }}>
              <div className="section-label">LeetCode Stats</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                {[{l:"Total",v:user.leetcodeStats.totalSolved,c:"var(--green)"},{l:"Easy",v:user.leetcodeStats.easySolved,c:"#22c55e"},{l:"Medium",v:user.leetcodeStats.mediumSolved,c:"#f59e0b"},{l:"Hard",v:user.leetcodeStats.hardSolved,c:"#ef4444"}].map(s => (
                  <div key={s.l} style={{ padding:"8px", background:"rgba(0,0,0,0.2)", borderRadius:"8px", textAlign:"center" }}>
                    <div style={{ fontSize:"16px", fontWeight:700, color:s.c, fontFamily:"var(--mono)" }}>{s.v}</div>
                    <div style={{ fontSize:"10px", color:"var(--text3)", textTransform:"uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"8px", fontFamily:"var(--mono)" }}>Rank #{user.leetcodeStats.ranking?.toLocaleString()} · {user.leetcodeStats.acceptanceRate?.toFixed(1)}% acceptance</p>
            </motion.div>
          )}

          {/* Profile Strength */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }} className="glass" style={{ padding:"16px" }}>
            <div className="section-label">Profile Strength</div>
            {[
              { done:true, label:"Basic info added" },
              { done:user.skills?.length>0, label:"Skills selected" },
              { done:!!user.github, label:"GitHub connected" },
              { done:!!user.leetcode, label:"LeetCode connected" },
              { done:user.useAvatar===false&&!!user.photoUrl, label:"Photo uploaded" },
              { done:!!user.about, label:"Bio written" },
            ].map(item => (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                <div style={{ width:"18px", height:"18px", borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:item.done?"rgba(0,255,135,0.15)":"transparent", border:`1px solid ${item.done?"rgba(0,255,135,0.3)":"var(--dim)"}`, transition:"all .3s" }}>
                  {item.done && <span style={{ color:"var(--green)", fontSize:"9px", fontWeight:700 }}>✓</span>}
                </div>
                <span style={{ fontSize:"12px", color:item.done?"var(--text2)":"var(--text3)" }}>{item.label}</span>
              </div>
            ))}
            {(()=>{
              const done=[true,user.skills?.length>0,!!user.github,!!user.leetcode,user.useAvatar===false&&!!user.photoUrl,!!user.about].filter(Boolean).length;
              const pct=Math.round((done/6)*100);
              return (<div style={{ marginTop:"6px" }}><div className="prog"><div className="prog-fill" style={{ width:`${pct}%` }}/></div><p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"5px", textAlign:"right", fontFamily:"var(--mono)" }}>{pct}% complete</p></div>);
            })()}
          </motion.div>

          {/* Platform Links */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }} className="glass" style={{ padding:"16px" }}>
            <div className="section-label">Connected Platforms</div>
            <PlatformConnect connectedPlatforms={connectedPlatforms}/>
          </motion.div>
        </div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
