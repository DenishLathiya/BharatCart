const express  = require("express");
const router   = express.Router();
const Order    = require("../models/Order");
const User     = require("../models/User");
const Product  = require("../models/Product");
const Return   = require("../models/Return");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/analytics/overview
router.get("/overview", protect, adminOnly, async (req, res) => {
  try {
    const [orders, users, products, returns] = await Promise.all([
      Order.find().lean(),
      User.find({ isAdmin: false }).lean(),
      Product.find().lean(),
      Return.find().lean(),
    ]);

    const now       = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= thisMonth);
    const lastMonthOrders = orders.filter(o => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) <= lastMonthEnd);

    const revenue      = orders.reduce((s, o) => s + (o.total || 0), 0);
    const thisMonthRev = thisMonthOrders.reduce((s, o) => s + (o.total || 0), 0);
    const lastMonthRev = lastMonthOrders.reduce((s, o) => s + (o.total || 0), 0);
    const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : 0;

    const thisMonthUsers = users.filter(u => new Date(u.createdAt) >= thisMonth).length;
    const lastMonthUsers = users.filter(u => new Date(u.createdAt) >= lastMonth && new Date(u.createdAt) <= lastMonthEnd).length;
    const userGrowth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : 0;

    const refundedReturns = returns.filter(r => r.status === "Refunded");
    const totalRefunded   = refundedReturns.reduce((s, r) => s + (r.refundAmount || 0), 0);

    res.json({
      revenue,
      thisMonthRevenue: thisMonthRev,
      revenueGrowth: Number(revenueGrowth),
      totalOrders:   orders.length,
      thisMonthOrders: thisMonthOrders.length,
      totalUsers:    users.length,
      newUsersThisMonth: thisMonthUsers,
      userGrowth:    Number(userGrowth),
      totalProducts: products.length,
      lowStockCount: products.filter(p => p.stock > 0 && p.stock < 10).length,
      outOfStock:    products.filter(p => p.stock === 0).length,
      totalReturns:  returns.length,
      pendingReturns: returns.filter(r => r.status === "Pending").length,
      totalRefunded,
      avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
      deliveredCount: orders.filter(o => o.status === "Delivered").length,
      cancelledCount: orders.filter(o => o.status === "Cancelled").length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/revenue-chart
router.get("/revenue-chart", protect, adminOnly, async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days  = parseInt(period);
    const start = new Date();
    start.setDate(start.getDate() - days);

    const orders = await Order.find({ createdAt: { $gte: start } }).lean();

    const chart = {};
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      chart[key] = { revenue: 0, orders: 0 };
    }

    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (chart[key]) {
        chart[key].revenue += o.total || 0;
        chart[key].orders  += 1;
      }
    });

    res.json(Object.entries(chart).map(([date, data]) => ({ date, ...data })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/category-chart
router.get("/category-chart", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().lean();
    const products = await Product.find().lean();

    const catRevenue = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p._id.toString() === item.product?.toString());
        const cat = product?.category || "Other";
        if (!catRevenue[cat]) catRevenue[cat] = { revenue: 0, orders: 0, units: 0 };
        catRevenue[cat].revenue += item.price * item.qty;
        catRevenue[cat].orders  += 1;
        catRevenue[cat].units   += item.qty;
      });
    });

    res.json(
      Object.entries(catRevenue)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/top-products
router.get("/top-products", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ sales: -1 }).limit(10).lean();
    res.json(products.map(p => ({
      name:    p.name,
      emoji:   p.emoji,
      sales:   p.sales || 0,
      revenue: (p.price || 0) * (p.sales || 0),
      rating:  p.rating || 0,
      stock:   p.stock  || 0,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/customer-chart
router.get("/customer-chart", protect, adminOnly, async (req, res) => {
  try {
    const users  = await User.find({ isAdmin: false }).lean();
    const orders = await Order.find().lean();

    // New users per month (last 6 months)
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      months[key] = { newUsers: 0, orders: 0, revenue: 0 };
    }

    users.forEach(u => {
      const key = new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      if (months[key]) months[key].newUsers += 1;
    });

    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      if (months[key]) {
        months[key].orders  += 1;
        months[key].revenue += o.total || 0;
      }
    });

    res.json(Object.entries(months).map(([month, data]) => ({ month, ...data })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/order-status
router.get("/order-status", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().lean();
    const statusMap = {};
    orders.forEach(o => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });
    res.json(Object.entries(statusMap).map(([status, count]) => ({ status, count })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;    