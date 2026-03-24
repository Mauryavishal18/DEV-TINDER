const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true, minLength: 2, maxLength: 30 },
  lastName:   { type: String, trim: true, maxLength: 30 },
  emailId:    { type: String, required: true, unique: true, trim: true, lowercase: true,
                validate(v) { if (!validator.isEmail(v)) throw new Error("Invalid email"); } },
  password:   { type: String, required: true, select: false },
  mobile:     { type: String, trim: true, default: "" },
  age:        { type: Number, min: 16, max: 100 },
  gender:     { type: String, enum: ["male", "female", "others"] },
  about:      { type: String, maxLength: 500 },
  photoUrl:   { type: String, default: "" },
  useAvatar:  { type: Boolean, default: true },
  avatarSeed: { type: String, default: "" },
  skills:     { type: [String], default: [] },
  github:     { type: String, default: "" },
  portfolio:  { type: String, default: "" },
  linkedin:   { type: String, default: "" },
  leetcode:   { type: String, default: "" },
  gfg:        { type: String, default: "" },
  role:       { type: String, enum: ["developer", "recruiter"], default: "developer" },
  theme:      { type: String, enum: ["dark", "light"], default: "dark" },

  // Platform stats
  githubStats: {
    username: String, publicRepos: Number, totalStars: Number,
    followers: Number, following: Number, topLanguage: String,
    bio: String, avatar: String, profileUrl: String,
    languages: { type: Map, of: Number, default: {} },
  },
  leetcodeStats: {
    username: String, totalSolved: Number, easySolved: Number,
    mediumSolved: Number, hardSolved: Number, acceptanceRate: Number,
    ranking: Number, profileUrl: String,
  },

  // Dev Score (auto-calculated)
  devScore: { type: Number, default: 0 },

  // Profile views
  profileViews: [{
    viewerId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    viewerName: String,
    viewerAvatar: String,
    viewedAt:  { type: Date, default: Date.now },
  }],

  // Endorsements (real only)
  endorsements: [{
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromName:   String,
    fromAvatar: String,
    text:       String,
    rating:     { type: Number, min: 1, max: 5 },
    createdAt:  { type: Date, default: Date.now },
  }],

  // Notifications
  notifications: [{
    type:      { type: String, enum: ["match", "request", "message", "endorsement", "view", "collab"] },
    from:      String,
    fromId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fromAvatar: String,
    message:   String,
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],

  // Collab projects posted
  collabProjects: [{
    title:       String,
    description: String,
    skills:      [String],
    status:      { type: String, enum: ["open", "closed"], default: "open" },
    applicants:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt:   { type: Date, default: Date.now },
  }],

  // Last seen timestamp
  lastSeen:    { type: Date, default: Date.now },
  isOnline:    { type: Boolean, default: false },

  // Blocked users
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Reports
  reports: [{
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason:     String,
    createdAt:  { type: Date, default: Date.now },
  }],

  // Password reset
  resetOTP:         { type: String, select: false },
  resetOTPExpiry:   { type: Date,   select: false },
  resetOTPAttempts: { type: Number, default: 0, select: false },
  resetToken:       { type: String, select: false },
  plainResetToken:  { type: String, select: false },
  resetTokenExpiry: { type: Date,   select: false },
}, { timestamps: true });

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
userSchema.methods.validatePassword = async function (input) {
  return bcrypt.compare(input, this.password);
};

// Auto-calculate dev score before save
userSchema.pre("save", function (next) {
  // DevScore: ONLY from real verified platforms — no fake skill-based points
  let score = 0;

  // GitHub stats (real data only)
  if (this.githubStats?.username) {
    score += Math.min((this.githubStats.totalStars || 0) * 2, 200);
    score += Math.min((this.githubStats.publicRepos || 0) * 3, 150);
    score += Math.min((this.githubStats.followers || 0) * 1, 100);
  }

  // LeetCode stats (real data only)
  if (this.leetcodeStats?.username) {
    score += Math.min((this.leetcodeStats.totalSolved || 0) * 2, 300);
    score += (this.leetcodeStats.mediumSolved || 0) * 3;
    score += (this.leetcodeStats.hardSolved || 0) * 5;
  }

  // Profile completeness bonus (small, max 50pts)
  if (this.about) score += 10;
  if (this.photoUrl && this.useAvatar === false) score += 15;
  if (this.linkedin) score += 10;
  if (this.portfolio) score += 10;
  if (this.gfg) score += 5;
  // NOTE: skills manually selected do NOT add to score — only real platform data counts

  this.devScore = Math.round(score);
  next();
});

module.exports = mongoose.model("User", userSchema);
