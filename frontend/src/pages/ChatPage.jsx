import { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Code, Paperclip, MessageSquare, Video, Phone, Search, X as XIcon, Check, CheckCheck } from "lucide-react";
import axios from "axios";
import { getAvatarUrl } from "../utils/constants";
import { BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../utils/constants";
import { useToast } from "../components/ToastProvider";
import VideoCallModal from "../components/VideoCallModal";
import ImageEditorModal from "../components/ImageEditorModal";

export default function ChatPage() {
  const { socket: layoutSocket } = useOutletContext() || {};
  const { userId } = useParams();
  const user = useSelector(s => s.user);
  const navigate = useNavigate();
  const toast = useToast();
  const [connections, setConnections] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socket = layoutSocket;
  const [activeCall, setActiveCall] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [readByPeer, setReadByPeer] = useState(new Set());
  const [lastMessages, setLastMessages] = useState({});
  const endRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);
  const [imageEditorFile, setImageEditorFile] = useState(null);

  const formatLastSeen = (userId) => {
    if (onlineUsers.includes(userId?.toString())) return null; // online - show dot
    const ls = lastSeenMap[userId];
    if (!ls) return "Offline";
    const diff = Date.now() - new Date(ls).getTime();
    if (diff < 60000) return "Last seen just now";
    if (diff < 3600000) return `Last seen ${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `Last seen ${Math.floor(diff/3600000)}h ago`;
    return `Last seen ${Math.floor(diff/86400000)}d ago`;
  };

  const getPhoto = (u) =>
    u?.useAvatar === false && u?.photoUrl
      ? u.photoUrl.startsWith("http") ? u.photoUrl : `${BASE_URL}${u.photoUrl}`
      : getAvatarUrl(u?.avatarSeed || u?.firstName || "dev");

  // Listen to socket events from shared Layout socket
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    const handleReceiveMessage = (data) => {
      setMessages(prev => {
        if (prev.find(m => m._id === data._id || (m.message === data.message && m.senderId === data.senderId && Math.abs(new Date(m.createdAt) - new Date(data.timestamp)) < 2000))) return prev;
        return [...prev, {
          _id: data._id || Date.now().toString(),
          message: data.message,
          senderId: data.senderId,
          receiverId: data.receiverId,
          isCode: data.isCode || false,
          createdAt: data.timestamp || new Date().toISOString(),
        }];
      });
      setLastMessages(prev => ({ ...prev, [data.senderId]: data.message }));
      // Browser push notification for new message
      if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
        const senderName = data.senderName || "Someone";
        const preview = data.message?.startsWith("__IMG__") ? "📷 Image" : data.message?.startsWith("__CALL__") ? "📹 Call" : data.message?.substring(0, 60);
        new Notification(`💬 ${senderName}`, { body: preview, icon: "/favicon.ico" });
      }
    };
    const handleTypingStatus = ({ senderId, isTyping: t }) => {
      if (senderId !== user._id) setIsTyping(t);
    };
    const handleMessagesRead = ({ readerId }) => {
      // Peer read our messages - mark all as read
      setReadByPeer(new Set(messages.map(m => m._id)));
    };
    const handleOnlineUsersWithSeen = (users) => {
      setOnlineUsers(users);
    };

    socket.on("online_users", handleOnlineUsersWithSeen);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("online_users", handleOnlineUsersWithSeen);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, user._id]);

  // Load connections - always fresh, no cache
  useEffect(() => {
    setLoading(true);
    axios.get("/user/connections", { params: { _t: Date.now() } })
      .then(r => {
        const data = r.data.data || [];
        setConnections(data);
        if (userId) {
          const found = data.find(c => c._id === userId);
          if (found) {
            setActive(found);
          } else if (data.length > 0) {
            setActive(data[0]);
            navigate(`/chat/${data[0]._id}`, { replace: true });
          }
        } else if (data.length > 0) {
          setActive(data[0]);
          navigate(`/chat/${data[0]._id}`, { replace: true });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  // Reload connections when new match notification arrives
  useEffect(() => {
    if (!socket) return;
    const handleNewMatch = () => {
      axios.get("/user/connections", { params: { _t: Date.now() } })
        .then(r => setConnections(r.data.data || []))
        .catch(console.error);
    };
    socket.on("notification", (n) => {
      if (n.type === "match") handleNewMatch();
    });
    return () => socket.off("notification");
  }, [socket]);

  // Load messages + emit read receipt
  useEffect(() => {
    if (!active) return;
    setMessages([]);
    setReadByPeer(new Set());
    axios.get(`/messages/${active._id}`)
      .then(r => {
        const msgs = r.data.data || [];
        setMessages(msgs);
        // Emit read receipt to sender
        if (msgs.length > 0 && socket) {
          socket.emit("messages_read", { readerId: user._id, senderId: active._id });
        }
      })
      .catch(console.error);
    // Fetch last seen
    axios.get(`/user/last-seen/${active._id}`)
      .then(r => setLastSeenMap(prev => ({ ...prev, [active._id]: r.data.lastSeen })))
      .catch(()=>{});
  }, [active?._id]);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (active && socket) {
      socket.emit("typing", { senderId: user._id, receiverId: active._id, isTyping: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing", { senderId: user._id, receiverId: active._id, isTyping: false });
      }, 1500);
    }
  };

  const sendMsg = async (isCode = false) => {
    const text = input.trim();
    if (!text || !active || sending) return;
    setSending(true);

    // Optimistic UI
    const optimistic = {
      _id: `opt-${Date.now()}`,
      message: text,
      senderId: user._id,
      receiverId: active._id,
      isCode,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setInput("");
    socket?.emit("typing", { senderId: user._id, receiverId: active._id, isTyping: false });

    try {
      const res = await axios.post(`/messages/${active._id}`, { message: text, isCode });
      const saved = res.data.data;
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved : m));
      // Emit via socket so receiver gets it in real-time
      socket?.emit("send_message", {
        senderId: user._id,
        receiverId: active._id,
        message: text,
        isCode,
        _id: saved._id,
        timestamp: saved.createdAt,
      });
      setLastMessages(prev => ({ ...prev, [active._id]: text }));
    } catch (e) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      toast(e.response?.data?.message || "Failed to send", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(false); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 10 * 1024 * 1024) { toast("Image must be under 10MB", "error"); return; }
    // ✅ Show editor BEFORE sending (WhatsApp style)
    setImageEditorFile(file);
  };

  const handleImageEditorSend = async (editedBlob, caption) => {
    if (!active) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("file", editedBlob, "image.jpg");
      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: fd,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const imageUrl = data.secure_url;
      // If caption provided, send caption after image
      const msgText = caption ? `__IMG__${imageUrl}\n${caption}` : `__IMG__${imageUrl}`;
      const optimistic = { _id: `opt-${Date.now()}`, message: msgText, senderId: user._id, receiverId: active._id, isCode: false, createdAt: new Date().toISOString(), optimistic: true };
      setMessages(prev => [...prev, optimistic]);
      setImageEditorFile(null);
      const saved = await axios.post(`/messages/${active._id}`, { message: msgText, isCode: false });
      setMessages(prev => prev.map(m => m._id === optimistic._id ? saved.data.data : m));
      socket?.emit("send_message", { senderId: user._id, receiverId: active._id, message: msgText, isCode: false, _id: saved.data.data._id, timestamp: saved.data.data.createdAt });
      toast("Image sent! ✅", "success");
    } catch (err) {
      setMessages(prev => prev.filter(m => !m.optimistic));
      toast("Image upload failed: " + err.message, "error");
    } finally { setSending(false); }
  };

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  const isOnline = (uid) => onlineUsers.includes(uid?.toString());

  return (
    <>
      {/* ✅ Image Editor Modal — shows before sending */}
      {imageEditorFile && (
        <ImageEditorModal
          file={imageEditorFile}
          onSend={handleImageEditorSend}
          onCancel={() => setImageEditorFile(null)}
        />
      )}
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px", height: "calc(100vh - 62px)", display: "flex", flexDirection: "column" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          <span style={{ color: "var(--green)" }}>Messages</span>
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text2)" }}>Real-time chat with your connections</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 200px", gap: "14px", flex: 1, minHeight: 0 }}>
        {/* Connections sidebar */}
        <div className="glass" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,255,135,0.08)", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "2px" }}>Connections</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: "24px", height: "24px", border: "2px solid rgba(0,255,135,0.2)", borderTopColor: "var(--green)", borderRadius: "50%" }} />
              </div>
            ) : connections.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <MessageSquare size={28} style={{ color: "var(--text3)", margin: "0 auto 10px" }} />
                <p style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)" }}>No connections yet</p>
                <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "6px" }}>Connect with developers on the Explore page</p>
              </div>
            ) : connections.map(c => (
              <div key={c._id}
                onClick={() => { setActive(c); navigate(`/chat/${c._id}`); }}
                style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", display: "flex", gap: "10px", alignItems: "center", background: active?._id === c._id ? "rgba(0,255,135,0.06)" : "transparent", borderLeft: active?._id === c._id ? "2px solid var(--green)" : "2px solid transparent", transition: "all .2s" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={getPhoto(c)} style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                  {isOnline(c._id) && (
                    <div className="online-dot" style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "7px", height: "7px", border: "1px solid var(--bg)" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.firstName}</p>
                    {isOnline(c._id) && <span style={{ fontSize: "9px", color: "var(--green)", fontFamily: "var(--mono)" }}>ONLINE</span>}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    {lastMessages[c._id] || c.about || "Say hello! 👋"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="glass" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {active ? (
            <>
              {/* Chat header */}
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,255,135,0.08)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <img src={getPhoto(active)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(0,255,135,0.2)", objectFit: "cover" }} />
                  {isOnline(active._id) && <div className="online-dot" style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "7px", height: "7px", border: "1px solid var(--bg)" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{active.firstName} {active.lastName}</p>
                  <p style={{ fontSize: "11px", color: isOnline(active._id) ? "var(--green)" : "var(--text3)", fontFamily: "var(--mono)" }}>
                    {isOnline(active._id) ? "● Online" : `● ${formatLastSeen(active._id) || "Offline"}`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button onClick={() => setSearchOpen(o => !o)} title="Search messages"
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"32px", height:"32px", borderRadius:"8px", background: searchOpen ? "rgba(0,255,135,0.15)" : "rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.25)", cursor:"pointer", color:"var(--green)" }}>
                    <Search size={13}/>
                  </button>
                  {active.skills?.slice(0, 2).map(s => <span key={s} className="tag-g" style={{ fontSize: "9px", padding: "1px 6px" }}>{s}</span>)}
                  <button
                    onClick={() => setActiveCall({ ...active, callType:"video" })}
                    title="Start video call"
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"32px", height:"32px", borderRadius:"8px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.25)", cursor:"pointer", color:"var(--green)" }}>
                    <Video size={14}/>
                  </button>
                  <button
                    onClick={() => setActiveCall({ ...active, callType:"audio" })}
                    title="Start voice call"
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"32px", height:"32px", borderRadius:"8px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.25)", cursor:"pointer", color:"var(--green)" }}>
                    <Phone size={14}/>
                  </button>
                </div>
              </div>

              {/* Search bar */}
              {searchOpen && (
                <div style={{ padding:"8px 16px", borderBottom:"1px solid rgba(0,255,135,0.08)", display:"flex", gap:"8px", alignItems:"center" }}>
                  <Search size={13} style={{ color:"var(--text3)", flexShrink:0 }}/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search messages..." autoFocus
                    className="inp" style={{ fontSize:"12px", padding:"6px 12px", flex:1 }}/>
                  {searchQ && <button onClick={()=>setSearchQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}><XIcon size={13}/></button>}
                  {searchQ && <span style={{ fontSize:"10px", color:"var(--text3)", fontFamily:"var(--mono)", flexShrink:0 }}>
                    {messages.filter(m=>m.message.toLowerCase().includes(searchQ.toLowerCase())).length} found
                  </span>}
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: "14px", color: "var(--text3)", marginBottom: "6px" }}>No messages yet</p>
                    <p style={{ fontSize: "12px", color: "var(--text3)" }}>Start the conversation with {active.firstName}! 👋</p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {messages.filter(m => !searchQ || m.message.toLowerCase().includes(searchQ.toLowerCase())).map(m => {
                    const isMine = m.senderId === user._id || m.senderId?.toString() === user._id?.toString();
                    return (
                      <motion.div key={m._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", gap: "10px", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end" }}>
                        <img src={isMine ? getPhoto(user) : getPhoto(active)}
                          style={{ width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
                        <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", gap: "3px", alignItems: isMine ? "flex-end" : "flex-start" }}>
                          {m.isCode ? (
                            <div className="code-block" style={{ maxWidth: "100%" }}>
                              <div className="code-header"><span>code</span></div>
                              <pre style={{ padding: "10px 14px", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{m.message}</pre>
                            </div>
                          ) : m.message.startsWith("__CALL__") ? (
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 14px", borderRadius:"10px", background:"rgba(0,255,135,0.04)", border:"1px solid rgba(0,255,135,0.15)", fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                              {m.message.replace("__CALL__","")}
                            </div>
                          ) : m.message.startsWith("__IMG__") ? (() => {
                              const parts = m.message.replace("__IMG__", "").split("\n");
                              const imgUrl = parts[0];
                              const cap = parts.slice(1).join("\n").trim();
                              return (
                                <div style={{ maxWidth: "240px" }}>
                                  <img src={imgUrl} alt="shared"
                                    style={{ width: "100%", borderRadius: cap ? "12px 12px 0 0" : "12px", border: "1px solid rgba(0,255,135,0.2)", cursor: "pointer", display: "block" }}
                                    onClick={() => window.open(imgUrl, "_blank")}
                                    onError={e => { e.target.style.display = "none"; }}
                                  />
                                  {cap && (
                                    <div style={{ padding: "8px 12px", background: "rgba(0,255,135,0.04)", border: "1px solid rgba(0,255,135,0.15)", borderTop: "none", borderRadius: "0 0 12px 12px", fontSize: "12px", color: "var(--text2)" }}>
                                      {cap}
                                    </div>
                                  )}
                                </div>
                              );
                            })() : (
                            <div className={isMine ? "chat-me" : "chat-ai"}
                              style={{ fontSize: "13px", color: "var(--text)", lineHeight: 1.6, wordBreak: "break-word" }}>
                              {m.message.includes("`")
                                ? <span dangerouslySetInnerHTML={{ __html: m.message.replace(/`([^`]+)`/g, "<code style='background:rgba(0,255,135,0.08);color:var(--green);padding:1px 5px;border-radius:4px;font-family:var(--mono);font-size:11px'>$1</code>") }} />
                                : m.message}
                            </div>
                          )}
                          <span style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "var(--mono)", display:"flex", alignItems:"center", gap:"3px" }}>
                            {formatTime(m.createdAt)}{m.optimistic ? " · sending..." : ""}
                            {isMine && !m.optimistic && (
                              readByPeer.has(m._id) || m.read
                                ? <CheckCheck size={12} style={{ color:"var(--green)" }}/>
                                : <Check size={12} style={{ color:"var(--text3)" }}/>
                            )}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                      <img src={getPhoto(active)} style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }} />
                      <div className="chat-ai" style={{ display: "flex", gap: "4px", alignItems: "center", padding: "10px 14px" }}>
                        {[0, 0.2, 0.4].map((d, i) => (
                          <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={endRef} />
              </div>

              {/* Input bar */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,255,135,0.08)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  {/* Image upload */}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  <button className="btn-ico" style={{ width: "36px", height: "36px", flexShrink: 0 }}
                    onClick={() => fileRef.current?.click()} title="Attach image">
                    <Paperclip size={14} />
                  </button>
                  {/* Send as code block */}
                  <button className="btn-ico" style={{ width: "36px", height: "36px", flexShrink: 0, background: input && "rgba(0,255,135,0.08)" }}
                    onClick={() => sendMsg(true)} title="Send as code block" disabled={!input.trim()}>
                    <Code size={14} />
                  </button>
                  <textarea
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={handleKey}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    className="inp"
                    rows={1}
                    style={{ flex: 1, resize: "none", minHeight: "36px", maxHeight: "120px", padding: "9px 14px", fontSize: "13px", lineHeight: 1.5 }}
                    onInput={e => { e.target.style.height = "36px"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
                    onClick={() => sendMsg(false)} disabled={!input.trim() || sending}
                    className="btn-prime"
                    style={{ height: "36px", width: "36px", padding: 0, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: (!input.trim() || sending) ? 0.5 : 1 }}>
                    {sending
                      ? <div style={{ width: "13px", height: "13px", border: "2px solid #040d08", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                      : <Send size={14} />}
                  </motion.button>
                </div>
                <p style={{ fontSize: "10px", color: "var(--text3)", marginTop: "6px", fontFamily: "var(--mono)" }}>
                  Enter to send · Shift+Enter for new line · &lt;/&gt; for code block
                </p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
              <MessageSquare size={40} style={{ color: "var(--text3)" }} />
              <p style={{ fontSize: "13px", color: "var(--text3)", fontFamily: "var(--mono)" }}>Select a connection to start chatting</p>
            </div>
          )}
        </div>

        {/* Right collaborator panel */}
        <div className="glass" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {active ? (
            <>
              <div style={{ padding: "14px", borderBottom: "1px solid rgba(0,255,135,0.08)", flexShrink: 0 }}>
                <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "2px" }}>Collaborator</p>
              </div>
              <div style={{ padding: "16px", textAlign: "center", overflowY: "auto", flex: 1 }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
                  <img src={getPhoto(active)} style={{ width: "60px", height: "60px", borderRadius: "16px", border: "2px solid rgba(0,255,135,0.25)", objectFit: "cover" }} />
                  {isOnline(active._id) && <div className="online-dot" style={{ position: "absolute", bottom: "-2px", right: "-2px", border: "2px solid var(--bg)" }} />}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{active.firstName} {active.lastName}</p>
                <span className={isOnline(active._id) ? "tag-g" : "tag-n"} style={{ fontSize: "10px", padding: "2px 8px" }}>
                  {isOnline(active._id) ? "Online" : "Offline"}
                </span>
                {active.about && <p style={{ fontSize: "11px", color: "var(--text2)", marginTop: "10px", lineHeight: 1.5, textAlign: "left" }}>{active.about}</p>}
                {active.githubStats && (
                  <div style={{ marginTop: "12px", padding: "10px", background: "rgba(0,255,135,0.04)", borderRadius: "10px", border: "1px solid rgba(0,255,135,0.1)" }}>
                    <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "6px", fontFamily: "var(--mono)", textTransform: "uppercase" }}>GitHub</p>
                    <p style={{ fontSize: "12px", color: "var(--green)", fontFamily: "var(--mono)" }}>⭐ {active.githubStats.totalStars} stars</p>
                    <p style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "var(--mono)" }}>📁 {active.githubStats.publicRepos} repos</p>
                  </div>
                )}
                {active.leetcodeStats && (
                  <div style={{ marginTop: "8px", padding: "10px", background: "rgba(251,146,60,0.04)", borderRadius: "10px", border: "1px solid rgba(251,146,60,0.1)" }}>
                    <p style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "6px", fontFamily: "var(--mono)", textTransform: "uppercase" }}>LeetCode</p>
                    <p style={{ fontSize: "12px", color: "#fb923c", fontFamily: "var(--mono)" }}>{active.leetcodeStats.totalSolved} solved</p>
                  </div>
                )}
                {active.skills?.length > 0 && (
                  <div style={{ marginTop: "12px", textAlign: "left" }}>
                    <p style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: "var(--mono)" }}>Skills</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {active.skills.slice(0, 6).map(s => <span key={s} className="tag-g" style={{ fontSize: "9px", padding: "2px 6px" }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "var(--mono)", textAlign: "center", padding: "16px" }}>Select a chat to see collaborator info</p>
            </div>
          )}
        </div>
      </div>
      {activeCall && (
        <VideoCallModal
          socket={socket}
          currentUser={user}
          peer={activeCall}
          incomingSignal={null}
          callType={activeCall.callType || "video"}
          onClose={async (durationSecs) => {
            setActiveCall(null);
            if (durationSecs > 0) {
              const callMsg = `__CALL__${activeCall.callType==="audio"?"🎙️ Voice":"📹 Video"} call ended • ${String(Math.floor(durationSecs/60)).padStart(2,"0")}:${String(durationSecs%60).padStart(2,"0")}`;
              try {
                const res = await axios.post(`/messages/${activeCall._id}`, { message: callMsg, isCode: false });
                setMessages(prev => [...prev, res.data.data]);
                socket?.emit("send_message", { senderId: user._id, receiverId: activeCall._id, message: callMsg, isCode: false, _id: res.data.data._id, timestamp: res.data.data.createdAt });
              } catch {}
            }
          }}
        />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
    </>
  );
}
