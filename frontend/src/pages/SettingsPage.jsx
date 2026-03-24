import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Trash2, Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import axios from "axios";
import { removeUser, clearFeed, clearConnections } from "../utils/store";
import { useToast } from "../components/ToastProvider";
import useTheme from "../hooks/useTheme";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [deletePass, setDeletePass] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) { toast("Fill all fields", "error"); return; }
    if (pwForm.newPw.length < 8) { toast("New password min 8 chars", "error"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast("Passwords don't match", "error"); return; }
    setPwLoading(true);
    try {
      await axios.post("/user/change-password", { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess(true);
      setPwForm({ current: "", newPw: "", confirm: "" });
      toast("Password changed! ✅", "success");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch(e) { toast(e.response?.data?.message || "Failed", "error"); }
    finally { setPwLoading(false); }
  };

  const deleteAccount = async () => {
    if (!deletePass) { toast("Enter your password", "error"); return; }
    setDeleteLoading(true);
    try {
      await axios.delete("/user/account", { data: { password: deletePass } });
      dispatch(removeUser());
      dispatch(clearFeed());
      dispatch(clearConnections());
      toast("Account deleted. Goodbye! 👋", "info");
      navigate("/login");
    } catch(e) { toast(e.response?.data?.message || "Failed", "error"); }
    finally { setDeleteLoading(false); }
  };

  const inp = { background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"10px", padding:"11px 14px", fontSize:"13px", color:"var(--text)", fontFamily:"var(--font)", outline:"none", width:"100%" };
  const lbl = { fontSize:"11px", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"var(--mono)", display:"block", marginBottom:"7px" };

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
          <span style={{ color:"var(--green)" }}>Settings</span>
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Manage your account preferences and security</p>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="glass" style={{ padding:"24px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>Appearance</h2>
            <p style={{ fontSize:"13px", color:"var(--text2)" }}>Current theme: <span style={{ color:"var(--green)", fontFamily:"var(--mono)" }}>{theme}</span></p>
          </div>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
            onClick={toggleTheme} className="btn-prime" style={{ padding:"10px 20px", fontSize:"13px" }}>
            Switch to {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </motion.button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        className="glass" style={{ padding:"24px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"rgba(0,255,135,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Lock size={16} color="var(--green)" />
          </div>
          <div>
            <h2 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)" }}>Change Password</h2>
            <p style={{ fontSize:"12px", color:"var(--text3)" }}>Update your account password</p>
          </div>
        </div>

        <AnimatePresence>
          {pwSuccess && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderRadius:"8px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.2)", marginBottom:"14px" }}>
              <CheckCircle size={14} color="var(--green)" />
              <span style={{ fontSize:"13px", color:"var(--green)" }}>Password changed successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div>
            <label style={lbl}>Current Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw.current ? "text" : "password"} value={pwForm.current}
                onChange={e => setPwForm(p => ({...p, current:e.target.value}))}
                placeholder="Your current password" style={{ ...inp, paddingRight:"38px" }} />
              <button onClick={() => setShowPw(p => ({...p, current:!p.current}))}
                style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>
                {showPw.current ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>
          <div>
            <label style={lbl}>New Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw.new ? "text" : "password"} value={pwForm.newPw}
                onChange={e => setPwForm(p => ({...p, newPw:e.target.value}))}
                placeholder="Min 8 characters" style={{ ...inp, paddingRight:"38px" }} />
              <button onClick={() => setShowPw(p => ({...p, new:!p.new}))}
                style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>
                {showPw.new ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {pwForm.newPw && (
              <p style={{ fontSize:"11px", marginTop:"4px", fontFamily:"var(--mono)", color: pwForm.newPw.length<8?"#f87171":pwForm.newPw.length<12?"#fb923c":"var(--green)" }}>
                {pwForm.newPw.length<8?"Too weak":pwForm.newPw.length<12?"Medium":"Strong ✓"}
              </p>
            )}
          </div>
          <div>
            <label style={lbl}>Confirm New Password</label>
            <input type="password" value={pwForm.confirm}
              onChange={e => setPwForm(p => ({...p, confirm:e.target.value}))}
              placeholder="Repeat new password"
              style={{ ...inp, borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "rgba(248,113,113,0.4)" : undefined }} />
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
            onClick={changePassword} disabled={pwLoading}
            className="btn-prime" style={{ padding:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            {pwLoading ? <div style={{ width:"14px", height:"14px", border:"2px solid #040d08", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Lock size={14}/>}
            {pwLoading ? "Changing..." : "Change Password"}
          </motion.button>
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
        className="glass" style={{ padding:"20px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
          <Shield size={16} color="var(--green)" />
          <h2 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)" }}>Security Tips</h2>
        </div>
        {[
          "Use a strong password with letters, numbers, and symbols",
          "Never share your password with anyone",
          "Add your GitHub and LeetCode to increase your Dev Score",
          "Enable 2-Step Verification on your Gmail for extra security",
        ].map((tip, i) => (
          <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
            <span style={{ color:"var(--green)", marginTop:"2px", flexShrink:0 }}>▸</span>
            <p style={{ fontSize:"13px", color:"var(--text2)" }}>{tip}</p>
          </div>
        ))}
      </motion.div>

      {/* Delete Account */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
        style={{ padding:"24px", borderRadius:"16px", border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"rgba(239,68,68,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Trash2 size={16} color="#f87171" />
          </div>
          <div>
            <h2 style={{ fontSize:"15px", fontWeight:700, color:"#f87171" }}>Delete Account</h2>
            <p style={{ fontSize:"12px", color:"var(--text3)" }}>Permanently delete your DevTinder account</p>
          </div>
        </div>
        <div style={{ padding:"12px 14px", borderRadius:"8px", background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)", marginBottom:"16px" }}>
          <div style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
            <AlertTriangle size={14} color="#f87171" style={{ marginTop:"2px", flexShrink:0 }} />
            <p style={{ fontSize:"12px", color:"#fca5a5", lineHeight:1.6 }}>
              This action is <strong>irreversible</strong>. All your data, connections, messages, and profile will be permanently deleted.
            </p>
          </div>
        </div>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            style={{ padding:"10px 20px", borderRadius:"10px", background:"transparent", border:"1px solid rgba(239,68,68,0.35)", color:"#f87171", fontSize:"13px", cursor:"pointer", fontFamily:"var(--font)", transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
            Delete My Account
          </button>
        ) : (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            <label style={{ ...lbl, color:"#f87171" }}>Enter password to confirm</label>
            <div style={{ position:"relative", marginBottom:"12px" }}>
              <input type={showDeletePass ? "text" : "password"} value={deletePass}
                onChange={e => setDeletePass(e.target.value)}
                placeholder="Your current password"
                style={{ ...inp, borderColor:"rgba(239,68,68,0.3)", paddingRight:"38px" }} />
              <button onClick={() => setShowDeletePass(!showDeletePass)}
                style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)" }}>
                {showDeletePass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeletePass(""); }}
                className="btn-sec" style={{ flex:1 }}>Cancel</button>
              <button onClick={deleteAccount} disabled={deleteLoading || !deletePass}
                style={{ flex:1, padding:"11px", borderRadius:"10px", background:"rgba(239,68,68,0.85)", border:"none", color:"white", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"var(--font)", display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", opacity: (!deletePass || deleteLoading) ? 0.6 : 1 }}>
                {deleteLoading ? <div style={{ width:"14px", height:"14px", border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }}/> : <Trash2 size={14}/>}
                {deleteLoading ? "Deleting..." : "Yes, Delete Everything"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
