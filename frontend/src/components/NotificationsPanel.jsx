import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Eye, Heart, MessageSquare, Star, Users, Check } from "lucide-react";
import axios from "axios";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

const ICONS = {
  view: <Eye size={14} color="#38bdf8" />,
  match: <Heart size={14} color="#f87171" />,
  request: <Users size={14} color="var(--green)" />,
  message: <MessageSquare size={14} color="#a78bfa" />,
  endorsement: <Star size={14} color="#f59e0b" />,
  collab: <Users size={14} color="#fb923c" />,
};

const requestPushPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

const showPushNotification = (title, body, icon) => {
  if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
    new Notification(title, { body, icon: icon || "/favicon.ico", badge: "/favicon.ico" });
  }
};

export default function NotificationsPanel({ socket, onOpen }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);

  const load = () => {
    axios.get("/notifications").then(r => setNotifs(r.data.data || [])).catch(console.error);
    axios.get("/notifications/unread-count").then(r => setUnread(r.data.count || 0)).catch(console.error);
  };

  useEffect(() => { load(); requestPushPermission(); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", (n) => {
      setNotifs(p => [{ ...n, _id: Date.now(), read: false, createdAt: new Date() }, ...p]);
      setUnread(p => p + 1);
      showPushNotification(
        n.from ? `DevTinder — ${n.from}` : "DevTinder",
        n.message || "You have a new notification",
        null
      );
    });
    return () => socket.off("notification");
  }, [socket]);

  const markRead = async () => {
    try { await axios.patch("/notifications/read"); setUnread(0); setNotifs(p => p.map(n => ({ ...n, read: true }))); } catch {}
  };

  const getNotifLink = (n) => {
    if (n.type === "match" || n.type === "message") return n.fromId ? `/chat/${n.fromId}` : "/chat";
    if (n.type === "request") return "/requests";
    if (n.type === "view") return "/analytics";
    if (n.type === "endorsement") return "/profile";
    if (n.type === "collab") return "/collab";
    return null;
  };

  const handleNotifClick = (n) => {
    const link = getNotifLink(n);
    if (link) { navigate(link); setOpen(false); }
  };

  const timeAgo = (d) => {
    const s = Math.floor((new Date() - new Date(d)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      load();
      onOpen && onOpen(); // close other dropdowns
    }
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button className="btn-ico" onClick={handleOpen} style={{ position: "relative" }}>
        <Bell size={16} />
        {unread > 0 && (
          <span style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)", border: "1px solid var(--bg)", animation: "pulse 2s infinite" }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .97 }}
            style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "340px", background: "rgba(7,21,16,.98)", border: "1px solid rgba(0,255,135,.15)", borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,.6)", zIndex: 999 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,255,135,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={14} color="var(--green)" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Notifications</span>
                {unread > 0 && <span style={{ padding: "1px 7px", borderRadius: "20px", background: "rgba(0,255,135,.15)", border: "1px solid rgba(0,255,135,.3)", fontSize: "10px", color: "var(--green)", fontFamily: "var(--mono)" }}>{unread}</span>}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {unread > 0 && <button onClick={markRead} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "var(--font)" }}><Check size={11} />Mark all read</button>}
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}><X size={13} /></button>
              </div>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {notifs.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <Bell size={32} style={{ color: "var(--text3)", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "13px", color: "var(--text3)" }}>No notifications yet</p>
                </div>
              ) : notifs.map((n, i) => (
                <div key={n._id || i}
                  onClick={() => handleNotifClick(n)}
                  style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.04)", background: n.read ? "transparent" : "rgba(0,255,135,.03)", display: "flex", gap: "10px", alignItems: "flex-start", cursor: getNotifLink(n) ? "pointer" : "default", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (getNotifLink(n)) e.currentTarget.style.background = "rgba(0,255,135,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? "transparent" : "rgba(0,255,135,.03)"; }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,255,135,.08)", border: "1px solid rgba(0,255,135,.15)" }}>
                    {ICONS[n.type] || <Bell size={14} color="var(--text3)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "var(--mono)", marginTop: "3px" }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: "4px" }} />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
