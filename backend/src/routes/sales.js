const express = require("express");
const router  = express.Router();
const Sale    = require("../models/Sale");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/sales/active — get currently active sales (public)
router.get("/active", async (req, res) => {
  try {
    const now   = new Date();
    const sales = await Sale.find({
      isActive:  true,
      startTime: { $lte: now },
      endTime:   { $gte: now },
    }).populate("products", "name emoji price category").lean();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sales — admin: all sales
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("products", "name emoji price")
      .sort({ createdAt: -1 }).lean();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sales — admin: create sale
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, discount, startTime, endTime, products, categories, badge } = req.body;
    if (!title || !discount || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, discount, start and end time are required." });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: "End time must be after start time." });
    }
    const sale = await Sale.create({ title, description, discount, startTime, endTime, products: products || [], categories: categories || [], badge: badge || "🔥 SALE", isActive: true });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/sales/:id — admin: update sale
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: "Sale not found." });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/sales/:id — admin: delete sale
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;