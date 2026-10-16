const express = require("express");
const Ad = require("../models/Ad");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const allowed = {
  type: ["banner", "card", "strip"],
  position: ["top", "middle", "bottom"],
};

function validateAd(body) {
  if (!body.title || !String(body.title).trim()) return "Ad title is required.";
  if (body.type && !allowed.type.includes(body.type)) return "Invalid ad type.";
  if (body.position && !allowed.position.includes(body.position)) return "Invalid ad position.";
  if (body.priority !== undefined && (!Number.isInteger(Number(body.priority)) || Number(body.priority) < 1 || Number(body.priority) > 10)) {
    return "Priority must be an integer from 1 to 10.";
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find({ active: true }).sort({ priority: 1, createdAt: -1 }).lean();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    res.json(await Ad.find().sort({ priority: 1, createdAt: -1 }).lean());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const error = validateAd(req.body);
    if (error) return res.status(400).json({ message: error });
    res.status(201).json(await Ad.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const error = validateAd(req.body);
    if (error) return res.status(400).json({ message: error });
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ad) return res.status(404).json({ message: "Advertisement not found." });
    res.json(ad);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: "Advertisement not found." });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
