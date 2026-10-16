const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: "", maxlength: 240 },
    badgeText: { type: String, default: "", maxlength: 40 },
    bgColor: { type: String, default: "#7c6fff" },
    bgColor2: { type: String, default: "#e05c8a" },
    emoji: { type: String, default: "🎯", maxlength: 8 },
    link: { type: String, default: "", maxlength: 80 },
    linkLabel: { type: String, default: "Shop Now", maxlength: 40 },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 5, min: 1, max: 10 },
    type: { type: String, enum: ["banner", "card", "strip"], default: "banner" },
    position: { type: String, enum: ["top", "middle", "bottom"], default: "top" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", adSchema);
