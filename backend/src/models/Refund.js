const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order:        { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    returnRequest:{ type: mongoose.Schema.Types.ObjectId, ref: "Return" },
    amount:       { type: Number, required: true },
    method:       { type: String, enum: ["wallet", "bank"], required: true },
    status:       { type: String, default: "Pending", enum: ["Pending", "Processing", "Completed", "Failed"] },
    reason:       { type: String, default: "" },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode:      String,
      bankName:      String,
      transactionId: String,
    },
    adminNote:    { type: String, default: "" },
    processedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt:  { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Refund", refundSchema);
