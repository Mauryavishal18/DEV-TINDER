import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, X, Check } from "lucide-react";
import { AVATARS, getAvatarUrl } from "../utils/constants";

export default function AvatarPicker({ currentUser, onSelect, onUpload }) {
  const [tab, setTab] = useState("avatar");
  const [selected, setSelected] = useState(currentUser?.avatarSeed || "felix");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { await onUpload(file); }
    finally { setUploading(false); }
  };

  const handleAvatarSelect = (seed) => {
    setSelected(seed);
    onSelect(seed);
  };

  const tabStyle = (t) => ({
    padding:"8px 20px", borderRadius:"8px", fontSize:"13px", fontWeight:500,
    cursor:"pointer", border:"none", fontFamily:"var(--font)", transition:"all .2s",
    background: tab===t ? "rgba(0,255,135,.12)" : "transparent",
    color: tab===t ? "var(--green)" : "var(--text3)",
    boxShadow: tab===t ? "0 0 0 1px rgba(0,255,135,.2)" : "none",
  });

  return (
    <div>
      <div style={{ display:"flex", gap:"4px", background:"rgba(0,255,135,.04)", border:"1px solid rgba(0,255,135,.1)", borderRadius:"10px", padding:"4px", marginBottom:"16px" }}>
        <button style={tabStyle("avatar")} onClick={() => setTab("avatar")}><Camera size={13} style={{ display:"inline", marginRight:"5px", verticalAlign:"middle" }}/>Choose Avatar</button>
        <button style={tabStyle("upload")} onClick={() => setTab("upload")}><Upload size={13} style={{ display:"inline", marginRight:"5px", verticalAlign:"middle" }}/>Upload Photo</button>
      </div>

      {tab === "avatar" && (
        <div>
          <p style={{ fontSize:"12px", color:"var(--text3)", marginBottom:"12px", fontFamily:"var(--mono)" }}>Choose your developer avatar:</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:"8px" }}>
            {AVATARS.map(a => (
              <motion.div key={a.seed} whileHover={{ scale:1.08 }} whileTap={{ scale:.95 }}
                onClick={() => handleAvatarSelect(a.seed)}
                style={{ cursor:"pointer", borderRadius:"10px", overflow:"hidden", border:`2px solid ${selected===a.seed ? "var(--green)" : "transparent"}`, boxShadow:selected===a.seed ? "0 0 12px rgba(0,255,135,.3)" : "none", position:"relative", transition:"all .2s" }}>
                <img src={getAvatarUrl(a.seed)} style={{ width:"100%", aspectRatio:"1", background:"rgba(0,255,135,.05)" }}/>
                {selected===a.seed && (
                  <div style={{ position:"absolute", bottom:"2px", right:"2px", width:"16px", height:"16px", borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Check size={9} color="#040d08"/>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {tab === "upload" && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleUpload}/>
          <div onClick={() => fileRef.current.click()}
            style={{ border:"2px dashed rgba(0,255,135,.2)", borderRadius:"12px", padding:"32px", textAlign:"center", cursor:"pointer", transition:"all .2s", background:"rgba(0,255,135,.02)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,255,135,.4)"; e.currentTarget.style.background="rgba(0,255,135,.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(0,255,135,.2)"; e.currentTarget.style.background="rgba(0,255,135,.02)"; }}>
            {uploading ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"28px", height:"28px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
                <p style={{ fontSize:"13px", color:"var(--text2)" }}>Uploading...</p>
              </div>
            ) : (
              <>
                <Upload size={32} color="var(--green)" style={{ margin:"0 auto 12px" }}/>
                <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>Click to upload photo</p>
                <p style={{ fontSize:"12px", color:"var(--text3)" }}>JPG, PNG up to 5MB</p>
              </>
            )}
          </div>
          {currentUser?.photoUrl && !currentUser.useAvatar && (
            <div style={{ marginTop:"12px", display:"flex", alignItems:"center", gap:"10px", padding:"10px", background:"rgba(0,255,135,.04)", border:"1px solid rgba(0,255,135,.1)", borderRadius:"8px" }}>
              <img src={currentUser.photoUrl.startsWith("/uploads") ? `http://localhost:3000${currentUser.photoUrl}` : currentUser.photoUrl}
                style={{ width:"36px", height:"36px", borderRadius:"8px", objectFit:"cover" }}/>
              <p style={{ fontSize:"12px", color:"var(--green)" }}>✓ Current photo uploaded</p>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
