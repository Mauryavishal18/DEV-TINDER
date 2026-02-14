const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");

/* ---------- SIGNUP ---------- */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, age } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
    });

    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* ---------- LOGIN ---------- */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

const user = await User.findOne({
  emailId: emailId.toLowerCase()
}).select("+password");


    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.send("user");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* ---------- LOGOUT ---------- */
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(0) });
  res.send("Logout Successful");
});

module.exports = authRouter;
