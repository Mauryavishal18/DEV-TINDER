const express = require("express");

const connectionRouter = express.Router();   // 👈 YE LINE MISSING THI

connectionRouter.get("/connections", async (req, res) => {

  const dummyConnections = [
    {
      _id: "1",
      firstName: "Akshay Saini",
      age: 29,
      gender: "Male",
      about: "Software Engineer by profession and teacher by heart.",
      photoUrl: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      _id: "2",
      firstName: "Mahendra Singh Dhoni",
      age: 42,
      gender: "Male",
      about: "Captain Cool 😎",
      photoUrl: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      _id: "3",
      firstName: "Donald Trump",
      age: 78,
      gender: "Male",
      about: "Businessman and politician.",
      photoUrl: "https://randomuser.me/api/portraits/men/10.jpg"
    }
  ];

  res.json({
    data: dummyConnections
  });
});

module.exports = connectionRouter;  // 👈 YE BHI IMPORTANT HAI