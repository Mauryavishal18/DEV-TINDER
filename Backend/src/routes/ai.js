const express = require("express");
const aiRouter = express.Router();

aiRouter.post("/ai/query", async (req, res) => {
  const { message } = req.body;

  // For now dummy reply
  res.json({
    reply: "AI is under construction 🚀",
  });
});

module.exports = aiRouter;