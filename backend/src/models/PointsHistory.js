const mongoose = require("mongoose");

const pointsHistorySchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:        { type: String, enum: ["earned", "redeemed", "expired", "bonus"], required: true },
    points:      { type: Number, required: true },
    description: { type: String, required: true },
    orderId:     { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    balance:     { type: Number, default: 0 }, // balance after this transaction
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointsHistory", pointsHistorySchema);