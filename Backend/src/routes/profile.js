const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");

/* ---------- VIEW PROFILE ---------- */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  res.send(req.user);
});

/* ---------- EDIT PROFILE ---------- */
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isAllowed = Object.keys(req.body).every(key =>
      ALLOWED_UPDATES.includes(key)
    );

    if (!isAllowed) throw new Error("Invalid Edit request");

    Object.keys(req.body).forEach(key => {
      req.user[key] = req.body[key];
    });

    await req.user.save();

    res.json({
      message: `${req.user.firstName}, your profile updated successfully`,
      data: req.user,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
