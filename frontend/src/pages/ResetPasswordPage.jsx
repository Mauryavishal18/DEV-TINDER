import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Zap } from "lucide-react";
import axios from "axios";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, email]);

  const handleReset = async () => {
    if (!newPass || newPass.length < 8) { setError("Password min 8 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      await axios.post("/reset-password", { token, emailId: decodeURIComponent(email), newPassword: newPass });
      setDone(true);
    } catch(e) { setError(e.response?.data?.message || "Reset failed. Link may be expired."); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: "rgba(0,255,135,0.03)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "var(--text)", fontFamily: "var(--font)", outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 25px rgba(0,255,135,0.5)" }}>
          <Zap size={20} color="#040d08" fill="#040d08" />
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "2px", color: "var(--text)", fontFamily: "var(--mono)" }}>
          DEV<span style={{ color: "var(--green)" }}>TINDER</span>
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "420px", background: "rgba(7,21,16,0.9)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ height: "2px", background: "linear-gradient(90deg,transparent,var(--green),transparent)" }} />
        <div style={{ padding: "36px" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <motion.div animate={{ scale: [0.8, 1.1, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</motion.div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--green)", marginBottom: "8px" }}>Password Reset!</h1>
              <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "24px" }}>Your password has been updated successfully.</p>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate("/login")} className="btn-prime" style={{ width: "100%", padding: "13px" }}>
                Login Now →
              </motion.button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Lock size={22} color="var(--green)" />
                </div>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Set New Password</h1>
                {email && <p style={{ fontSize: "12px", color: "var(--green)", fontFamily: "var(--mono)" }}>{decodeURIComponent(email)}</p>}
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>New Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--green)" }} />
                  <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                    placeholder="Min 8 characters" style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "40px" }} disabled={!token} autoFocus />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {newPass && <p style={{ fontSize: "10px", marginTop: "4px", fontFamily: "var(--mono)", color: newPass.length < 8 ? "#f87171" : newPass.length < 12 ? "#fb923c" : "var(--green)" }}>{newPass.length < 8 ? "Too weak" : newPass.length < 12 ? "Medium" : "Strong ✓"}</p>}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--green)" }} />
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()}
                    placeholder="Repeat password" disabled={!token}
                    style={{ ...inputStyle, paddingLeft: "40px", borderColor: confirmPass && confirmPass !== newPass ? "rgba(248,113,113,0.4)" : undefined }} />
                </div>
              </div>

              {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "12px", color: "#f87171", marginBottom: "14px" }}>⚠ {error}</div>}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleReset} disabled={loading || !token || !newPass || !confirmPass}
                className="btn-prime" style={{ width: "100%", padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: (!token || !newPass || !confirmPass) ? 0.5 : 1 }}>
                {loading ? <div style={{ width: "16px", height: "16px", border: "2px solid #040d08", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> : <Lock size={15} />}
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text3)", marginTop: "16px" }}>
                <Link to="/forgot-password" style={{ color: "var(--green)", textDecoration: "none" }}>Request new reset link →</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
