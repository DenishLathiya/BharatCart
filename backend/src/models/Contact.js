// backend/src/models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, trim: true, lowercase: true },
    subject:    { type: String, required: true },
    message:    { type: String, required: true },
    status:     { type: String, default: "Unread", enum: ["Unread", "Read", "Replied", "Resolved", "Spam"] },
    adminReply: { type: String, default: "" },
    adminNote:  { type: String, default: "" },
    repliedAt:  { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);