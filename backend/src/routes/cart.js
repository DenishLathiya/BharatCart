const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

// Helper: get populated cart for a user
const getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) return { items: [] };
  // shape items to { id, qty, ...product fields }
  return {
    items: cart.items
      .filter(i => i.product)
      .map(i => ({
        id:          i.product._id,
        qty:         i.qty,
        name:        i.product.name,
        price:       i.product.price,
        emoji:       i.product.emoji,
        stock:       i.product.stock,
        category:    i.product.category,
        description: i.product.description,
        rating:      i.product.rating,
      })),
  };
};

// GET /api/cart
router.get("/", protect, async (req, res) => {
  try {
    res.json(await getCart(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart/add  { productId }
router.post("/add", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock === 0) return res.status(400).json({ message: "Out of stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.items.push({ product: productId, qty: 1 });
    }
    await cart.save();
    res.json(await getCart(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cart/qty  { productId, delta }
router.put("/qty", protect, async (req, res) => {
  try {
    const { productId, delta } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        cart.items = cart.items.filter(i => i.product.toString() !== productId);
      }
    }
    await cart.save();
    res.json(await getCart(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart/:productId
router.delete("/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json(await getCart(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart  (clear)
router.delete("/", protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
