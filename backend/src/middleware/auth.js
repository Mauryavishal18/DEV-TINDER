const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Please login first" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};

module.exports = { userAuth };
