// // backend/src/models/RefundRequest.js
// const mongoose = require("mongoose");

// const refundRequestSchema = new mongoose.Schema(
//   {
//     user:          { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
//     type:          { type: String, enum: ["wallet", "order_return"],            required: true },
//     amount:        { type: Number, required: true, min: 1 },
//     reason:        { type: String, required: true },
//     status:        { type: String, default: "Pending", enum: ["Pending", "Processing", "Completed", "Rejected"] },

//     // Bank details for refund
//     bankDetails: {
//       accountName:   { type: String, default: "" },
//       accountNumber: { type: String, default: "" },
//       ifscCode:      { type: String, default: "" },
//       bankName:      { type: String, default: "" },
//       upiId:         { type: String, default: "" },
//       method:        { type: String, default: "bank", enum: ["bank", "upi"] },
//     },

//     // Admin fields
//     adminNote:      { type: String, default: "" },
//     transactionRef: { type: String, default: "" }, // UTR / transaction reference
//     processedAt:    { type: Date,   default: null },
//     processedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

//     // Reference
//     orderId:       { type: mongoose.Schema.Types.ObjectId, ref: "Order",  default: null },
//     returnId:      { type: mongoose.Schema.Types.ObjectId, ref: "Return", default: null },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("RefundRequest", refundRequestSchema);

// backend/src/models/RefundRequest.js
const mongoose = require("mongoose");

const refundRequestSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User",        required: true },
    // In your RefundRequest model
type: { 
  type: String, 
  enum: ["bank", "wallet", "order"], 
  default: "bank",      // ← add default
  // required: true     // ← remove required, or keep it and rely on default
},
    amount:        { type: Number, required: true, min: 1 },
    reason:        { type: String, required: true },
    status:        { type: String, default: "Pending", enum: ["Pending", "Processing", "Completed", "Rejected"] },

    // Bank details for refund
    bankDetails: {
      accountName:   { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode:      { type: String, default: "" },
      bankName:      { type: String, default: "" },
      upiId:         { type: String, default: "" },
      method:        { type: String, default: "bank", enum: ["bank", "upi"] },
    },

    // Admin fields
    adminNote:      { type: String, default: "" },
    transactionRef: { type: String, default: "" }, // UTR / transaction reference
    processedAt:    { type: Date,   default: null },
    processedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Reference
    orderId:       { type: mongoose.Schema.Types.ObjectId, ref: "Order",  default: null },
    returnId:      { type: mongoose.Schema.Types.ObjectId, ref: "Return", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefundRequest", refundRequestSchema);