const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    order:       { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    product: {
      id:    { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name:  { type: String, required: true },
      emoji: { type: String, default: "📦" },
      price: { type: Number, required: true },
      qty:   { type: Number, required: true },
    },
    reason:      { type: String, required: true },
    description: { type: String, default: "" },
    status:      { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected", "Refunded"] },
    adminNote:   { type: String, default: "" },
    refundAmount:{ type: Number, default: 0 },
    refundMethod:{ type: String, enum: ["wallet", "bank"] },
    transactionRef:{ type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Return", returnSchema);
