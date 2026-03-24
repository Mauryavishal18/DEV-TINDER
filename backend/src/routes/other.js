const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const { Match, Message } = require("../models/other");

const feedRouter = express.Router();
const requestRouter = express.Router();
const userRouter = express.Router();
const matchRouter = express.Router();
const chatRouter = express.Router();

// ─── FEED ────────────────────────────────────────────────
feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const done = await ConnectionRequest.find({
      $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
    }).select("fromUserId toUserId");

    const hide = new Set([req.user._id.toString()]);
    done.forEach(r => { hide.add(r.fromUserId.toString()); hide.add(r.toUserId.toString()); });
    // Hide blocked users
    (req.user.blockedUsers || []).forEach(id => hide.add(id.toString()));

    const users = await User.find({ _id: { $nin: Array.from(hide) } })
      .select("-password").skip(skip).limit(limit);
    res.json(users);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


// ─── SEARCH developers by skill/name ──────────────────────
feedRouter.get("/search", userAuth, async (req, res) => {
  try {
    const { q, skills } = req.query;
    const query = {};
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: "i" } },
        { lastName:  { $regex: q, $options: "i" } },
        { about:     { $regex: q, $options: "i" } },
      ];
    }
    if (skills) {
      const skillArr = skills.split(",").map(s => s.trim()).filter(Boolean);
      if (skillArr.length > 0) query.skills = { $in: skillArr };
    }
    // Exclude self
    query._id = { $ne: req.user._id };
    const users = await User.find(query).select("-password").limit(30);
    res.json(users);
  } catch(err) { res.status(400).json({ error: err.message }); }
});

// ─── REQUEST ─────────────────────────────────────────────
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id;
    if (!["ignore","interested"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    if (!mongoose.Types.ObjectId.isValid(toUserId)) return res.status(400).json({ message: "Invalid user id" });
    if (fromUserId.toString() === toUserId) return res.status(400).json({ message: "Cannot send to yourself" });

    const reverse = await ConnectionRequest.findOne({ fromUserId: toUserId, toUserId: fromUserId, status: "interested" });
    if (reverse && status === "interested") {
      const exists = await Match.findOne({ users: { $all: [fromUserId, toUserId] } });
      if (!exists) await Match.create({ users: [fromUserId, toUserId] });
      reverse.status = "accepted"; await reverse.save();
      return res.json({ success: true, message: "It's a MATCH! 🎉", match: true });
    }
    const existing = await ConnectionRequest.findOne({ fromUserId, toUserId });
    if (existing) return res.json({ success: true, message: "Already sent", match: false });
    const req2 = await ConnectionRequest.create({ fromUserId, toUserId, status });
    res.status(201).json({ success: true, message: "Request sent", match: false, data: req2 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    if (!["accepted","rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
    const request = await ConnectionRequest.findOne({ _id: requestId, toUserId: req.user._id, status: "interested" });
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = status; await request.save();
    if (status === "accepted") {
      // Create match
      const exists = await Match.findOne({ users: { $all: [request.fromUserId, request.toUserId] } });
      if (!exists) await Match.create({ users: [request.fromUserId, request.toUserId] });

      // Notify the person who SENT the request that it was accepted
      const accepter = req.user; // person who accepted
      const sender = await User.findById(request.fromUserId);
      if (sender) {
        sender.notifications = sender.notifications || [];
        sender.notifications.unshift({
          type: "match",
          from: `${accepter.firstName} ${accepter.lastName || ""}`.trim(),
          fromId: accepter._id,
          fromAvatar: accepter.photoUrl || "",
          message: `🎉 ${accepter.firstName} accepted your connection request! It's a match!`,
          read: false,
          createdAt: new Date(),
        });
        if (sender.notifications.length > 100) sender.notifications = sender.notifications.slice(0, 100);
        await sender.save();
        // Real-time notification via socket
        const sendNotification = req.app.get("sendNotification");
        if (sendNotification) sendNotification(sender._id, sender.notifications[0]);
      }
    } else if (status === "rejected") {
      // Notify sender that request was declined
      const decliner = req.user;
      const sender = await User.findById(request.fromUserId);
      if (sender) {
        sender.notifications = sender.notifications || [];
        sender.notifications.unshift({
          type: "request",
          from: `${decliner.firstName} ${decliner.lastName || ""}`.trim(),
          fromId: decliner._id,
          fromAvatar: decliner.photoUrl || "",
          message: `${decliner.firstName} declined your connection request.`,
          read: false,
          createdAt: new Date(),
        });
        if (sender.notifications.length > 100) sender.notifications = sender.notifications.slice(0, 100);
        await sender.save();
        const sendNotification = req.app.get("sendNotification");
        if (sendNotification) sendNotification(sender._id, sender.notifications[0]);
      }
    }
    res.json({ success: true, message: `Request ${status}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── USER ────────────────────────────────────────────────
const SAFE = "firstName lastName photoUrl age gender about skills github portfolio githubStats leetcodeStats useAvatar avatarSeed role";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const reqs = await ConnectionRequest.find({ toUserId: req.user._id, status: "interested" })
      .populate("fromUserId", SAFE);
    res.json({ data: reqs });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const reqs = await ConnectionRequest.find({
      $or: [{ toUserId: req.user._id, status: "accepted" }, { fromUserId: req.user._id, status: "accepted" }],
    }).populate("fromUserId", SAFE).populate("toUserId", SAFE);
    const data = reqs.map(r => r.fromUserId._id.toString() === req.user._id.toString() ? r.toUserId : r.fromUserId);
    res.json({ data });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ─── MATCH ───────────────────────────────────────────────
matchRouter.get("/matches", userAuth, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id }).populate("users", SAFE);
    res.json({ data: matches });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ─── CHAT ────────────────────────────────────────────────
chatRouter.get("/messages/:userId", userAuth, async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: myId, receiverId: userId }, { senderId: userId, receiverId: myId }],
    }).sort({ createdAt: 1 }).limit(100);
    await Message.updateMany({ senderId: userId, receiverId: myId, read: false }, { $set: { read: true } });
    res.json({ data: messages });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

chatRouter.post("/messages/:userId", userAuth, async (req, res) => {
  try {
    const { message, isCode } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Empty message" });
    const msg = await Message.create({
      senderId: req.user._id, receiverId: req.params.userId,
      message: message.trim(), isCode: isCode || false,
    });
    res.status(201).json({ data: msg });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ─── IMAGE UPLOAD (free Cloudinary - unsigned preset) ────
const multer = require("multer");
const imgUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Images only"));
  },
});

chatRouter.post("/messages/upload-image", userAuth, imgUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return res.status(400).json({ message: "Cloudinary not configured in .env" });
    }
    // Convert buffer to base64 data URI
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    // Use URLSearchParams to send as form-urlencoded (no extra deps needed)
    const params = new URLSearchParams();
    params.append("file", dataUri);
    params.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ message: data.error.message });
    res.json({ url: data.secure_url });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ─── BLOCK USER ──────────────────────────────────────────
userRouter.post("/user/block/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() === userId) return res.status(400).json({ message: "Cannot block yourself" });
    if (!req.user.blockedUsers) req.user.blockedUsers = [];
    if (!req.user.blockedUsers.map(id=>id.toString()).includes(userId)) {
      req.user.blockedUsers.push(userId);
      await req.user.save();
    }
    // Also remove connection if exists
    await ConnectionRequest.deleteMany({
      $or: [{ fromUserId: req.user._id, toUserId: userId }, { fromUserId: userId, toUserId: req.user._id }]
    });
    res.json({ message: "User blocked" });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

userRouter.post("/user/unblock/:userId", userAuth, async (req, res) => {
  try {
    req.user.blockedUsers = (req.user.blockedUsers || []).filter(id => id.toString() !== req.params.userId);
    await req.user.save();
    res.json({ message: "User unblocked" });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

// ─── REPORT USER ─────────────────────────────────────────
userRouter.post("/user/report/:userId", userAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ message: "User not found" });
    const alreadyReported = (target.reports || []).find(r => r.fromUserId?.toString() === req.user._id.toString());
    if (alreadyReported) return res.status(400).json({ message: "Already reported this user" });
    target.reports = target.reports || [];
    target.reports.push({ fromUserId: req.user._id, reason });
    await target.save();
    res.json({ message: "Report submitted. Our team will review it." });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

// ─── PUBLIC PROFILE (view friend's profile) ─────────────
userRouter.get("/user/profile/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    // Check they are connected
    const connected = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: userId, status: "accepted" },
        { fromUserId: userId, toUserId: req.user._id, status: "accepted" }
      ]
    });
    if (!connected) return res.status(403).json({ message: "Not connected with this user" });
    const user = await User.findById(userId).select("-password -resetOTP -resetOTPExpiry -resetToken -plainResetToken -blockedUsers -reports -notifications");
    if (!user) return res.status(404).json({ message: "User not found" });
    // Record profile view
    const recentView = (user.profileViews||[]).find(v=>v.viewerId?.toString()===req.user._id.toString()&&new Date()-new Date(v.viewedAt)<3600000);
    if (!recentView) {
      user.profileViews = user.profileViews || [];
      user.profileViews.push({ viewerId: req.user._id, viewerName: req.user.firstName, viewedAt: new Date() });
      await user.save();
    }
    res.json({ data: user });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

// Last seen endpoint
userRouter.get("/user/last-seen/:userId", userAuth, async (req, res) => {
  try {
    const u = await User.findById(req.params.userId).select("lastSeen isOnline");
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json({ lastSeen: u.lastSeen, isOnline: u.isOnline });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

module.exports = { feedRouter, requestRouter, userRouter, matchRouter, chatRouter };
