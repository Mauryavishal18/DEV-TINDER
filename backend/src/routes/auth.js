const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, age, gender, about, skills, github, portfolio } = req.body;
    if (!firstName || firstName.trim().length < 2) return res.status(400).json({ message: "First name must be at least 2 characters" });
    if (!emailId || !emailId.includes("@")) return res.status(400).json({ message: "Valid email required" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const existing = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName: firstName.trim(), lastName: lastName?.trim(),
      emailId: emailId.toLowerCase(), password: hash,
      age: age ? parseInt(age) : undefined,
      gender, about, skills: skills || [],
      github, portfolio,
      avatarSeed: firstName.trim(),
    });
    await user.save();
    const obj = user.toObject(); delete obj.password;
    res.status(201).json({ message: "Account created!", user: obj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const obj = user.toObject(); delete obj.password;
    res.json({ message: "Login successful", user: obj, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.json({ message: "Logged out" });
});

module.exports = router;
