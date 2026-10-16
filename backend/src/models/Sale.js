const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    discount:    { type: Number, required: true, min: 1, max: 90 }, // percentage
    startTime:   { type: Date,   required: true },
    endTime:     { type: Date,   required: true },
    products:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // empty = all products
    categories:  [{ type: String }], // empty = all categories
    isActive:    { type: Boolean, default: true },
    badge:       { type: String, default: "🔥 SALE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);