import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bell, ChevronDown, LogOut, User, Users, Inbox, MessageSquare, Bot, Menu, X } from "lucide-react";
import axios from "axios";
import { removeUser } from "../utils/store";
import { getAvatarUrl } from "../utils/constants";

export default function Navbar() {
  const user = useSelector(s => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [mob, setMob] = useState(false);

  const logout = async () => {
    try { await axios.post("/logout"); } catch {}
    dispatch(removeUser());
    navigate("/login");
  };

  const links = [
    { to:"/", label:"Explore" },
    { to:"/connections", label:"Connections" },
    { to:"/requests", label:"Requests" },
    { to:"/chat", label:"Messages" },
  ];
  const isActive = p => p==="/" ? pathname==="/" : pathname.startsWith(p);

  const avatar = user?.useAvatar !== false
    ? getAvatarUrl(user?.avatarSeed || user?.firstName || "user")
    : user?.photoUrl?.startsWith("/uploads")
      ? `http://localhost:3000${user.photoUrl}`
      : user?.photoUrl || getAvatarUrl(user?.firstName || "user");

  return (
    <nav style={{ background:"rgba(4,13,8,0.97)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(0,255,135,0.1)", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,#00ff87,transparent)", opacity:.5 }} />
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 28px", height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
          <motion.div whileHover={{ scale:1.05 }}
            style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(0,255,135,.4)", position:"relative" }}>
            <Zap size={17} color="#040d08" fill="#040d08" />
            <div style={{ position:"absolute", inset:"-3px", borderRadius:"13px", border:"1px solid rgba(0,255,135,.3)", animation:"logoPulse 2s ease-in-out infinite" }} />
          </motion.div>
          <span style={{ fontSize:"15px", fontWeight:700, letterSpacing:"2px", color:"var(--text)", fontFamily:"var(--mono)" }}>
            DEV<span style={{ color:"var(--green)", textShadow:"0 0 15px rgba(0,255,135,.5)" }}>TINDER</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex" style={{ gap:"2px", background:"rgba(0,255,135,.04)", border:"1px solid rgba(0,255,135,.1)", borderRadius:"12px", padding:"4px" }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ padding:"8px 18px", borderRadius:"8px", fontSize:"12px", fontWeight:500, color:isActive(l.to)?"var(--green)":"var(--text3)", background:isActive(l.to)?"rgba(0,255,135,.1)":"transparent", boxShadow:isActive(l.to)?"0 0 0 1px rgba(0,255,135,.2)":"none", textDecoration:"none", transition:"all .2s", letterSpacing:".4px" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/ai" style={{ padding:"8px 18px", borderRadius:"8px", fontSize:"12px", fontWeight:600, color:isActive("/ai")?"#a78bfa":"#7c6ab8", background:isActive("/ai")?"rgba(167,139,250,.12)":"transparent", textDecoration:"none", transition:"all .2s", display:"flex", alignItems:"center", gap:"5px" }}>
            <Bot size={12} /> Dev AI
          </Link>
        </div>

        {/* Right */}
        {user && (
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Link to="/ai" style={{ display:"flex", alignItems:"center", gap:"6px", padding:"6px 12px", borderRadius:"8px", background:"rgba(167,139,250,.08)", border:"1px solid rgba(167,139,250,.2)", color:"#a78bfa", textDecoration:"none", fontSize:"12px", fontFamily:"var(--mono)" }}>
              <Bot size={12} /> Ask AI
            </Link>
            <Link to="/requests" style={{ position:"relative" }}>
              <button className="btn-ico"><Bell size={16} />
                <span style={{ position:"absolute", top:"7px", right:"7px", width:"6px", height:"6px", borderRadius:"50%", background:"var(--green)", border:"1px solid var(--bg)", animation:"pulse 2s infinite" }} />
              </button>
            </Link>
            <div style={{ position:"relative" }}>
              <motion.button whileHover={{ scale:1.02 }} onClick={() => setOpen(!open)}
                style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 12px", borderRadius:"10px", border:"1px solid rgba(0,255,135,.15)", background:"rgba(0,255,135,.04)", cursor:"pointer" }}>
                <img src={avatar} style={{ width:"28px", height:"28px", borderRadius:"8px", border:"1px solid rgba(0,255,135,.2)", objectFit:"cover" }} />
                <span style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", fontFamily:"var(--mono)" }}>{user.firstName}</span>
                <ChevronDown size={12} color="var(--text3)" style={{ transform:open?"rotate(180deg)":"none", transition:"transform .2s" }} />
              </motion.button>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity:0, y:8, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.95 }}
                    style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:"210px", background:"rgba(7,21,16,.97)", border:"1px solid rgba(0,255,135,.15)", borderRadius:"14px", overflow:"hidden", backdropFilter:"blur(20px)", boxShadow:"0 20px 40px rgba(0,0,0,.6)" }}>
                    <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(0,255,135,.08)" }}>
                      <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{user.firstName} {user.lastName}</p>
                      <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"2px", fontFamily:"var(--mono)" }}>{user.emailId}</p>
                    </div>
                    {[
                      { icon:<User size={13}/>, label:"Profile", to:"/profile" },
                      { icon:<Users size={13}/>, label:"Connections", to:"/connections" },
                      { icon:<Inbox size={13}/>, label:"Requests", to:"/requests" },
                      { icon:<MessageSquare size={13}/>, label:"Messages", to:"/chat" },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                        style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", fontSize:"13px", color:"var(--text2)", textDecoration:"none", transition:"all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.color="var(--green)"}
                        onMouseLeave={e => e.currentTarget.style.color="var(--text2)"}>
                        <span style={{ color:"var(--text3)" }}>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <Link to="/ai" onClick={() => setOpen(false)}
                      style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", fontSize:"13px", color:"#a78bfa", textDecoration:"none", borderTop:"1px solid rgba(167,139,250,.1)", background:"rgba(167,139,250,.04)" }}>
                      <Bot size={13} /> Dev AI
                      <span style={{ marginLeft:"auto", fontSize:"9px", padding:"2px 6px", borderRadius:"4px", background:"rgba(167,139,250,.15)", border:"1px solid rgba(167,139,250,.25)" }}>FREE</span>
                    </Link>
                    <button onClick={logout}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"10px 16px", fontSize:"13px", color:"#f87171", background:"none", border:"none", cursor:"pointer", borderTop:"1px solid rgba(255,255,255,.05)", fontFamily:"var(--font)" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,.08)"}
                      onMouseLeave={e => e.currentTarget.style.background="none"}>
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="btn-ico md:hidden" onClick={() => setMob(!mob)}>
              {mob ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {mob && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            style={{ borderTop:"1px solid rgba(0,255,135,.1)", overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:"4px" }}>
              {[...links, { to:"/ai", label:"✦ Dev AI" }].map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMob(false)}
                  style={{ padding:"10px 14px", borderRadius:"8px", fontSize:"13px", color:isActive(l.to)?"var(--green)":"var(--text2)", background:isActive(l.to)?"rgba(0,255,135,.08)":"transparent", textDecoration:"none" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
