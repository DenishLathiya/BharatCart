const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:    { type: String },
  emoji:   { type: String, default: "📦" },
  price:   { type: Number, required: true },
  qty:     { type: Number, required: true },
  image:   { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:           [orderItemSchema],
    subtotal:        { type: Number, default: 0 },
    discountAmount:  { type: Number, default: 0 },
    couponCode:      { type: String, default: "" },
    total:           { type: Number, required: true },
    status:          { type: String, default: "Processing", enum: ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"] },
    paymentMethod:   { type: String, default: "razorpay" },
    paymentId:       { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    paymentStatus:   { type: String, default: "Pending", enum: ["Pending", "Paid", "Failed", "Refunded"] },
    address: {
      name:    { type: String },
      phone:   { type: String },
      line1:   { type: String },
      city:    { type: String },
      state:   { type: String },
      pincode: { type: String },
    },
    shipment: {
      provider:          { type: String, default: "" },
      trackingNumber:    { type: String, default: "" },
      trackingUrl:       { type: String, default: "" },
      service:           { type: String, default: "" },
      estimatedDelivery: { type: Date },
      shippedAt:         { type: Date },
      isMock:            { type: Boolean, default: false },
    },
    timeline: [
      {
        status:    { type: String },
        message:   { type: String, default: "" },
        timestamp: { type: Date,   default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);