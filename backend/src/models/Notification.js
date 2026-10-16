const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type:    { type: String, default: "info", enum: ["order", "return", "payment", "account", "message", "info"] },
    icon:    { type: String, default: "🔔" },
    isRead:  { type: Boolean, default: false },
    link:    { type: String, default: "" }, // which section to navigate to
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);