const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    order:    { type: mongoose.Schema.Types.ObjectId, ref: "Order",   required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    title:    { type: String, default: "", trim: true },
    body:     { type: String, default: "", trim: true },
    verified: { type: Boolean, default: true }, // only buyers can review
    likes:    { type: Number, default: 0 },
    status:   { type: String, default: "published", enum: ["published", "hidden"] },
  },
  { timestamps: true }
);

// One review per user per product per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);