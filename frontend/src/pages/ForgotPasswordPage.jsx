import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Zap, ArrowLeft, KeyRound, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import axios from "axios";

const STEPS = ["email", "method", "verify", "reset", "done"];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [method, setMethod] = useState(null); // "otp" | "link"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const t = setInterval(() => {
      setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email) { setError("Enter your email"); return; }
    setLoading(true); setError("");
    try {
      const r = await axios.post("/forgot-password/send-otp", { emailId: email });
      setInfo(r.data.message);
      setStep("verify"); setMethod("otp");
      startResendTimer();
    } catch(e) { setError(e.response?.data?.message || "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const handleSendLink = async () => {
    if (!email) { setError("Enter your email"); return; }
    setLoading(true); setError("");
    try {
      const r = await axios.post("/forgot-password/send-link", { emailId: email });
      setInfo(r.data.message);
      setStep("link_sent");
    } catch(e) { setError(e.response?.data?.message || "Failed to send link"); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError("Enter 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      const r = await axios.post("/forgot-password/verify-otp", { emailId: email, otp });
      setSessionToken(r.data.sessionToken);
      setStep("reset");
    } catch(e) { setError(e.response?.data?.message || "Invalid OTP"); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!newPass || newPass.length < 8) { setError("Password min 8 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      await axios.post("/reset-password", { emailId: email, sessionToken, newPassword: newPass });
      setStep("done");
    } catch(e) { setError(e.response?.data?.message || "Reset failed"); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: "rgba(0,255,135,0.03)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "var(--text)", fontFamily: "var(--font)", outline: "none", width: "100%" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(0,255,135,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 25px rgba(0,255,135,0.5)" }}>
          <Zap size={20} color="#040d08" fill="#040d08" />
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "2px", color: "var(--text)", fontFamily: "var(--mono)" }}>
          DEV<span style={{ color: "var(--green)" }}>TINDER</span>
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ width: "100%", maxWidth: "420px", background: "rgba(7,21,16,0.9)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ height: "2px", background: "linear-gradient(90deg,transparent,var(--green),transparent)" }} />

        <div style={{ padding: "32px" }}>
          {/* Back button */}
          {step !== "done" && (
            <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text3)", textDecoration: "none", marginBottom: "20px", fontFamily: "var(--mono)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--green)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>
              <ArrowLeft size={12} /> Back to Login
            </Link>
          )}

          <AnimatePresence mode="wait">

            {/* STEP 1: Enter Email */}
            {step === "email" && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Mail size={22} color="var(--green)" />
                  </div>
                  <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Forgot Password?</h1>
                  <p style={{ fontSize: "13px", color: "var(--text3)" }}>Enter your registered email address</p>
                </div>
                <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>Email Address</label>
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--green)" }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && setStep("method")}
                    placeholder="your@email.com" style={{ ...inputStyle, paddingLeft: "40px" }} autoFocus />
                </div>
                {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "12px", color: "#f87171", marginBottom: "14px" }}>⚠ {error}</div>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { if (!email || !email.includes("@")) { setError("Enter valid email"); return; } setError(""); setStep("method"); }}
                  className="btn-prime" style={{ width: "100%", padding: "13px" }}>
                  Continue →
                </motion.button>
              </motion.div>
            )}

            {/* STEP 2: Choose Method */}
            {step === "method" && (
              <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>How to Reset?</h1>
                  <p style={{ fontSize: "13px", color: "var(--text3)" }}>Choose your preferred method</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {/* OTP Option */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setMethod("otp"); handleSendOTP(); }}
                    style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(0,255,135,0.2)", background: "rgba(0,255,135,0.04)", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,255,135,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,255,135,0.2)"}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(0,255,135,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <KeyRound size={18} color="var(--green)" />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Send OTP</p>
                        <p style={{ fontSize: "12px", color: "var(--text3)" }}>6-digit code sent to your email. Valid 10 min.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Reset Link Option */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setMethod("link"); handleSendLink(); }}
                    style={{ padding: "18px", borderRadius: "14px", border: "1px solid rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.04)", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.2)"}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(167,139,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Mail size={18} color="#a78bfa" />
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "3px" }}>Send Reset Link</p>
                        <p style={{ fontSize: "12px", color: "var(--text3)" }}>Magic link sent to your email. Valid 1 hour.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {loading && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "10px" }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,255,135,0.2)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                    <span style={{ fontSize: "13px", color: "var(--text3)" }}>Sending...</span>
                  </div>
                )}
                {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "12px", color: "#f87171" }}>⚠ {error}</div>}
              </motion.div>
            )}

            {/* STEP 3: Verify OTP */}
            {step === "verify" && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <KeyRound size={22} color="var(--green)" />
                  </div>
                  <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Enter OTP</h1>
                  <p style={{ fontSize: "13px", color: "var(--text3)" }}>6-digit code sent to</p>
                  <p style={{ fontSize: "13px", color: "var(--green)", fontFamily: "var(--mono)", fontWeight: 600 }}>{email}</p>
                </div>

                {info && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(0,255,135,0.08)", border: "1px solid rgba(0,255,135,0.2)", fontSize: "12px", color: "var(--green)", marginBottom: "14px" }}>✓ {info}</div>}

                <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>OTP Code</label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && handleVerifyOTP()}
                  placeholder="• • • • • •"
                  maxLength={6}
                  style={{ ...inputStyle, textAlign: "center", fontSize: "28px", letterSpacing: "12px", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: "16px" }}
                  autoFocus
                />

                {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "12px", color: "#f87171", marginBottom: "14px" }}>⚠ {error}</div>}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
                  className="btn-prime" style={{ width: "100%", padding: "13px", marginBottom: "12px", opacity: otp.length !== 6 ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {loading ? <div style={{ width: "16px", height: "16px", border: "2px solid #040d08", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> : <KeyRound size={15} />}
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>

                <button onClick={resendTimer > 0 ? null : handleSendOTP} disabled={resendTimer > 0 || loading}
                  style={{ width: "100%", padding: "10px", background: "transparent", border: "none", fontSize: "13px", color: resendTimer > 0 ? "var(--text3)" : "var(--green)", cursor: resendTimer > 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font)" }}>
                  <RefreshCw size={13} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </motion.div>
            )}

            {/* Link Sent */}
            {step === "link_sent" && (
              <motion.div key="link_sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "52px", marginBottom: "16px" }}>📧</div>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>Check Your Email!</h1>
                <p style={{ fontSize: "13px", color: "var(--text2)", lineHeight: 1.7, marginBottom: "8px" }}>
                  A password reset link has been sent to:
                </p>
                <p style={{ fontSize: "14px", color: "var(--green)", fontFamily: "var(--mono)", fontWeight: 600, marginBottom: "20px" }}>{email}</p>
                <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "20px" }}>Link valid for 1 hour. Check your spam folder too.</p>
                <Link to="/login">
                  <button className="btn-prime" style={{ width: "100%", padding: "12px" }}>Back to Login</button>
                </Link>
              </motion.div>
            )}

            {/* STEP 4: Set New Password */}
            {step === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Lock size={22} color="var(--green)" />
                  </div>
                  <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>Set New Password</h1>
                  <p style={{ fontSize: "13px", color: "var(--text3)" }}>Create a strong new password</p>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--green)" }} />
                    <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                      placeholder="Min 8 characters" style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "40px" }} autoFocus />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {newPass && (
                    <p style={{ fontSize: "10px", marginTop: "4px", fontFamily: "var(--mono)", color: newPass.length < 8 ? "#f87171" : newPass.length < 12 ? "#fb923c" : "var(--green)" }}>
                      {newPass.length < 8 ? "Too weak" : newPass.length < 12 ? "Medium" : "Strong ✓"}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "var(--mono)", display: "block", marginBottom: "8px" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--green)" }} />
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                      placeholder="Repeat password" style={{ ...inputStyle, paddingLeft: "40px", borderColor: confirmPass && confirmPass !== newPass ? "rgba(248,113,113,0.4)" : undefined }} />
                  </div>
                  {confirmPass && confirmPass !== newPass && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "4px", fontFamily: "var(--mono)" }}>Passwords don't match</p>}
                </div>

                {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: "12px", color: "#f87171", marginBottom: "14px" }}>⚠ {error}</div>}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleResetPassword} disabled={loading}
                  className="btn-prime" style={{ width: "100%", padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {loading ? <div style={{ width: "16px", height: "16px", border: "2px solid #040d08", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> : <Lock size={15} />}
                  {loading ? "Resetting..." : "Reset Password"}
                </motion.button>
              </motion.div>
            )}

            {/* DONE */}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
                <motion.div animate={{ scale: [0.8, 1.1, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</motion.div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--green)", marginBottom: "8px", textShadow: "0 0 20px rgba(0,255,135,0.4)" }}>Password Reset!</h1>
                <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "24px", lineHeight: 1.7 }}>
                  Your password has been successfully updated. You can now login with your new password.
                </p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="btn-prime" style={{ width: "100%", padding: "13px", fontSize: "14px" }}>
                  Login Now →
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
