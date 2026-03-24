import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut, Send, Crop, Sun, Contrast, Sliders } from "lucide-react";

/**
 * ImageEditorModal — WhatsApp-style image editor before sending
 * Props:
 *   file      — File object selected by user
 *   onSend    — async (editedBlob, caption) => void
 *   onCancel  — () => void
 */
export default function ImageEditorModal({ file, onSend, onCancel }) {
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("adjust"); // adjust | crop
  const [imgSrc, setImgSrc] = useState(null);
  const imgObj = useRef(null);

  // Load image
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    const img = new Image();
    img.onload = () => {
      imgObj.current = img;
      drawCanvas(img, 0, 1, 100, 100);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const drawCanvas = useCallback((img, rot, sc, bri, con) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const maxW = 480, maxH = 380;
    let w = img.naturalWidth, h = img.naturalHeight;

    // Fit within max bounds
    if (w > maxW || h > maxH) {
      const r = Math.min(maxW / w, maxH / h);
      w = Math.round(w * r);
      h = Math.round(h * r);
    }

    const rad = (rot * Math.PI) / 180;
    const absC = Math.abs(Math.cos(rad)), absS = Math.abs(Math.sin(rad));
    const cw = Math.round(w * absC + h * absS);
    const ch = Math.round(w * absS + h * absC);

    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);

    ctx.filter = `brightness(${bri}%) contrast(${con}%)`;
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(rad);
    ctx.scale(sc, sc);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, []);

  useEffect(() => {
    if (imgObj.current) drawCanvas(imgObj.current, rotation, scale, brightness, contrast);
  }, [rotation, scale, brightness, contrast, drawCanvas]);

  const handleRotate = (dir) => {
    const next = (rotation + dir + 360) % 360;
    setRotation(next);
  };

  const handleSend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSending(true);
    try {
      const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.92));
      await onSend(blob, caption);
    } finally {
      setSending(false);
    }
  };

  const tabBtn = (id, icon, label) => (
    <button onClick={() => setTab(id)}
      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: "12px", fontWeight: 500, background: tab === id ? "rgba(0,255,135,.12)" : "transparent", color: tab === id ? "var(--green)" : "var(--text3)", transition: "all .2s" }}>
      {icon}{label}
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .92, opacity: 0 }}
          style={{ background: "rgba(7,21,16,.98)", border: "1px solid rgba(0,255,135,.18)", borderRadius: "20px", width: "100%", maxWidth: "560px", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.8)" }}>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,255,135,.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Edit Image</span>
            </div>
            <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "4px" }}>
              <X size={18} />
            </button>
          </div>

          {/* Canvas preview */}
          <div style={{ background: "#020905", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", padding: "16px", position: "relative" }}>
            <canvas ref={canvasRef}
              style={{ maxWidth: "100%", maxHeight: "380px", borderRadius: "8px", objectFit: "contain", display: "block" }} />
          </div>

          {/* Tabs */}
          <div style={{ padding: "10px 16px 0", display: "flex", gap: "4px", borderBottom: "1px solid rgba(0,255,135,.06)" }}>
            {tabBtn("adjust", <Sliders size={12} />, "Adjust")}
            {tabBtn("rotate", <RotateCw size={12} />, "Rotate")}
            {tabBtn("zoom", <ZoomIn size={12} />, "Zoom")}
          </div>

          {/* Controls */}
          <div style={{ padding: "16px 20px" }}>

            {tab === "adjust" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px" }}><Sun size={11} /> Brightness</span>
                    <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--mono)" }}>{brightness}%</span>
                  </div>
                  <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--green)", cursor: "pointer" }} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px" }}><Contrast size={11} /> Contrast</span>
                    <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--mono)" }}>{contrast}%</span>
                  </div>
                  <input type="range" min={50} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--green)", cursor: "pointer" }} />
                </div>
                <button onClick={() => { setBrightness(100); setContrast(100); }}
                  style={{ alignSelf: "flex-start", background: "none", border: "1px solid rgba(0,255,135,.15)", borderRadius: "7px", padding: "5px 12px", fontSize: "11px", color: "var(--text3)", cursor: "pointer", fontFamily: "var(--font)" }}>
                  Reset adjustments
                </button>
              </div>
            )}

            {tab === "rotate" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => handleRotate(-90)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(0,255,135,.2)", background: "rgba(0,255,135,.06)", color: "var(--green)", cursor: "pointer", fontFamily: "var(--font)", fontSize: "13px" }}>
                  <RotateCcw size={14} /> Rotate Left
                </button>
                <span style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)", minWidth: "40px", textAlign: "center" }}>{rotation}°</span>
                <button onClick={() => handleRotate(90)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(0,255,135,.2)", background: "rgba(0,255,135,.06)", color: "var(--green)", cursor: "pointer", fontFamily: "var(--font)", fontSize: "13px" }}>
                  <RotateCw size={14} /> Rotate Right
                </button>
              </div>
            )}

            {tab === "zoom" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px" }}><ZoomIn size={11} /> Scale</span>
                  <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--mono)" }}>{(scale * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min={50} max={200} value={scale * 100} onChange={e => setScale(Number(e.target.value) / 100)}
                  style={{ width: "100%", accentColor: "var(--green)", cursor: "pointer" }} />
                <button onClick={() => setScale(1)}
                  style={{ marginTop: "8px", background: "none", border: "1px solid rgba(0,255,135,.15)", borderRadius: "7px", padding: "5px 12px", fontSize: "11px", color: "var(--text3)", cursor: "pointer", fontFamily: "var(--font)" }}>
                  Reset zoom
                </button>
              </div>
            )}
          </div>

          {/* Caption + Send */}
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Add a caption... (optional)"
              style={{ background: "rgba(0,255,135,.03)", border: "1px solid rgba(0,255,135,.15)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)", outline: "none", width: "100%" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onCancel}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid rgba(0,255,135,.15)", background: "transparent", color: "var(--text2)", cursor: "pointer", fontFamily: "var(--font)", fontSize: "13px" }}>
                Cancel
              </button>
              <button onClick={handleSend} disabled={sending}
                style={{ flex: 2, padding: "11px", borderRadius: "10px", border: "none", background: "var(--green)", color: "#040d08", cursor: sending ? "not-allowed" : "pointer", fontFamily: "var(--font)", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: sending ? .7 : 1 }}>
                <Send size={14} />
                {sending ? "Sending..." : "Send Image"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
