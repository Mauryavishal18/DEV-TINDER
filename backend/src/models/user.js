const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minLength: [2, "Min 2 chars"], maxLength: [30, "Max 30 chars"] },
    lastName:  { type: String, trim: true, maxLength: 30 },
    emailId:   { type: String, required: true, unique: true, trim: true, lowercase: true,
                 validate(v) { if (!validator.isEmail(v)) throw new Error("Invalid email"); } },
    password:  { type: String, required: true, select: false },
    age:       { type: Number, min: 16, max: 100 },
    gender:    { type: String, enum: ["male", "female", "others"] },
    about:     { type: String, maxLength: 500 },
    photoUrl:  { type: String, default: "" },
    useAvatar: { type: Boolean, default: true },
    avatarSeed:{ type: String, default: "" },
    skills:    { type: [String], default: [] },
    github:    { type: String, default: "" },
    portfolio: { type: String, default: "" },
    linkedin:  { type: String, default: "" },
    leetcode:  { type: String, default: "" },
    gfg:       { type: String, default: "" },
    role:      { type: String, enum: ["developer", "recruiter"], default: "developer" },
    // Platform stats saved permanently
    githubStats: {
      username:    String,
      publicRepos: Number,
      totalStars:  Number,
      followers:   Number,
      following:   Number,
      topLanguage: String,
      bio:         String,
      avatar:      String,
      profileUrl:  String,
    },
    leetcodeStats: {
      username:       String,
      totalSolved:    Number,
      easySolved:     Number,
      mediumSolved:   Number,
      hardSolved:     Number,
      acceptanceRate: Number,
      ranking:        Number,
      profileUrl:     String,
    },
    // Endorsements from other users
    endorsements: [{
      fromUserId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fromName:    String,
      fromAvatar:  String,
      text:        String,
      rating:      { type: Number, min: 1, max: 5 },
      createdAt:   { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

userSchema.methods.validatePassword = async function (input) {
  return bcrypt.compare(input, this.password);
};

module.exports = mongoose.model("User", userSchema);
