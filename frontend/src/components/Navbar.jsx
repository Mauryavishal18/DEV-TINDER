import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronDown, LogOut, User, Users, Inbox, MessageSquare, Bot, Menu, X, Trophy, BarChart2, Briefcase, Code2, FileText, Globe, Moon, Sun, Settings, Github } from "lucide-react";
import axios from "axios";
import { removeUser, clearFeed, clearConnections } from "../utils/store";
import { getAvatarUrl, BASE_URL } from "../utils/constants";
import NotificationsPanel from "./NotificationsPanel";
import useTheme from "../hooks/useTheme";

export default function Navbar({ socket }) {
  const user = useSelector(s => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [mob, setMob] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef(null);
  const mobRef = useRef(null);

  // ─── CLOSE ALL DROPDOWNS ON OUTSIDE CLICK ─────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (mobRef.current && !mobRef.current.contains(e.target)) {
        setMob(false);
      }
    };
    if (open || mob) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, mob]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
    setMob(false);
  }, [pathname]);

  const logout = async () => {
    try { await axios.post("/logout"); } catch {}
    dispatch(removeUser());
    dispatch(clearFeed());
    dispatch(clearConnections());
    navigate("/login");
  };

  const active = (p) => p === "/" ? pathname === "/" : pathname.startsWith(p);

  const getPhoto = (u) =>
    u?.useAvatar === false && u?.photoUrl
      ? (u.photoUrl.startsWith("http") ? u.photoUrl : `${BASE_URL}${u.photoUrl}`)
      : getAvatarUrl(u?.avatarSeed || u?.firstName || "dev");

  const links = [
    { to: "/", label: "Explore" },
    { to: "/connections", label: "Connections" },
    { to: "/requests", label: "Requests" },
    { to: "/chat", label: "Messages" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const menuItems = [
    { icon: <User size={13} />, label: "Profile", to: "/profile" },
    { icon: <Users size={13} />, label: "Connections", to: "/connections" },
    { icon: <Inbox size={13} />, label: "Requests", to: "/requests" },
    { icon: <MessageSquare size={13} />, label: "Messages", to: "/chat" },
    { icon: <Trophy size={13} />, label: "Leaderboard", to: "/leaderboard" },
    { icon: <BarChart2 size={13} />, label: "Analytics", to: "/analytics" },
    { icon: <Briefcase size={13} />, label: "Collab Board", to: "/collab" },
    { icon: <Globe size={13} />, label: "Jobs", to: "/jobs" },
    { icon: <span style={{ fontSize: "11px" }}>🎮</span>, label: "Dev Games", to: "/games" },
    { icon: <span style={{ fontSize: "11px" }}>🧬</span>, label: "Dev DNA", to: "/dev-dna" },
    { icon: <span style={{ fontSize: "11px" }}>🙈</span>, label: "Blind Dev Date", to: "/blind-date" },
    { icon: <span style={{ fontSize: "11px" }}>🏆</span>, label: "World Cup", to: "/world-cup" },
    { icon: <Code2 size={13} />, label: "Hackathons", to: "/hackathons" },
    { icon: <FileText size={13} />, label: "Resume Builder", to: "/resume" },
    { icon: <Github size={13} />, label: "Open Source Match", to: "/opensource" },
    { icon: <Settings size={13} />, label: "Settings", to: "/settings" },
  ];

  return (
    <nav style={{ background: "rgba(4,13,8,.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(0,255,135,.1)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#00ff87,transparent)", opacity: .5 }} />
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,135,.4)" }}>
            <Zap size={17} color="#040d08" fill="#040d08" />
          </motion.div>
          <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "2px", color: "var(--text)", fontFamily: "var(--mono)" }}>
            DEV<span style={{ color: "var(--green)" }}>TINDER</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div style={{ display: "flex", gap: "2px", background: "rgba(0,255,135,.04)", border: "1px solid rgba(0,255,135,.1)", borderRadius: "12px", padding: "4px" }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: active(l.to) ? "var(--green)" : "var(--text3)", background: active(l.to) ? "rgba(0,255,135,.1)" : "transparent", boxShadow: active(l.to) ? "0 0 0 1px rgba(0,255,135,.2)" : "none", textDecoration: "none", transition: "all .2s", letterSpacing: ".3px", whiteSpace: "nowrap" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/ai" style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: active("/ai") ? "#a78bfa" : "#7c6ab8", background: active("/ai") ? "rgba(167,139,250,.12)" : "transparent", textDecoration: "none", transition: "all .2s", display: "flex", alignItems: "center", gap: "5px" }}>
            <Bot size={12} /> Dev AI
          </Link>
          <Link to="/code-review" style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: active("/code-review") ? "var(--green)" : "var(--text3)", background: active("/code-review") ? "rgba(0,255,135,.1)" : "transparent", textDecoration: "none", transition: "all .2s" }}>
            Code Review
          </Link>
        </div>

        {/* Right */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="btn-ico" title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications — pass setOpen/setMob so it can close them */}
            <NotificationsPanel socket={socket} onOpen={() => { setOpen(false); setMob(false); }} />

            {/* User menu */}
            <div style={{ position: "relative" }} ref={menuRef}>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setOpen(v => !v); setMob(false); }}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "10px", border: "1px solid rgba(0,255,135,.15)", background: "rgba(0,255,135,.04)", cursor: "pointer" }}>
                <img src={getPhoto(user)} style={{ width: "26px", height: "26px", borderRadius: "7px", border: "1px solid rgba(0,255,135,.2)", objectFit: "cover" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--mono)" }}>{user.firstName}</span>
                <ChevronDown size={11} color="var(--text3)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </motion.button>

              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .95 }}
                    style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "220px", background: "rgba(7,21,16,.97)", border: "1px solid rgba(0,255,135,.15)", borderRadius: "14px", overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,.6)", zIndex: 200 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,255,135,.08)" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{user.firstName} {user.lastName || ""}</p>
                      <p style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--mono)" }}>Score: {user.devScore || 0} pts</p>
                    </div>
                    <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {menuItems.map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 16px", fontSize: "13px", color: "var(--text2)", textDecoration: "none", transition: "all .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,135,.06)"; e.currentTarget.style.color = "var(--green)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}>
                          <span style={{ color: "var(--text3)" }}>{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <Link to="/ai" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 16px", fontSize: "13px", color: "#a78bfa", textDecoration: "none", borderTop: "1px solid rgba(167,139,250,.1)", background: "rgba(167,139,250,.04)" }}>
                        <Bot size={13} /> Dev AI
                      </Link>
                    </div>
                    <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", fontSize: "13px", color: "#f87171", background: "none", border: "none", cursor: "pointer", borderTop: "1px solid rgba(255,255,255,.05)", fontFamily: "var(--font)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
