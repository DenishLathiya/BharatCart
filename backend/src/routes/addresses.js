const express = require("express");
const router  = express.Router();
const Address = require("../models/Address");
const { protect } = require("../middleware/auth");

// GET /api/addresses — get all user addresses
router.get("/", protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/addresses — add new address
router.post("/", protect, async (req, res) => {
  try {
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;

    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (phone.length !== 10) {
      return res.status(400).json({ message: "Phone must be 10 digits." });
    }
    if (pincode.length !== 6) {
      return res.status(400).json({ message: "Pincode must be 6 digits." });
    }

    // If setting as default remove default from others
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // If first address make it default
    const count = await Address.countDocuments({ user: req.user._id });
    const address = await Address.create({
      user: req.user._id,
      label: label || "Home",
      name, phone, line1, city, state, pincode,
      isDefault: isDefault || count === 0,
    });

    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/addresses/:id — update address
router.put("/:id", protect, async (req, res) => {
  try {
    const { label, name, phone, line1, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { label, name, phone, line1, city, state, pincode, isDefault },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: "Address not found." });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/addresses/:id — delete address
router.delete("/:id", protect, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: "Address not found." });

    // If deleted address was default set next one as default
    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user._id });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/addresses/:id/default — set as default
router.patch("/:id/default", protect, async (req, res) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: "Address not found." });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;