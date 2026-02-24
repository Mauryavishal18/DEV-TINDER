const express = require("express");
const feedRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

/* =======================
        GET FEED
======================= */
feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Users jinko already request bheja
    const sentRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
    }).select("toUserId");

    const sentIds = sentRequests.map((r) => r.toUserId);

    // Feed me sirf woh users dikhao
    const users = await User.find({
      _id: {
        $nin: [...sentIds, loggedInUser._id],
      },
    }).select("-password");

    res.json(users);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = feedRouter;