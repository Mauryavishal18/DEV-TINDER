import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

export default function IncomingCallModal({ caller, callType="video", onAccept, onReject }) {
  if (!caller) return null;

  const photo = caller.photoUrl
    ? (caller.photoUrl.startsWith("http") ? caller.photoUrl : `${BASE_URL}${caller.photoUrl}`)
    : getAvatarUrl(caller.avatarSeed || caller.name || "dev");

  const typeLabel = callType === "audio" ? "🎙️ Voice Call" : "📹 Video Call";
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0, y:-20, scale:0.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:-20, scale:0.95 }}
        style={{
          position:"fixed", top:"24px", right:"24px", zIndex:10001,
          background:"rgba(7,21,16,0.97)", border:"1px solid rgba(0,255,135,0.3)",
          borderRadius:"20px", padding:"20px 24px", width:"280px",
          backdropFilter:"blur(20px)", boxShadow:"0 20px 60px rgba(0,0,0,0.7)",
        }}>
        {/* Pulsing ring */}
        <div style={{ position:"absolute", inset:0, borderRadius:"20px", border:"2px solid rgba(0,255,135,0.15)", animation:"ring 1.5s ease-in-out infinite" }}/>

        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
          <div style={{ position:"relative" }}>
            <img src={photo} style={{ width:"48px", height:"48px", borderRadius:"12px", objectFit:"cover", border:"2px solid rgba(0,255,135,0.3)" }}/>
            <motion.div
              animate={{ scale:[1,1.2,1] }} transition={{ duration:1, repeat:Infinity }}
              style={{ position:"absolute", inset:"-3px", borderRadius:"14px", border:"2px solid rgba(0,255,135,0.4)", pointerEvents:"none" }}/>
          </div>
          <div>
            <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{caller.name || "Developer"}</p>
            <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <motion.div animate={{ opacity:[1,0,1] }} transition={{ duration:1.2, repeat:Infinity }}
                style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--green)" }}/>
              <p style={{ fontSize:"11px", color:"var(--green)", fontFamily:"var(--mono)" }}>Incoming video call</p>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px" }}>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
            onClick={onReject}
            style={{ flex:1, padding:"11px", borderRadius:"12px", background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", fontSize:"13px", fontFamily:"var(--font)", fontWeight:600 }}>
            <PhoneOff size={15}/> Decline
          </motion.button>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
            onClick={onAccept}
            style={{ flex:1.2, padding:"11px", borderRadius:"12px", background:"var(--green)", border:"none", color:"#040d08", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", fontSize:"13px", fontFamily:"var(--font)", fontWeight:700 }}>
            <Phone size={15}/> Accept
          </motion.button>
        </div>
        <style>{`@keyframes ring{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.8;transform:scale(1.02)}}`}</style>
      </motion.div>
    </AnimatePresence>
  );
}
