const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 20,
    },

    lastName: {
      type: String,
      minLength: 5,
      maxLength: 20,
    },

    emailId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔒 response me password nahi aayega
    },

    age: {
      type: Number,
      required: true,
      min: 18,
    },

    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },

    about: {
      type: String,
      minLength: 10,
    },

    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF6gewyuH5x0zDsIgOT1pobbHtgp0EZngcggfjQfE55Q&s&ec=121528417",
    },

    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

/* ---------- JWT TOKEN ---------- */
userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ---------- PASSWORD CHECK ---------- */
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

module.exports = mongoose.model("User", userSchema);
