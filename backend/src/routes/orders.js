const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");
const { sendOrderShipped } = require("../config/emails");
const { createShipment } = require("../services/shipping");

// POST /api/orders — place a new order
router.post("/", protect, async (req, res) => {
  try {
    const { items, address, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Build order items & deduct stock
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      product.stock -= item.qty;
      product.sales += item.qty;
      await product.save();

      orderItems.push({ product: product._id, name: product.name, emoji: product.emoji, price: product.price, qty: item.qty });
      total += product.price * item.qty;
    }

    // Apply coupon
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && total >= coupon.minOrder && new Date(coupon.expiry) >= new Date()) {
        discountAmount = Math.round(total * (coupon.discount / 100));
      }
    }

    // Calculate delivery charge (FREE for orders >= 999, 49 for < 999)
    const deliveryCharge = total >= 999 ? 0 : 49;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total: total - discountAmount + deliveryCharge,
      status: "Processing",
      paymentMethod,
      address,
      couponCode: couponCode || "",
      discountAmount,
      deliveryCharge,
    });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — current user's orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — admin: all orders
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — admin: update status
// router.put("/:id/status", protect, adminOnly, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status, message } = req.body;
    const allowedStatuses = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Choose a valid order status." });
    }

    const statusMessages = {
      "Processing":       "Your order has been confirmed and is being processed.",
      "Shipped":          "Your order has been shipped and is on its way.",
      "Out for Delivery": "Your order is out for delivery. Expect it today!",
      "Delivered":        "Your order has been delivered. Thank you for shopping!",
      "Cancelled":        "Your order has been cancelled.",
    };

    const notify = require("../config/notify");

    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (status === "Shipped" && !order.shipment?.trackingNumber) {
      order.shipment = createShipment(order);
    }

    order.status = status;
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }
    const statusMessage = message || statusMessages[status] || "";
    const timelineMessage = status === "Shipped" && order.shipment?.trackingNumber
      ? `${statusMessage} Tracking number: ${order.shipment.trackingNumber}.`
      : statusMessage;
    order.timeline.push({
      status,
      message: timelineMessage,
      timestamp: new Date(),
    });
    await order.save();

    const userId = order.user?._id;
    if (userId) await notify(userId, {
      title:   `Order ${status}`,
      message: timelineMessage,
      type:    "order",
      icon:    status === "Delivered" ? "✅" : status === "Shipped" ? "🚚" : status === "Cancelled" ? "❌" : "📦",
      link:    "orders",
    });

    // Send email notification to user
    if (order.user?.email) {
      sendOrderShipped(order.user.email, {
        userName: order.user.name,
        orderId:  order._id.toString().slice(-8).toUpperCase(),
        status,
        message:  message || statusMessages[status],
      }).catch(console.error);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

module.exports = router;
