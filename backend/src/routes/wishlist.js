const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const { protect } = require("../middleware/auth");

// GET /api/wishlist
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    res.json(wishlist ? wishlist.products.map(p => p._id) : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wishlist/toggle  { productId }
router.post("/toggle", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    } else {
      const idx = wishlist.products.indexOf(productId);
      if (idx === -1) {
        wishlist.products.push(productId);
      } else {
        wishlist.products.splice(idx, 1);
      }
    }
    await wishlist.save();
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
