const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateOTP, generateResetToken, sendOTPEmail, sendResetLinkEmail, sendWelcomeEmail } = require("../utils/email");
const router = express.Router();

// ─── SIGNUP ──────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, mobile, age, gender, about, skills, github, portfolio } = req.body;
    if (!firstName || firstName.trim().length < 2) return res.status(400).json({ message: "First name min 2 chars" });
    if (!emailId || !emailId.includes("@")) return res.status(400).json({ message: "Valid email required" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password min 8 chars" });
    const existing = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    // ✅ Gmail-only policy — reject all non-gmail addresses
    const emailDomain = emailId.toLowerCase().split("@")[1];
    if (emailDomain !== "gmail.com") {
      return res.status(400).json({ message: "Only Gmail addresses (@gmail.com) are accepted on DevTinder." });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ firstName: firstName.trim(), lastName: lastName?.trim()||"", emailId: emailId.toLowerCase(), password: hash, mobile: mobile||"", age: age?parseInt(age):undefined, gender, about, skills: skills||[], github, portfolio, avatarSeed: firstName.trim() });
    await user.save();
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      sendWelcomeEmail(user.emailId, user.firstName).catch(console.error);
    }
    const token = user.getJWT();
    res.cookie("token", token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite: process.env.NODE_ENV==="production" ? "none" : "lax", maxAge:7*24*60*60*1000 });
    const obj = user.toObject(); delete obj.password;
    res.status(201).json({ message:"Account created!", user:obj, token });
  } catch (err) { res.status(400).json({ message:err.message }); }
});

// ─── LOGIN ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) return res.status(400).json({ message:"Email and password required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+password");
    if (!user) return res.status(400).json({ message:"Invalid credentials" });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ message:"Invalid credentials" });
    const token = user.getJWT();
    res.cookie("token", token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite: process.env.NODE_ENV==="production" ? "none" : "lax", maxAge:7*24*60*60*1000 });
    const obj = user.toObject(); delete obj.password;
    res.json({ message:"Login successful", user:obj, token });
  } catch (err) { res.status(400).json({ message:err.message }); }
});

// ─── LOGOUT ──────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.cookie("token", "", { expires:new Date(0) });
  res.json({ message:"Logged out" });
});

// ─── FORGOT PASSWORD — SEND OTP ──────────────────────────
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ message:"Email required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+resetOTP +resetOTPExpiry +resetOTPAttempts");
    if (!user) return res.json({ message:"If this email exists, an OTP has been sent" });
    if (user.resetOTPExpiry && user.resetOTPExpiry > Date.now() && user.resetOTPAttempts >= 3) {
      const wait = Math.ceil((user.resetOTPExpiry - Date.now())/60000);
      return res.status(429).json({ message:`Too many attempts. Wait ${wait} min` });
    }
    const otp = generateOTP();
    user.resetOTP = await bcrypt.hash(otp, 8);
    user.resetOTPExpiry = new Date(Date.now() + 10*60*1000);
    user.resetOTPAttempts = (user.resetOTPAttempts||0) + 1;
    await user.save();
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[DEV] OTP for ${emailId}: ${otp}`);
      return res.json({ message:"OTP sent (check server console in dev mode)", devOTP: process.env.NODE_ENV!=="production"?otp:undefined });
    }
    await sendOTPEmail(user.emailId, otp, user.firstName);
    res.json({ message:"OTP sent to your email. Valid for 10 minutes." });
  } catch (err) { console.error(err); res.status(500).json({ message:"Failed to send OTP. Check Gmail config in .env" }); }
});

// ─── FORGOT PASSWORD — VERIFY OTP ────────────────────────
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    if (!emailId || !otp) return res.status(400).json({ message:"Email and OTP required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+resetOTP +resetOTPExpiry +resetToken +resetTokenExpiry");
    if (!user||!user.resetOTP||!user.resetOTPExpiry) return res.status(400).json({ message:"Invalid or expired OTP" });
    if (user.resetOTPExpiry < Date.now()) return res.status(400).json({ message:"OTP expired. Request a new one." });
    const valid = await bcrypt.compare(otp, user.resetOTP);
    if (!valid) return res.status(400).json({ message:"Incorrect OTP. Try again." });
    const sessionToken = require("crypto").randomBytes(24).toString("hex");
    user.resetToken = await bcrypt.hash(sessionToken, 8);
    user.resetTokenExpiry = new Date(Date.now() + 15*60*1000);
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.resetOTPAttempts = 0;
    await user.save();
    res.json({ message:"OTP verified successfully", sessionToken, emailId: user.emailId });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

// ─── FORGOT PASSWORD — SEND RESET LINK ───────────────────
router.post("/forgot-password/send-link", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ message:"Email required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+resetToken +resetTokenExpiry");
    if (!user) return res.json({ message:"If this email exists, a reset link has been sent" });
    const token = generateResetToken();
    // Store plain token for link-based reset
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60*60*1000);
    // Clear any OTP session tokens that might conflict
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    user.resetOTPAttempts = 0;
    await user.save();
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.emailId)}`;
      console.log(`[DEV] Reset link: ${url}`);
      return res.json({ message:"Reset link generated (check server console)", devUrl: process.env.NODE_ENV!=="production"?url:undefined });
    }
    await sendResetLinkEmail(user.emailId, token, user.firstName);
    res.json({ message:"Password reset link sent. Valid for 1 hour." });
  } catch (err) { console.error(err); res.status(500).json({ message:"Failed to send reset link" }); }
});

// ─── RESET PASSWORD ───────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, emailId, sessionToken, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ message:"Password min 8 chars" });
    if (!emailId) return res.status(400).json({ message:"Email required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+password +resetToken +plainResetToken +resetTokenExpiry");
    if (!user || !user.resetTokenExpiry) return res.status(400).json({ message:"Invalid request. Start over." });
    if (user.resetTokenExpiry < Date.now()) return res.status(400).json({ message:"Reset link expired. Request a new one." });
    let valid = false;
    if (token) {
      // Link-based reset — compare against plainResetToken
      valid = user.plainResetToken && (user.plainResetToken === token);
    } else if (sessionToken) {
      // OTP session-based reset
      valid = user.resetToken && await bcrypt.compare(sessionToken, user.resetToken);
    }
    if (!valid) return res.status(400).json({ message:"Invalid or expired token. Please start over." });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.plainResetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message:"Password reset successfully! You can now login." });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

// ─── CHANGE PASSWORD (logged in user) ────────────────────
const { userAuth } = require("../middleware/auth");
router.post("/user/change-password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both fields required" });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password min 8 chars" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully!" });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ─── DELETE ACCOUNT ───────────────────────────────────────
router.delete("/user/account", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Enter your password to confirm deletion" });
    const user = await User.findById(req.user._id).select("+password");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Incorrect password" });
    await User.findByIdAndDelete(req.user._id);
    res.cookie("token", "", { expires: new Date(0) });
    res.json({ message: "Account deleted. Sorry to see you go!" });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
