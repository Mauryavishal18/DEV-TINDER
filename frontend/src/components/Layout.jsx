import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useAuth from "../hooks/useAuth";
import OnboardingFlow from "./OnboardingFlow";
import IncomingCallModal from "./IncomingCallModal";
import VideoCallModal from "./VideoCallModal";
import { BASE_URL } from "../utils/constants";

let globalSocket = null;

export default function Layout() {
  const { loading } = useAuth();
  const user = useSelector(s=>s.user);
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null); // { from, fromName, signal }
  const [activeCall, setActiveCall] = useState(null); // peer user object

  useEffect(()=>{
    if (!user?._id || globalSocket) return;
    const s = io(BASE_URL, { withCredentials:true });
    globalSocket = s;
    s.emit("join", { userId:user._id });
    s.on("incoming_call", ({ from, fromName, signal, callType }) => {
      setIncomingCall({ from, fromName, signal, callType: callType || "video" });
    });
    setSocket(s);
    return ()=>{}; // Don't disconnect on Layout unmount — keep persistent
  }, [user?._id]);

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
      {/* Particles */}
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        {[8,18,30,55,70,82,93].map((l,i)=>(
          <div key={i} style={{ position:"absolute", width:"2px", height:"2px", borderRadius:"50%", background:"var(--green)", left:`${l}%`, top:`${65+i*5}%`, animation:`float ${9+i}s ${i*.8}s ease-in-out infinite` }}/>
        ))}
      </div>
      <OnboardingFlow/>
      {incomingCall && (
        <IncomingCallModal
          caller={{ name: incomingCall.fromName, _id: incomingCall.from }}
          callType={incomingCall.callType}
          onAccept={() => {
            setActiveCall({ _id: incomingCall.from, firstName: incomingCall.fromName, incomingSignal: incomingCall.signal, callType: incomingCall.callType });
            setIncomingCall(null);
          }}
          onReject={() => {
            socket?.emit("call_rejected", { to: incomingCall.from });
            setIncomingCall(null);
          }}
        />
      )}
      {activeCall && (
        <VideoCallModal
          socket={socket}
          currentUser={user}
          peer={activeCall}
          callType={activeCall.callType || "video"}
          incomingSignal={activeCall.incomingSignal}
          onClose={() => setActiveCall(null)}
        />
      )}
      <Navbar socket={socket}/>
      <main style={{ flex:1, position:"relative", zIndex:1 }}><Outlet context={{ socket }}/></main>
      <Footer/>
    </motion.div>
  );
}
