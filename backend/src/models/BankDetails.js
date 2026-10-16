// // backend/src/models/BankDetails.js
// const mongoose = require("mongoose");

// const bankDetailsSchema = new mongoose.Schema(
//   {
//     user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     accountName:   { type: String, required: true, trim: true },
//     accountNumber: { type: String, required: true, trim: true },
//     ifscCode:      { type: String, required: true, trim: true, uppercase: true },
//     bankName:      { type: String, required: true, trim: true },
//     branchName:    { type: String, default: "",    trim: true },
//     accountType:   { type: String, default: "savings", enum: ["savings", "current"] },
//     upiId:         { type: String, default: "",    trim: true },
//     isVerified:    { type: Boolean, default: false },
//     isPrimary:     { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("BankDetails", bankDetailsSchema);

// backend/src/models/BankDetails.js
const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountName:   { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode:      { type: String, required: true, trim: true, uppercase: true },
    bankName:      { type: String, required: true, trim: true },
    branchName:    { type: String, default: "",    trim: true },
    accountType:   { type: String, default: "savings", enum: ["savings", "current"] },
    upiId:         { type: String, default: "",    trim: true },
    isVerified:    { type: Boolean, default: false },
    isPrimary:     { type: Boolean, default: false },
    verified:  { type: Boolean, default: false },
    rejected:  { type: Boolean, default: false },
    adminNote: { type: String,  default: ""    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankDetails", bankDetailsSchema);