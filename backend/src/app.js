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
const User = require("./models/user");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const featuresRouter = require("./routes/features");
const { feedRouter, requestRouter, userRouter, matchRouter, chatRouter } = require("./routes/other");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      const allowed = [process.env.FRONTEND_URL, "http://localhost:5174", "http://localhost:5173"].filter(Boolean);
      if (!origin || allowed.some(o => origin === o || origin.startsWith(o))) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true
  },
});
app.set("io", io);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Prevent HTTP Parameter Pollution
app.use((req, res, next) => {
  // Sanitize keys — strip $ and . from req.body to prevent NoSQL injection
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    }
    return obj;
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
});

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { message: "Too many requests" } }));

// Strict rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 attempts per 15 min
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  keyGenerator: (req) => req.ip,
});
const connectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 connection requests per hour
  message: { message: "Too many connection requests. Slow down!" },
});
// ✅ Production-ready CORS — supports Vercel frontend + localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5174",
  "http://localhost:5173",
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin === o || origin.startsWith(o))) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5174");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/login", authLimiter);
app.use("/signup", authLimiter);
app.use("/request/send", connectionLimiter);
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", featuresRouter);
app.use("/", feedRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", matchRouter);
app.use("/", chatRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message || "Server error" }));

// Socket.io
const online = new Map();
io.on("connection", (socket) => {
  socket.on("join", ({ userId }) => {
    online.set(userId, socket.id);
    socket.join(userId);
    io.emit("online_users", Array.from(online.keys()));
    // Update isOnline in DB
    User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).catch(()=>{});
  });

  // Chat messages
  socket.on("send_message", ({ senderId, receiverId, message, isCode, _id, timestamp }) => {
    const payload = { _id, senderId, receiverId, message, isCode: isCode || false, timestamp: timestamp || new Date().toISOString() };
    const to = online.get(receiverId);
    if (to) io.to(to).emit("receive_message", payload);
    socket.emit("message_sent", payload);
  });

  // Typing
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const to = online.get(receiverId);
    if (to) io.to(to).emit("typing_status", { senderId, isTyping });
  });

  // Read receipts
  socket.on("messages_read", ({ readerId, senderId }) => {
    const to = online.get(senderId);
    if (to) io.to(to).emit("messages_read", { readerId });
  });

  // WebRTC signaling for video calls
  socket.on("call_user", ({ to, from, fromName, signal, callType }) => {
    const toSocket = online.get(to);
    if (toSocket) {
      io.to(toSocket).emit("incoming_call", { from, fromName, signal, callType });
    } else {
      // Receiver offline — save missed call notification
      const type = callType === "audio" ? "🎙️ Voice" : "📹 Video";
      User.findByIdAndUpdate(to, {
        $push: {
          notifications: {
            $each: [{
              type: "message",
              from: fromName,
              fromId: from,
              message: `${type} call from ${fromName} (missed)`,
              read: false,
              createdAt: new Date(),
            }],
            $position: 0,
          }
        }
      }).catch(() => {});
    }
  });
  socket.on("call_accepted", ({ to, signal }) => {
    const toSocket = online.get(to);
    if (toSocket) io.to(toSocket).emit("call_accepted", { signal });
  });
  socket.on("call_rejected", ({ to }) => {
    const toSocket = online.get(to);
    if (toSocket) io.to(toSocket).emit("call_rejected");
  });
  socket.on("call_ended", ({ to }) => {
    const toSocket = online.get(to);
    if (toSocket) io.to(toSocket).emit("call_ended");
  });
  socket.on("ice_candidate", ({ to, candidate }) => {
    const toSocket = online.get(to);
    if (toSocket) io.to(toSocket).emit("ice_candidate", { candidate });
  });

  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (const [uid, sid] of online.entries()) {
      if (sid === socket.id) { disconnectedUserId = uid; online.delete(uid); break; }
    }
    io.emit("online_users", Array.from(online.keys()));
    // Update lastSeen in DB
    if (disconnectedUserId) {
      User.findByIdAndUpdate(disconnectedUserId, { isOnline: false, lastSeen: new Date() }).catch(()=>{});
    }
  });
});

// Helper to send real-time notification
app.set("sendNotification", async (userId, notif) => {
  const to = online.get(userId.toString());
  if (to) io.to(to).emit("notification", notif);
});

const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => server.listen(PORT, () => {
    console.log(`\n⚡ DEV-TINDER — Port ${PORT}`);
    
  }))
  .catch(err => { console.error("❌ DB Error:", err.message); process.exit(1); });
