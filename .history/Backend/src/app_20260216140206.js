const express = require("express");
const cookieParser = require("cookie-parser");
const cors=require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

// Import Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

const app = express();

/* ---------- GLOBAL MIDDLEWARE ---------- */
app.use(cors({
  origin:"https://localhost:5173",
  
}));
app.use(express.json());
app.use(cookieParser());

/* ---------- ROUTES ---------- */
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

/* ---------- DB + SERVER ---------- */
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error(" DB connection failed", err);
  });


  