const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message:    { type: String, required: true, maxLength: 5000 },
  isCode:     { type: Boolean, default: false },
  read:       { type: Boolean, default: false },
}, { timestamps: true });
messageSchema.index({ senderId: 1, receiverId: 1 });

module.exports = {
  Match:   mongoose.model("Match", matchSchema),
  Message: mongoose.model("Message", messageSchema),
};
