const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String, default: "" },
    isAdmin:  { type: Boolean, default: false },
    joined:   { type: String, default: () => new Date().toLocaleDateString("en-IN") },

    // OTP fields
    otp:       { type: String,  default: null },
    otpExpiry: { type: Date,    default: null },
    resetPasswordToken:   { type: String, default: null },
    resetPasswordExpires: { type: Date,   default: null },
    // Add to userSchema:
    totalEarned:    { type: Number, default: 0 },
    totalRedeemed:  { type: Number, default: 0 },
    // Account status
    accountStatus:    { type: String, default: "active", enum: ["active", "suspended", "spam"] },
    statusNote:       { type: String, default: "" },
    statusUpdatedAt:  { type: Date,   default: null },
    // Bank account for refunds
    bankDetails: {
      accountHolder: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode:      { type: String, default: "" },
      bankName:      { type: String, default: "" },
      verified:      { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);