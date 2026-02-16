const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

/* ---------- PRE MIDDLEWARE (SELF REQUEST PREVENT) ---------- */
connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send request to yourself !!");
  }
  next();
});

/* ---------- COMPOUND INDEX (DUPLICATE PREVENT) ---------- */
connectionRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);


//feature branch testing