// backend/src/routes/payments.js
const express  = require("express");
const router   = express.Router();
const Razorpay = require("razorpay");
const crypto   = require("crypto");
const Order    = require("../models/Order");
const Product  = require("../models/Product");
const Cart     = require("../models/Cart");
const Coupon   = require("../models/Coupon");
const User     = require("../models/User");
const { protect } = require("../middleware/auth");

// Razorpay instance
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────
// Helper: build items from cart + calculate subtotal
// ─────────────────────────────────────────────────────────────
const buildItemsFromCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) throw new Error("Your cart is empty.");

  let subtotal = 0;
  const items  = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);
    if (!product) throw new Error(`Product not found.`);
    if (product.stock < cartItem.qty) {
      throw new Error(`Only ${product.stock} units of "${product.name}" available.`);
    }
    items.push({
      product: product._id,
      name:    product.name,
      emoji:   product.emoji  || "📦",
      price:   product.price,
      qty:     cartItem.qty,
      image:   product.image  || "",
    });
    subtotal += product.price * cartItem.qty;
  }

  return { items, subtotal };
};

// Helper: build items from provided items array (client-side fallback)
const buildItemsFromArray = async (itemsArray) => {
  if (!Array.isArray(itemsArray) || itemsArray.length === 0) throw new Error("No items provided.");
  let subtotal = 0;
  const items = [];
  for (const it of itemsArray) {
    if (!it.product || !it.qty) throw new Error("Invalid item format.");
    const product = await Product.findById(it.product);
    if (!product) throw new Error(`Product not found.`);
    if (product.stock < it.qty) throw new Error(`Only ${product.stock} units of "${product.name}" available.`);
    items.push({
      product: product._id,
      name:    product.name,
      emoji:   product.emoji || "📦",
      price:   product.price,
      qty:     it.qty,
      image:   product.image || "",
    });
    subtotal += product.price * it.qty;
  }
  return { items, subtotal };
};

// ─────────────────────────────────────────────────────────────
// Helper: validate and apply coupon
// ─────────────────────────────────────────────────────────────
const validateCoupon = async (code, subtotal) => {
  if (!code) return 0;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
  if (!coupon) throw new Error("Invalid or expired coupon code.");
  // expiry is stored as string in the model — compare using Date
  if (new Date(coupon.expiry) < new Date()) throw new Error("Invalid or expired coupon code.");
  if (subtotal < coupon.minOrder) {
    throw new Error(`Minimum order ₹${coupon.minOrder} required for this coupon.`);
  }
  return Math.round(subtotal * coupon.discount / 100);
};

// ─────────────────────────────────────────────────────────────
// Helper: deduct stock after order
// ─────────────────────────────────────────────────────────────
const deductStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty, sales: item.qty },
    });
  }
};

router.post("/create-order", protect, async (req, res) => {
  try {
    const { address, couponCode } = req.body;

    // Validate address
    if (!address?.name || !address?.phone || !address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ message: "Complete delivery address is required." });
    }

    // Build items + subtotal from live cart. If server cart is empty and client provided items, use those.
    let itemsObj;
    try {
      itemsObj = await buildItemsFromCart(req.user._id);
    } catch (err) {
      if (err.message === "Your cart is empty." && req.body.items) {
        itemsObj = await buildItemsFromArray(req.body.items);
      } else {
        throw err;
      }
    }
    const { items, subtotal } = itemsObj;

    // Apply coupon discount
    const discount = await validateCoupon(couponCode, subtotal);
    const total    = Math.max(1, subtotal - discount); // min ₹1

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount:   total * 100,
      currency: "INR",
      receipt:  `sv_${Date.now()}`,
      notes: {
        userId:    req.user._id.toString(),
        userEmail: req.user.email,
        userName:  req.user.name,
      },
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,    // in paise
      currency:        "INR",
      keyId:           process.env.RAZORPAY_KEY_ID,
      subtotal,
      discount,
      total,
      items,
      address,
      couponCode:      couponCode?.toUpperCase() || "",
      userName:        req.user.name,
      userEmail:       req.user.email,
      userPhone:       req.user.phone || address.phone || "",
    });
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Step 2: Verify signature + create order in DB
// ─────────────────────────────────────────────────────────────
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      items,
      subtotal,
      discount,
      total,
      couponCode,
      pointsRedeemed,
      pointsDiscount,
    } = req.body;

    // ── Verify Razorpay signature ─────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Please contact support." });
    }

    // ── Final total after points discount ─────────────────────
    const finalTotal = Math.max(1, total - (pointsDiscount || 0));

    // ── Create order in MongoDB ───────────────────────────────
    const order = await Order.create({
      user:            req.user._id,
      items,
      subtotal,
      discountAmount:  (discount || 0) + (pointsDiscount || 0),
      couponCode:      couponCode || "",
      total:           finalTotal,
      status:          "Processing",
      paymentMethod:   "razorpay",
      paymentId:       razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentStatus:   "Paid",
      address,
      timeline: [{
        status:    "Processing",
        message:   "Payment confirmed ✅ Your order is being processed.",
        timestamp: new Date(),
      }],
    });

    // ── Deduct stock ──────────────────────────────────────────
    await deductStock(items);

    // ── Clear cart ────────────────────────────────────────────
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );


    // ── Send email + notification ─────────────────────────────
    try {
      const { sendOrderConfirmation } = require("../config/emails");
      const user = await User.findById(req.user._id);
      await sendOrderConfirmation(user.email, {
        userName:      user.name,
        orderId:       order._id.toString().slice(-8).toUpperCase(),
        items,
        total:         finalTotal,
        address,
        paymentMethod: "Razorpay Online",
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    try {
      const notify = require("../config/notify");
      await notify(req.user._id, {
        title:   "Order Placed Successfully! 🎉",
        message: `Your order #${order._id.toString().slice(-8).toUpperCase()} of ₹${finalTotal.toLocaleString("en-IN")} is confirmed.`,
        type:    "payment",
        icon:    "🎉",
        link:    "orders",
      });
    } catch (err) {
      console.error("Notify error:", err.message);
    }

    const populated = await Order.findById(order._id).populate("user", "name email");
    res.status(201).json({ success: true, order: populated });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/payments/cod
// Cash on Delivery — no Razorpay needed
// ─────────────────────────────────────────────────────────────
router.post("/cod", protect, async (req, res) => {
  try {
    const { address, couponCode, pointsRedeemed, pointsDiscount } = req.body;

    if (!address?.name || !address?.phone || !address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ message: "Complete delivery address is required." });
    }

    const { items, subtotal } = await buildItemsFromCart(req.user._id);
    const discount   = await validateCoupon(couponCode, subtotal);
    const total      = Math.max(0, subtotal - discount - (pointsDiscount || 0));

    const order = await Order.create({
      user:          req.user._id,
      items,
      subtotal,
      discountAmount: (discount || 0) + (pointsDiscount || 0),
      couponCode:    couponCode || "",
      total,
      status:        "Processing",
      paymentMethod: "cod",
      paymentId:     "COD",
      paymentStatus: "Pending",
      address,
      timeline: [{
        status:    "Processing",
        message:   "Order placed. Pay ₹" + total.toLocaleString("en-IN") + " on delivery.",
        timestamp: new Date(),
      }],
    });

    await deductStock(items);
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    try {
      const { sendOrderConfirmation } = require("./config/emails");
      const user = await User.findById(req.user._id);
      await sendOrderConfirmation(user.email, {
        userName:      user.name,
        orderId:       order._id.toString().slice(-8).toUpperCase(),
        items,
        total,
        address,
        paymentMethod: "Cash on Delivery",
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    try {
      const notify = require("../config/notify");
      await notify(req.user._id, {
        title:   "Order Placed! 🎉",
        message: `COD order #${order._id.toString().slice(-8).toUpperCase()} placed. Pay ₹${total.toLocaleString("en-IN")} on delivery.`,
        type:    "order",
        icon:    "📦",
        link:    "orders",
      });
    } catch (err) {
      console.error("Notify error:", err.message);
    }

    const populated = await Order.findById(order._id).populate("user", "name email");
    res.status(201).json({ success: true, order: populated });
  } catch (err) {
    console.error("COD error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /payments/wallet — pay using wallet balance
// ─────────────────────────────────────────────────────────────
router.post("/wallet", protect, async (req, res) => {
  try {
    const { address, couponCode, pointsRedeemed, pointsDiscount, amount } = req.body;

    if (!address?.name || !address?.phone || !address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ message: "Complete delivery address is required." });
    }

    const { items, subtotal } = await buildItemsFromCart(req.user._id);
    const discount   = await validateCoupon(couponCode, subtotal);
    const total      = Math.max(0, subtotal - discount - (pointsDiscount || 0));

    // Check wallet balance
    const Wallet = require("../models/Wallet");
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 0 });

    if (wallet.balance < total) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Available: ₹${wallet.balance}, Required: ₹${total}`,
      });
    }

    // Deduct from wallet
    wallet.balance -= total;
    await wallet.save();

    // Create wallet transaction
    const WalletTransaction = require("../models/WalletTransaction");
    await WalletTransaction.create({
      user:        req.user._id,
      type:        "debit",
      amount:      total,
      balance:     wallet.balance,
      description: `Payment for order`,
      status:      "success",
    });

    const order = await Order.create({
      user:          req.user._id,
      items,
      subtotal,
      discountAmount: (discount || 0) + (pointsDiscount || 0),
      couponCode:    couponCode || "",
      total,
      status:        "Processing",
      paymentMethod: "wallet",
      paymentId:     "WALLET_" + Date.now(),
      paymentStatus: "Paid",
      address,
      timeline: [{
        status:    "Processing",
        message:   "Order placed. Paid ₹" + total.toLocaleString("en-IN") + " from wallet.",
        timestamp: new Date(),
      }],
    });

    await deductStock(items);
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    try {
      const { sendOrderConfirmation } = require("../config/emails");
      const user = await User.findById(req.user._id);
      await sendOrderConfirmation(user.email, {
        userName:      user.name,
        orderId:       order._id.toString().slice(-8).toUpperCase(),
        items,
        total,
        address,
        paymentMethod: "Wallet",
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    try {
      const notify = require("../config/notify");
      await notify(req.user._id, {
        title:   "Order Placed! 🎉",
        message: `Wallet payment of ₹${total.toLocaleString("en-IN")} successful for order #${order._id.toString().slice(-8).toUpperCase()}. Remaining balance: ₹${wallet.balance.toLocaleString("en-IN")}`,
        type:    "order",
        icon:    "📦",
        link:    "orders",
      });
    } catch (err) {
      console.error("Notify error:", err.message);
    }

    const populated = await Order.findById(order._id).populate("user", "name email");
    res.status(201).json({ success: true, order: populated, newBalance: wallet.balance });
  } catch (err) {
    console.error("Wallet payment error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;