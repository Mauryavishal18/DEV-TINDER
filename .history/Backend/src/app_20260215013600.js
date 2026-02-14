// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors=require("cors");
// require("dotenv").config();

// const connectDB = require("./config/database");

// // Import Routers
// const authRouter = require("./routes/auth");
// const profileRouter = require("./routes/profile");
// const requestRouter = require("./routes/request");

// const app = express();

// /* ---------- GLOBAL MIDDLEWARE ---------- */
// app.use(cors());
// app.use(express.json());
// app.use(cookieParser());

// /* ---------- ROUTES ---------- */
// app.use("/", authRouter);
// app.use("/", profileRouter);
// app.use("/", requestRouter);

// /* ---------- DB + SERVER ---------- */
// connectDB()
//   .then(() => {
//     app.listen(3000, () => {
//       console.log("Server running on port 3000");
//     });
//   })
//   .catch((err) => {
//     console.error(" DB connection failed", err);
//   });

  const express = require("express");
const connectDB = require("./src/Config/database");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
dotenv.config({});
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//routes
const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestRouter = require("./src/routes/request");
const userRouter = require("./src/routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

//database connect before server
connectDB().then(() => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on ` + process.env.PORT);
    });
  } catch (error) {
    console.log(error);
  }
});
