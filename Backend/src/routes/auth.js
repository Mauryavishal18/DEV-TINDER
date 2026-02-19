const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");

/* ===========================
        SIGNUP ROUTE
=========================== */
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, age } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({
      emailId: emailId.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
      age,
    });

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: "User Added Successfully",
      user: userObj,
    });

  } catch (err) {
    res.status(400).json({
      message: "Signup failed",
      error: err.message,
    });
  }
});


/* ===========================
          LOGIN ROUTE
=========================== */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({
      emailId: emailId.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: userObj,
      token,
    });

  } catch (err) {
    res.status(400).json({
      message: "Login failed",
      error: err.message,
    });
  }
});


/* ===========================
          LOGOUT ROUTE
=========================== */
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Logout Successful",
  });
});


module.exports = authRouter;
