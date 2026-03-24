const express = require("express");
const multer = require("multer");
const path = require("path");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const router = express.Router();

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// GET /profile/view
router.get("/profile/view", userAuth, (req, res) => {
  const u = req.user.toObject(); delete u.password;
  res.json(u);
});

// PATCH /profile/edit
const ALLOWED = ["firstName","lastName","photoUrl","about","gender","age","skills","github","portfolio","linkedin","leetcode","gfg","useAvatar","avatarSeed","mobile"];
router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    if (!updates.every(k => ALLOWED.includes(k))) return res.status(400).json({ message: "Invalid fields" });
    updates.forEach(k => req.user[k] = req.body[k]);
    await req.user.save();
    const u = req.user.toObject(); delete u.password;
    res.json({ message: "Profile updated!", user: u });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /profile/upload-photo
router.post("/profile/upload-photo", userAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const photoUrl = `/uploads/${req.file.filename}`;
    // Explicitly set both fields
    await require("../models/user").findByIdAndUpdate(req.user._id, {
      photoUrl: photoUrl,
      useAvatar: false,
    });
    const updatedUser = await require("../models/user").findById(req.user._id).select("-password");
    res.json({ message: "Photo uploaded!", user: updatedUser, photoUrl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /profile/save-platform — save platform stats permanently
router.post("/profile/save-platform", userAuth, async (req, res) => {
  try {
    const { platform, data } = req.body;
    if (!platform || !data) return res.status(400).json({ message: "Platform and data required" });

    if (platform === "github") {
      req.user.github = data.profileUrl || "";
      req.user.githubStats = data;
    } else if (platform === "leetcode") {
      req.user.leetcode = data.profileUrl || "";
      req.user.leetcodeStats = data;
    } else if (platform === "linkedin") {
      req.user.linkedin = data.profileUrl || data.username || "";
    } else if (platform === "gfg") {
      req.user.gfg = data.profileUrl || data.username || "";
    }

    await req.user.save();
    const u = req.user.toObject(); delete u.password;
    res.json({ message: `${platform} connected!`, user: u });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /profile/endorse/:userId — endorse another developer
router.post("/profile/endorse/:userId", userAuth, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text || !rating) return res.status(400).json({ message: "Text and rating required" });

    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ message: "User not found" });

    // Check if already endorsed
    const already = target.endorsements.find(e => e.fromUserId?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: "Already endorsed this developer" });

    target.endorsements.push({
      fromUserId: req.user._id,
      fromName: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
      fromAvatar: req.user.photoUrl || "",
      text, rating: parseInt(rating),
    });
    await target.save();
    res.json({ message: "Endorsement added!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
