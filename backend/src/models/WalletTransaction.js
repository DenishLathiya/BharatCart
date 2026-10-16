// backend/src/models/WalletTransaction.js
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, enum: ["credit", "debit", "refund", "cashback"], required: true },
    amount:      { type: Number, required: true },
    balance:     { type: Number, required: true }, // balance after transaction
    description: { type: String, default: "" },
    orderId:     { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    paymentId:   { type: String, default: "" },    // Razorpay payment ID for topups
    status:      { type: String, enum: ["success", "failed", "pending"], default: "success" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);