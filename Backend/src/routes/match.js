const express = require("express");
const matchRouter = express.Router();

const Match = require("../models/match");
const { userAuth } = require("../middleware/auth");

/* ===========================
        GET MATCHES
=========================== */
matchRouter.get("/matches", userAuth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
    }).populate("users", "-password");

    res.json(matches);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = matchRouter;