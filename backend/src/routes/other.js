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

    const users = await User.find({ _id: { $nin: Array.from(hide) } })
      .select("-password").skip(skip).limit(limit);
    res.json(users);
  } catch (err) { res.status(400).json({ error: err.message }); }
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
      const exists = await Match.findOne({ users: { $all: [request.fromUserId, request.toUserId] } });
      if (!exists) await Match.create({ users: [request.fromUserId, request.toUserId] });
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

module.exports = { feedRouter, requestRouter, userRouter, matchRouter, chatRouter };
