const nodemailer = require("nodemailer");

// Create transporter once
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token (random hex)
const generateResetToken = () => {
  return require("crypto").randomBytes(32).toString("hex");
};

// Send OTP email
const sendOTPEmail = async (to, otp, firstName) => {
  const t = getTransporter();
  const appName = process.env.APP_NAME || "DevTinder";

  await t.sendMail({
    from: `"${appName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${otp} is your ${appName} password reset OTP`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#040d08;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#040d08;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#071510;border:1px solid rgba(0,255,135,0.15);border-radius:16px;overflow:hidden;">
          
          <!-- Header bar -->
          <tr><td style="height:3px;background:linear-gradient(90deg,#00a854,#00ff87,#00a854);"></td></tr>
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 40px 20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00ff87;border-radius:10px;padding:10px 12px;display:inline-block;">
                    <span style="font-size:18px;font-weight:900;color:#040d08;letter-spacing:2px;font-family:monospace;">⚡ DEV</span><span style="font-size:18px;font-weight:900;color:#040d08;letter-spacing:2px;font-family:monospace;">TINDER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#e0ffe8;">Password Reset OTP</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:14px;color:#7db88a;">Hey ${firstName || "Developer"}, here is your one-time password</p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(0,255,135,0.08);border:1px solid rgba(0,255,135,0.3);border-radius:12px;padding:20px 40px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#7db88a;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">Your OTP</p>
                    <p style="margin:0;font-size:42px;font-weight:900;color:#00ff87;letter-spacing:12px;font-family:monospace;text-shadow:0 0 20px rgba(0,255,135,0.4);">${otp}</p>
                    <p style="margin:6px 0 0;font-size:12px;color:#7db88a;">Valid for <strong style="color:#e0ffe8;">10 minutes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:10px;padding:14px;">
                <tr>
                  <td style="padding:14px;">
                    <p style="margin:0;font-size:13px;color:#fca5a5;">⚠️ <strong>Security Note:</strong> Never share this OTP with anyone. ${appName} will never ask for it.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid rgba(0,255,135,0.08);"/></td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#3d6b4a;">If you didn't request this, ignore this email. Your password won't change.</p>
              <p style="margin:8px 0 0;font-size:11px;color:#3d6b4a;">Made with ❤️ by <strong style="color:#00ff87;">DEV-TINDER</strong></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

// Send Reset Link email
const sendResetLinkEmail = async (to, resetToken, firstName) => {
  const t = getTransporter();
  const appName = process.env.APP_NAME || "DevTinder";
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await t.sendMail({
    from: `"${appName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Reset your ${appName} password`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#040d08;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#040d08;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#071510;border:1px solid rgba(0,255,135,0.15);border-radius:16px;overflow:hidden;">
          
          <tr><td style="height:3px;background:linear-gradient(90deg,#00a854,#00ff87,#00a854);"></td></tr>
          
          <tr>
            <td align="center" style="padding:32px 40px 20px;">
              <div style="background:#00ff87;border-radius:10px;padding:10px 18px;display:inline-block;">
                <span style="font-size:18px;font-weight:900;color:#040d08;letter-spacing:2px;font-family:monospace;">⚡ DEVTINDER</span>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#e0ffe8;">Reset Your Password</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <p style="margin:0;font-size:14px;color:#7db88a;">Hey ${firstName || "Developer"}, click the button below to reset your password</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:0 40px 28px;">
              <a href="${resetUrl}" style="display:inline-block;background:#00ff87;color:#040d08;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;letter-spacing:0.5px;font-family:'Segoe UI',Arial,sans-serif;">
                Reset Password →
              </a>
            </td>
          </tr>

          <!-- URL fallback -->
          <tr>
            <td style="padding:0 40px 20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#7db88a;">Or copy this link:</p>
              <p style="margin:0;font-size:11px;color:#3d6b4a;word-break:break-all;font-family:monospace;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;">${resetUrl}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:10px;">
                <tr>
                  <td style="padding:14px;">
                    <p style="margin:0;font-size:13px;color:#fca5a5;">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid rgba(0,255,135,0.08);"/></td></tr>
          <tr>
            <td align="center" style="padding:20px 40px 32px;">
              <p style="margin:0;font-size:11px;color:#3d6b4a;">Made with ❤️ by <strong style="color:#00ff87;">DEV-TINDER</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

// Send welcome email on signup
const sendWelcomeEmail = async (to, firstName) => {
  const t = getTransporter();
  const appName = process.env.APP_NAME || "DevTinder";
  await t.sendMail({
    from: `"${appName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Welcome to ${appName}, ${firstName}! 🚀`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#040d08;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;background:#071510;border:1px solid rgba(0,255,135,0.15);border-radius:16px;overflow:hidden;">
          <tr><td style="height:3px;background:linear-gradient(90deg,#00a854,#00ff87,#00a854);"></td></tr>
          <tr>
            <td align="center" style="padding:32px 40px 16px;">
              <div style="background:#00ff87;border-radius:10px;padding:10px 18px;display:inline-block;">
                <span style="font-size:18px;font-weight:900;color:#040d08;font-family:monospace;">⚡ DEVTINDER</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 12px;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#e0ffe8;">Welcome, ${firstName}! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="font-size:14px;color:#7db88a;line-height:1.7;">Your developer journey starts here. Find collaborators, build projects, and level up your career.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#7db88a;">🔍 <strong style="color:#e0ffe8;">Explore</strong> developers matched by tech stack</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#7db88a;">💬 <strong style="color:#e0ffe8;">Chat</strong> in real-time with your connections</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#7db88a;">🤖 <strong style="color:#e0ffe8;">Dev AI</strong> — your personal coding assistant</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#7db88a;">📊 <strong style="color:#e0ffe8;">Connect</strong> GitHub & LeetCode for real stats</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:#00ff87;color:#040d08;text-decoration:none;font-weight:700;font-size:14px;padding:12px 32px;border-radius:10px;">
                Start Exploring →
              </a>
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid rgba(0,255,135,0.08);"/></td></tr>
          <tr>
            <td align="center" style="padding:20px 40px 28px;">
              <p style="margin:0;font-size:11px;color:#3d6b4a;">Made with ❤️ by <strong style="color:#00ff87;">DEV-TINDER</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

module.exports = { generateOTP, generateResetToken, sendOTPEmail, sendResetLinkEmail, sendWelcomeEmail };
