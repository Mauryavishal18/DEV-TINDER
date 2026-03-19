/**
 * DevTinder Backend v2.0
 * Built by Vishal Maurya
 */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const { feedRouter, requestRouter, userRouter, matchRouter, chatRouter } = require("./routes/other");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true },
});
app.set("io", io);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { message: "Too many requests" } }));

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", feedRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", matchRouter);
app.use("/", chatRouter);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", builtBy: "Vishal Maurya", version: "2.0" }));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// Socket.io real-time chat
const online = new Map();
io.on("connection", (socket) => {
  socket.on("join", ({ userId }) => {
    online.set(userId, socket.id);
    io.emit("online_users", Array.from(online.keys()));
  });
  socket.on("send_message", ({ senderId, receiverId, message }) => {
    const to = online.get(receiverId);
    const payload = { senderId, receiverId, message, timestamp: new Date().toISOString() };
    if (to) io.to(to).emit("receive_message", payload);
    socket.emit("message_sent", payload);
  });
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const to = online.get(receiverId);
    if (to) io.to(to).emit("typing_status", { senderId, isTyping });
  });
  socket.on("disconnect", () => {
    for (const [uid, sid] of online.entries()) {
      if (sid === socket.id) { online.delete(uid); break; }
    }
    io.emit("online_users", Array.from(online.keys()));
  });
});

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => server.listen(PORT, () => {
    console.log(`\n🚀 DevTinder Server v2 — Port ${PORT}`);
    console.log(`👨‍💻 Built by Vishal Maurya`);
    console.log(`📡 Socket.io ready`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
  }))
  .catch(err => { console.error("❌ DB Error:", err.message); process.exit(1); });
