const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
const { sendOTP, sendPasswordReset } = require("../config/emails");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const { validateRegister } = require("../middleware/validate");

// POST /api/auth/register
router.post("/register", validateRegister, async (req, res) =>  {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered." });

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      otp,
      otpExpiry,
    });

    // Send OTP email asynchronously (don't await to return response instantly)
    sendOTP(email, otp).catch(err => {
      console.error(`Failed to send OTP to ${email}:`, err.message);
    });

    res.status(201).json({ message: "OTP sent to your email.", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP pending verification for this user." });
    }
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please resend OTP and try again." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check the code and try again." });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user: user.toJSON(), isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email asynchronously (don't await to return response instantly)
    sendOTP(user.email, otp).catch(err => {
      console.error(`Failed to resend OTP to ${user.email}:`, err.message);
    });

    res.json({ message: "OTP resent to your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields." });
    }

    // const user = await User.findOne({ email }).select("+password");
    // if (!user || !(await user.matchPassword(password))) {
    //   return res.status(401).json({ message: "Invalid email or password." });
    // }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ── Block suspended or spam accounts ──
    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support at support@bharatcart.com",
      });
    }
    if (user.accountStatus === "spam") {
      return res.status(403).json({
        message: "Your account has been flagged. Please contact support at support@bharatcart.com",
      });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: user.toJSON(),
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const resetUrl = new URL("/", process.env.CLIENT_URL || "http://localhost:5173");
      resetUrl.searchParams.set("resetToken", resetToken);
      const emailSent = await sendPasswordReset(user.email, resetUrl.toString());
      if (!emailSent) {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        return res.status(503).json({
          message: "We couldn't send the password reset email. Please try again later or contact support.",
        });
      }
    }

    res.json({
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Password reset request failed:", err.message);
    res.status(500).json({ message: "Unable to process the password reset request." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (typeof token !== "string" || !token || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: "This password reset link is invalid or has expired." });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successfully. Please sign in with your new password." });
  } catch (err) {
    console.error("Password reset failed:", err.message);
    res.status(500).json({ message: "Unable to reset password." });
  }
});

// GET /api/auth/me — verify token & return user
// router.get("/me", protect, (req, res) => {
//   res.json({ user: req.user, isAdmin: req.user.isAdmin });
// });

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Force logout if account is suspended or spam
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support@bharatcart.com" });
    }
    if (user.accountStatus === "spam") {
      return res.status(403).json({ message: "Your account has been flagged. Please contact support@bharatcart.com" });
    }

    res.json({ user: user.toJSON(), isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/password — change password
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile — update name, email, phone
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    if (phone && phone.length !== 10) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }

    // Check if email is taken by another user
    const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use by another account." });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone: phone || "" },
      { new: true, runValidators: true }
    );

    res.json({ user: updated.toJSON(), message: "Profile updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/bank-details — update bank account details
// ─────────────────────────────────────────────────────────────
router.put("/bank-details", protect, async (req, res) => {
  try {
    const { bankDetails } = req.body;

    if (!bankDetails) {
      return res.status(400).json({ message: "Bank details are required." });
    }

    const { accountHolder, accountNumber, ifscCode, bankName } = bankDetails;

    if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({
        message: "All bank details (account holder, account number, IFSC code, bank name) are required.",
      });
    }

    // Validate account number (10-18 digits)
    if (!/^\d{10,18}$/.test(accountNumber)) {
      return res.status(400).json({ message: "Invalid account number. Must be 10-18 digits." });
    }

    // Validate IFSC code (4 letters + 0 + 6 alphanumeric)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      return res.status(400).json({ message: "Invalid IFSC code format." });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        bankDetails: {
          accountHolder: accountHolder.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.toUpperCase().trim(),
          bankName: bankName.trim(),
          verified: false, // Will be verified by admin
        },
      },
      { new: true }
    );

    res.json({
      user: updated.toJSON(),
      message: "Bank details saved. Admin will verify and confirm.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
