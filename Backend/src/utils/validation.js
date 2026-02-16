const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  // First Name
  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 5) {
    throw new Error("First name must be at least 5 characters long");
  }

  // Last Name (optional)
  if (lastName && lastName.trim().length < 3) {
    throw new Error("Last name must be at least 3 characters long");
  }

  // Email
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  }

  // Password
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number and special character"
    );
  }

  return true; // ✅ important for future extensibility
};

module.exports = { validateSignUpData };
