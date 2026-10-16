const express = require("express");
const router  = express.Router();
const Review  = require("../models/Review");
const Product = require("../models/Product");
const Order   = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");
const { validateReview } = require("../middleware/validate");
const { reviewLimiter } = require("../middleware/security");

// GET /api/reviews/admin/all — admin sees all reviews
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user",    "name email")
      .populate("product", "name emoji")
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/:productId — get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status:  "published",
    })
      .populate("user", "name")
      .populate("order", "_id")
      .sort({ createdAt: -1 })
      .lean();

    const total  = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / total
      : 0;

    // Rating breakdown (5★ count, 4★ count etc)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

    res.json({ reviews, total, avgRating: Math.round(avgRating * 10) / 10, breakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews — submit a review (only verified buyers)
router.post("/", protect, validateReview, reviewLimiter, async (req, res) => {
  try {
    const { productId, orderId, rating, title, body } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ message: "Product, order and rating are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Verify the user actually bought this product in this order
    const order = await Order.findOne({
      _id:    orderId,
      user:   req.user._id,
      status: "Delivered",
    });
    if (!order) {
      return res.status(403).json({ message: "You can only review products from delivered orders." });
    }

    const boughtProduct = order.items.find(
      item => item.product?.toString() === productId
    );
    if (!boughtProduct) {
      return res.status(403).json({ message: "This product was not in your order." });
    }

    // Check if already reviewed
    const existing = await Review.findOne({
      product: productId,
      user:    req.user._id,
      order:   orderId,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }

    const review = await Review.create({
      product:  productId,
      user:     req.user._id,
      order:    orderId,
      rating,
      title:    title?.trim() || "",
      body:     body?.trim()  || "",
      verified: true,
    });

    // Update product average rating
    const allReviews = await Review.find({ product: productId, status: "published" });
    const newAvg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(newAvg * 10) / 10,
    });

    const populated = await Review.findById(review._id).populate("user", "name");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id — admin deletes a review
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "hidden" },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found." });

    // Recalculate product rating
    const allReviews = await Review.find({ product: review.product, status: "published" });
    const newAvg = allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(newAvg * 10) / 10 });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;