const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/coupons/validate  { code, total }  — public (guests may check coupons)
router.post("/validate", async (req, res) => {
  try {
    const { code, total } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ message: "Invalid or inactive coupon" });
    if (new Date(coupon.expiry) < new Date()) return res.status(400).json({ message: "Coupon has expired" });
    if (typeof total !== "number") return res.status(400).json({ message: "Order total is required to calculate discount" });
    if (total < coupon.minOrder) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });
    const discountAmount = Math.round(total * (coupon.discount / 100));
    res.json({
      code: coupon.code,
      discount: discountAmount,
      discountPercent: coupon.discount,
      minOrder: coupon.minOrder,
      expiry: coupon.expiry,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/coupons — admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons — admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/coupons/:id — admin (toggle active or update)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/coupons/:id — admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
