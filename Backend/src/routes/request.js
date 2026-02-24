const express = require("express");
const mongoose = require("mongoose");

const requestRouter = express.Router();

const { userAuth } = require("../middleware/auth");
// const ConnectionRequest = require("../models/connectionRequest");
const Match = require("../models/match");
const ConnectionRequest = require("../models/connectionRequest");

/* =======================================================
   SEND REQUEST (ignore / interested)
======================================================= */

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { status, toUserId } = req.params;

      /* ===== VALIDATIONS ===== */

      const allowedStatus = ["ignore", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status type",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      if (fromUserId.toString() === toUserId) {
        return res.status(400).json({
          success: false,
          message: "You cannot send request to yourself",
        });
      }

      /* ===== CHECK REVERSE INTERESTED REQUEST ===== */

      const reverseRequest = await ConnectionRequest.findOne({
        fromUserId: toUserId,
        toUserId: fromUserId,
        status: "interested",
      });

      if (reverseRequest && status === "interested") {
        // 🔥 MATCH CONDITION

        const existingMatch = await Match.findOne({
          users: { $all: [fromUserId, toUserId] },
        });

        if (!existingMatch) {
          await Match.create({
            users: [fromUserId, toUserId],
          });
        }

        return res.status(200).json({
          success: true,
          message: "It's a MATCH 🎉",
          match: true,
        });
      }

      /* ===== CHECK IF SAME REQUEST ALREADY EXISTS ===== */

      const existingRequest = await ConnectionRequest.findOne({
        fromUserId,
        toUserId,
      });

      if (existingRequest) {
        return res.status(200).json({
          success: true,
          message: "Request already sent",
          match: false,
        });
      }

      /* ===== CREATE NEW REQUEST ===== */

      const newRequest = await ConnectionRequest.create({
        fromUserId,
        toUserId,
        status,
      });

      return res.status(200).json({
        success: true,
        message: "Connection request sent successfully",
        match: false,
        data: newRequest,
      });

    } catch (err) {
      console.error("Send request error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

/* =======================================================
   REVIEW REQUEST (accepted / rejected)
======================================================= */

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;

      const allowedStatuses = ["accepted", "rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request id",
        });
      }

      const request = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: req.user._id,
        status: "interested",
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      request.status = status;
      await request.save();

      // 🔥 If accepted → Create Match
      if (status === "accepted") {
        const existingMatch = await Match.findOne({
          users: { $all: [request.fromUserId, request.toUserId] },
        });

        if (!existingMatch) {
          await Match.create({
            users: [request.fromUserId, request.toUserId],
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Request ${status}`,
      });

    } catch (err) {
      console.error("Review request error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = requestRouter;