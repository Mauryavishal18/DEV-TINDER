import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { getAvatarUrl, BASE_URL } from "../utils/constants";

export default function VideoCallModal({ socket, currentUser, peer, incomingSignal, callType = "video", onClose }) {
  const localRef  = useRef(null);
  const remoteRef = useRef(null);
  const pcRef     = useRef(null);
  const streamRef = useRef(null);
  const durationRef = useRef(0);
  const timerRef  = useRef(null);

  const [callState, setCallState] = useState(incomingSignal ? "connecting" : "calling");
  const [micOn,  setMicOn]  = useState(true);
  const [camOn,  setCamOn]  = useState(true);
  const [duration, setDuration] = useState(0);

  const peerPhoto = peer?.useAvatar === false && peer?.photoUrl
    ? (peer.photoUrl.startsWith("http") ? peer.photoUrl : `${BASE_URL}${peer.photoUrl}`)
    : getAvatarUrl(peer?.avatarSeed || peer?.firstName || "dev");

  const ICE = { iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ]};

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setDuration(durationRef.current);
    }, 1000);
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
  };

  const createPC = (stream) => {
    const pc = new RTCPeerConnection(ICE);
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = e => {
      if (remoteRef.current && e.streams[0]) remoteRef.current.srcObject = e.streams[0];
    };
    pc.onicecandidate = e => {
      if (e.candidate && socket) {
        socket.emit("ice_candidate", { to: peer._id, candidate: e.candidate });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallState("connected");
        startTimer();
      }
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        setCallState("ended");
      }
    };
    return pc;
  };

  const getMedia = async () => {
    const constraints = callType === "audio" ? { audio: true, video: false } : { audio: true, video: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    if (localRef.current && callType !== "audio") localRef.current.srcObject = stream;
    return stream;
  };

  const startCall = async () => {
    try {
      const stream = await getMedia();
      const pc = createPC(stream);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: callType !== "audio" });
      await pc.setLocalDescription(offer);
      socket.emit("call_user", { to: peer._id, from: currentUser._id, fromName: currentUser.firstName, signal: pc.localDescription, callType });
    } catch (e) {
      console.error("startCall error:", e);
      alert("Camera/Microphone access denied. Please allow permissions in browser and try again.");
      onClose(0);
    }
  };

  const acceptCall = async (signal) => {
    try {
      const stream = await getMedia();
      const pc = createPC(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call_accepted", { to: peer._id, signal: pc.localDescription });
      setCallState("connected");
      startTimer();
    } catch (e) {
      console.error("acceptCall error:", e);
      onClose(0);
    }
  };

  useEffect(() => {
    if (!socket || !peer?._id) return;

    const handleAccepted = async ({ signal }) => {
      try {
        if (pcRef.current && pcRef.current.signalingState !== "closed") {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          setCallState("connected");
          startTimer();
        }
      } catch (e) { console.error("handleAccepted error:", e); }
    };

    const handleRejected = () => {
      setCallState("ended");
      cleanup();
      setTimeout(() => onClose(0), 1000);
    };

    const handleEnded = () => {
      setCallState("ended");
      cleanup();
      setTimeout(() => onClose(durationRef.current), 1000);
    };

    const handleIce = async ({ candidate }) => {
      try {
        if (pcRef.current && pcRef.current.remoteDescription && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch {}
    };

    socket.on("call_accepted",  handleAccepted);
    socket.on("call_rejected",  handleRejected);
    socket.on("call_ended",     handleEnded);
    socket.on("ice_candidate",  handleIce);

    if (incomingSignal) acceptCall(incomingSignal);
    else startCall();

    return () => {
      socket.off("call_accepted",  handleAccepted);
      socket.off("call_rejected",  handleRejected);
      socket.off("call_ended",     handleEnded);
      socket.off("ice_candidate",  handleIce);
    };
  }, []);  // run once on mount

  const hangUp = () => {
    cleanup();
    socket?.emit("call_ended", { to: peer._id });
    onClose(durationRef.current);
  };

  const toggleMic = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMicOn(t.enabled); }
  };

  const toggleCam = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCamOn(t.enabled); }
  };

  const statusText = { calling: "📞 Calling...", connecting: "Connecting...", connected: "", ended: "Call Ended" };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)", zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>

        {/* Video area */}
        <div style={{ position: "relative", width: "100%", maxWidth: "780px", aspectRatio: "16/9", background: "#061209", borderRadius: "18px", overflow: "hidden" }}>
          {/* Remote video */}
          {callType !== "audio" && (
            <video ref={remoteRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}

          {/* Center overlay — avatar + status */}
          {(callState !== "connected" || callType === "audio") && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", background: callType === "audio" ? "rgba(4,13,8,0.97)" : "rgba(4,13,8,0.92)" }}>
              <motion.div
                animate={callState === "calling" ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", border: `3px solid ${callState === "connected" ? "var(--green)" : "rgba(0,255,135,0.45)"}`, boxShadow: callState === "connected" ? "0 0 24px rgba(0,255,135,0.5)" : "none" }}>
                <img src={peerPhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </motion.div>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#e0ffe8" }}>{peer?.firstName} {peer?.lastName || ""}</p>
              {callState !== "connected" && (
                <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ fontSize: "14px", color: "var(--green)", fontFamily: "monospace" }}>
                  {statusText[callState] || "..."}
                </motion.p>
              )}
              {callState === "connected" && callType === "audio" && (
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: "54px", height: "54px", borderRadius: "50%", background: "rgba(0,255,135,0.12)", border: "1px solid rgba(0,255,135,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mic size={22} color="var(--green)" />
                </motion.div>
              )}
            </div>
          )}

          {/* Timer */}
          {callState === "connected" && (
            <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", padding: "4px 14px", background: "rgba(0,0,0,0.65)", borderRadius: "20px", fontSize: "13px", color: "var(--green)", fontFamily: "monospace", fontWeight: 700 }}>
              ● {fmtTime(duration)}
            </div>
          )}
        </div>

        {/* Local video pip */}
        {callType !== "audio" && (
          <div style={{ position: "absolute", bottom: "96px", right: "24px", width: "150px", aspectRatio: "4/3", background: "#061209", borderRadius: "10px", overflow: "hidden", border: "2px solid rgba(0,255,135,0.3)" }}>
            <video ref={localRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            {!camOn && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)" }}><VideoOff size={20} color="#888" /></div>}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={toggleMic}
            style={{ width: "52px", height: "52px", borderRadius: "50%", background: micOn ? "rgba(0,255,135,0.12)" : "rgba(239,68,68,0.2)", border: `1px solid ${micOn ? "rgba(0,255,135,0.35)" : "rgba(239,68,68,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {micOn ? <Mic size={20} color="var(--green)" /> : <MicOff size={20} color="#f87171" />}
          </motion.button>

          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={hangUp}
            style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(220,38,38,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <PhoneOff size={26} color="white" />
          </motion.button>

          {callType !== "audio" && (
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={toggleCam}
              style={{ width: "52px", height: "52px", borderRadius: "50%", background: camOn ? "rgba(0,255,135,0.12)" : "rgba(239,68,68,0.2)", border: `1px solid ${camOn ? "rgba(0,255,135,0.35)" : "rgba(239,68,68,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {camOn ? <Video size={20} color="var(--green)" /> : <VideoOff size={20} color="#f87171" />}
            </motion.button>
          )}
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          {callType === "audio" ? "🎙️ Voice Call" : "📹 Video Call"} • {peer?.firstName}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
