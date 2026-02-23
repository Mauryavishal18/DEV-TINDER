const express = require("express");
const feedRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

/* ======================
        GET FEED
====================== */
feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // Current logged in user
    const loggedInUser = req.user;

    // Get all users except logged in user
    const users = await User.find({
      _id: { $ne: loggedInUser._id },
    }).select("-password");

    res.status(200).json(users);

  } catch (err) {
    res.status(400).json({
      message: "Error fetching feed",
      error: err.message,
    });
  }
});

module.exports = feedRouter;