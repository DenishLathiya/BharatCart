// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const Order = require("../models/Order");
// const Product = require("../models/Product");
// const Coupon = require("../models/Coupon");
// const { protect, adminOnly } = require("../middleware/auth");

// // GET /api/admin/users
// router.get("/users", protect, adminOnly, async (req, res) => {
//   try {
//     const users = await User.find({ isAdmin: false }).select("-password").sort({ createdAt: -1 }).lean();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin/analytics
// router.get("/analytics", protect, adminOnly, async (req, res) => {
//   try {
//     const [totalOrders, users, products, orders] = await Promise.all([
//       Order.countDocuments(),
//       User.countDocuments({ isAdmin: false }),
//       Product.find().lean(),
//       Order.find().lean(),
//     ]);

//     const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
//     const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

//     // Revenue by category (from order items)
//     const categoryRevenue = {};
//     for (const order of orders) {
//       for (const item of order.items) {
//         // We store product name/emoji but not category in order items directly.
//         // Use product lookup for analytics.
//       }
//     }

//     // Top products by sales
//     const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

//     // Category breakdown
//     const categoryBreakdown = {};
//     products.forEach(p => {
//       categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + p.sales;
//     });

//     // Monthly revenue (last 6 months from createdAt)
//     const monthlyRevenue = {};
//     orders.forEach(o => {
//       const month = new Date(o.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
//       monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total;
//     });

//     res.json({
//       totalRevenue,
//       totalOrders,
//       totalUsers: users,
//       avgOrderValue,
//       topProducts,
//       categoryBreakdown,
//       monthlyRevenue,
//       lowStock: products.filter(p => p.stock < 10),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/admin/seed — seed default products & coupons (idempotent)
// router.post("/seed", protect, adminOnly, async (req, res) => {
//   try {
//     const SEED_PRODUCTS = [
//       { name: "iPhone 15 Pro",       price: 134999, stock: 100, category: "Electronics", description: "Latest Apple flagship with titanium frame",       emoji: "📱", sales: 42, rating: 4.8 },
//       { name: 'Samsung OLED TV 65"', price: 89999,  stock: 10,  category: "Electronics", description: "65-inch 4K OLED smart television",               emoji: "📺", sales: 18, rating: 4.6 },
//       { name: "Nike Air Max 270",     price: 8999,   stock: 60,  category: "Fashion",     description: "Premium comfort running shoes",                  emoji: "👟", sales: 76, rating: 4.7 },
//       { name: "Leather Biker Jacket", price: 4999,   stock: 30,  category: "Fashion",     description: "Genuine leather jacket with zip pockets",       emoji: "🧥", sales: 34, rating: 4.5 },
//       { name: "Auto Coffee Maker",    price: 3499,   stock: 40,  category: "Home",        description: "12-cup automatic drip coffee machine",          emoji: "☕", sales: 55, rating: 4.4 },
//       { name: "Premium Yoga Mat",     price: 1299,   stock: 80,  category: "Sports",      description: "Non-slip 6mm thick yoga mat",                    emoji: "🧘", sales: 90, rating: 4.9 },
//       { name: "Python for Beginners", price: 799,    stock: 100, category: "Books",       description: "Complete Python programming guide",              emoji: "📖", sales: 120, rating: 4.7 },
//       { name: "Sony WH-1000XM5",      price: 5999,   stock: 45,  category: "Electronics", description: "Industry-leading noise cancelling headphones", emoji: "🎧", sales: 67, rating: 4.9 },
//       { name: "Samsung Galaxy Watch", price: 12999,  stock: 20,  category: "Electronics", description: "Advanced health tracking smartwatch",           emoji: "⌚", sales: 38, rating: 4.6 },
//       { name: "Adjustable Dumbbells", price: 2499,   stock: 35,  category: "Sports",      description: "5-25kg adjustable weight dumbbells",            emoji: "🏋️", sales: 48, rating: 4.5 },
//     ];

//       const SEED_COUPONS = [
//       { code: "SAVE10",   discount: 10, minOrder: 500,  expiry: "2027-12-31", active: true  },
//       { code: "FIRST20",  discount: 20, minOrder: 1000, expiry: "2027-12-31", active: true  },
//       { code: "SUMMER15", discount: 15, minOrder: 750,  expiry: "2027-12-31", active: true  },
//     ];

//     const existingCount = await Product.countDocuments();
//     if (existingCount === 0) {
//       await Product.insertMany(SEED_PRODUCTS);
//     }

//     for (const c of SEED_COUPONS) {
//       await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true });
//     }

//     res.json({ message: "Seed complete", productsAdded: existingCount === 0 ? SEED_PRODUCTS.length : 0 });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin/payments — payment report
// // GET /api/admin/payments — payment report
// router.get("/payments", protect, adminOnly, async (req, res) => {
//   try {
//     const Return = require("../models/Return");

//     const [orders, allReturns] = await Promise.all([
//       Order.find({ paymentId: { $ne: "" } })
//         .populate("user", "name email")
//         .sort({ createdAt: -1 })
//         .lean(),
//       Return.find({ status: "Refunded" }).lean(),
//     ]);

//     const totalRefunded   = allReturns.reduce((s, r) => s + r.refundAmount, 0);
//     const totalRevenue    = orders.reduce((s, o) => s + o.total, 0);
//     const totalOrders     = orders.length;
//     const avgOrderValue   = totalOrders > 0 ? totalRevenue / totalOrders : 0;
//     const codOrders       = orders.filter(o => o.paymentMethod === "cod").length;
//     const onlineOrders    = orders.filter(o => o.paymentMethod !== "cod").length;
//     const totalRefunds    = allReturns.length;

//     // Payment method breakdown
//     const methodBreakdown = {};
//     orders.forEach(o => {
//       const m = o.paymentMethod || "unknown";
//       if (!methodBreakdown[m]) methodBreakdown[m] = { count: 0, total: 0 };
//       methodBreakdown[m].count += 1;
//       methodBreakdown[m].total += o.total;
//     });

//     // Daily revenue (last 7 days)
//     const dailyRevenue = {};
//     const last7 = Array.from({ length: 7 }, (_, i) => {
//       const d = new Date();
//       d.setDate(d.getDate() - i);
//       return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
//     }).reverse();

//     last7.forEach(day => { dailyRevenue[day] = 0; });
//     orders.forEach(o => {
//       const day = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
//       if (dailyRevenue[day] !== undefined) dailyRevenue[day] += o.total;
//     });

//    res.json({
//       summary: { totalRevenue, totalOrders, avgOrderValue, codOrders, onlineOrders, totalRefunded, totalRefunds },
//       methodBreakdown,
//       dailyRevenue,
//       transactions: orders.map(o => ({
//         _id:           o._id,
//         orderId:       o._id.toString().slice(-8).toUpperCase(),
//         user:          o.user,
//         amount:        o.total,
//         method:        o.paymentMethod,
//         paymentId:     o.paymentId || "COD",
//         paymentStatus: o.paymentStatus || "Paid",
//         status:        o.status,
//         discount:      o.discountAmount || 0,
//         coupon:        o.couponCode || "",
//         date:          o.createdAt,
//       })),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;


// backend/src/routes/admin.js
// Add these NEW routes to your existing admin.js file
// Paste them before the module.exports line

const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const Order    = require("../models/Order");
const Product  = require("../models/Product");
const Coupon   = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");

// ── GET /api/admin/users — all users with order stats ────────
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users  = await User.find({ isAdmin: false }).sort({ createdAt: -1 }).lean();
    const orders = await Order.find().lean();

    const enriched = users.map(u => {
      const uOrders = orders.filter(o => o.user?.toString() === u._id.toString());
      const spent   = uOrders.reduce((s, o) => s + (o.total || 0), 0);
      return { ...u, orderCount: uOrders.length, totalSpent: spent };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/admin/users/:id/status — suspend/spam/activate ──
router.put("/users/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { accountStatus, statusNote } = req.body;

    if (!["active", "suspended", "spam"].includes(accountStatus)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isAdmin) return res.status(403).json({ message: "Cannot modify admin accounts." });

    user.accountStatus   = accountStatus;
    user.statusNote      = statusNote || "";
    user.statusUpdatedAt = new Date();
    await user.save();

    // Send account status email
    const { sendAccountStatus } = require("../config/emails");
    sendAccountStatus(user.email, {
      userName: user.name,
      status:   accountStatus,
      note:     statusNote || "",
    }).catch(console.error);

    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/users/:id — delete user ─────────────────
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isAdmin) return res.status(403).json({ message: "Cannot delete admin accounts." });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/analytics ──────────────────────────────────
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const [orders, users, products] = await Promise.all([
      Order.find().lean(),
      User.find({ isAdmin: false }).lean(),
      Product.find().lean(),
    ]);

    const revenue    = orders.reduce((s, o) => s + (o.total || 0), 0);
    const topProducts = products
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 10)
      .map(p => ({ name: p.name, sales: p.sales || 0, revenue: (p.price || 0) * (p.sales || 0) }));

    res.json({ revenue, orderCount: orders.length, userCount: users.length, topProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admin/seed — seed products ──────────────────────
router.post("/seed", protect, adminOnly, async (req, res) => {
  try {
    const SEED = [
      { name: "iPhone 15 Pro",       price: 134999, stock: 100, category: "Electronics", emoji: "📱", sales: 42, rating: 4.8, description: "Latest Apple flagship" },
      { name: "Samsung OLED TV 65\"", price: 89999,  stock: 10,  category: "Electronics", emoji: "📺", sales: 18, rating: 4.6, description: "65-inch 4K OLED smart TV" },
      { name: "Nike Air Max 270",     price: 8999,   stock: 60,  category: "Fashion",     emoji: "👟", sales: 76, rating: 4.7, description: "Premium comfort running shoes" },
      { name: "Auto Coffee Maker",    price: 3499,   stock: 40,  category: "Home",        emoji: "☕", sales: 55, rating: 4.4, description: "12-cup automatic drip coffee" },
      { name: "Premium Yoga Mat",     price: 1299,   stock: 80,  category: "Sports",      emoji: "🧘", sales: 90, rating: 4.9, description: "Non-slip 6mm thick yoga mat" },
      { name: "Python for Beginners", price: 799,    stock: 100, category: "Books",       emoji: "📖", sales: 120, rating: 4.7, description: "Complete Python guide" },
      { name: "Sony WH-1000XM5",      price: 5999,   stock: 45,  category: "Electronics", emoji: "🎧", sales: 67, rating: 4.9, description: "Noise cancelling headphones" },
      { name: "Samsung Galaxy Watch", price: 12999,  stock: 20,  category: "Electronics", emoji: "⌚", sales: 38, rating: 4.6, description: "Advanced health smartwatch" },
    ];
    await Product.deleteMany({});
    const products = await Product.insertMany(SEED);
    res.json({ message: `Seeded ${products.length} products.`, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/payments ───────────────────────────────────
router.get("/payments", protect, adminOnly, async (req, res) => {
  try {
    const Return = require("../models/Return");
    const [orders, allReturns] = await Promise.all([
      Order.find({ paymentId: { $ne: "" } }).populate("user", "name email").sort({ createdAt: -1 }).lean(),
      Return.find({ status: "Refunded" }).lean(),
    ]);

    const totalRefunded  = allReturns.reduce((s, r) => s + r.refundAmount, 0);
    const totalRevenue   = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders    = orders.length;
    const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const codOrders      = orders.filter(o => o.paymentMethod === "cod").length;
    const onlineOrders   = orders.filter(o => o.paymentMethod !== "cod").length;
    const totalRefunds   = allReturns.length;

    const methodBreakdown = {};
    orders.forEach(o => {
      const m = o.paymentMethod || "unknown";
      if (!methodBreakdown[m]) methodBreakdown[m] = { count: 0, total: 0 };
      methodBreakdown[m].count += 1;
      methodBreakdown[m].total += o.total;
    });

    const dailyRevenue = {};
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }).reverse();
    last7.forEach(day => { dailyRevenue[day] = 0; });
    orders.forEach(o => {
      const day = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (dailyRevenue[day] !== undefined) dailyRevenue[day] += o.total;
    });

    res.json({
      summary: { totalRevenue, totalOrders, avgOrderValue, codOrders, onlineOrders, totalRefunded, totalRefunds },
      methodBreakdown,
      dailyRevenue,
      transactions: orders.map(o => ({
        _id:           o._id,
        orderId:       o._id.toString().slice(-8).toUpperCase(),
        user:          o.user,
        amount:        o.total,
        method:        o.paymentMethod,
        paymentId:     o.paymentId || "COD",
        paymentStatus: o.paymentStatus || "Paid",
        status:        o.status,
        discount:      o.discountAmount || 0,
        coupon:        o.couponCode || "",
        date:          o.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/admin/bank-details — get pending bank details
// ─────────────────────────────────────────────────────────────
router.get("/bank-details", protect, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const status = req.query.status || "pending"; // pending, verified, rejected

    let query = { "bankDetails.accountNumber": { $exists: true, $ne: null } };
    if (status === "pending") query["bankDetails.verified"] = false;
    else if (status === "verified") query["bankDetails.verified"] = true;

    const users = await User.find(query)
      .select("name email phone bankDetails")
      .sort({ "bankDetails.createdAt": -1 })
      .lean();

    res.json({
      users: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        bankDetails: u.bankDetails,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/admin/bank-details/:userId/verify — verify bank details
// ─────────────────────────────────────────────────────────────
router.post("/bank-details/:userId/verify", protect, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const { adminNote } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        "bankDetails.verified": true,
        "bankDetails.adminNote": adminNote || "",
        "bankDetails.verifiedAt": new Date(),
      },
      { new: true }
    ).select("name email bankDetails");

    // Send notification
    try {
      const notify = require("../config/notify");
      await notify(req.params.userId, {
        title: "Bank Details Verified ✅",
        message: "Your bank account details have been verified. You can now receive refunds via bank transfer.",
        type: "payment",
        icon: "🏦",
        link: "profile",
      });
    } catch {}

    res.json({ success: true, user: user.toJSON(), message: "Bank details verified!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/admin/bank-details/:userId/reject — reject bank details
// ─────────────────────────────────────────────────────────────
router.post("/bank-details/:userId/reject", protect, adminOnly, async (req, res) => {
  try {
    const User = require("../models/User");
    const { adminNote } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        "bankDetails.verified": false,
        "bankDetails.adminNote": adminNote || "Bank details rejected. Please resubmit.",
      },
      { new: true }
    ).select("name email bankDetails");

    // Send notification
    try {
      const notify = require("../config/notify");
      await notify(req.params.userId, {
        title: "Bank Details Not Verified",
        message: adminNote || "Your bank details could not be verified. Please check and resubmit.",
        type: "alert",
        icon: "⚠️",
        link: "profile",
      });
    } catch {}

    res.json({ success: true, user: user.toJSON(), message: "Bank details rejected!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
