const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { cloudinary, upload } = require("../config/cloudinary");
const { validateProduct } = require("../middleware/validate");
const { cacheResponse, clearCache } = require("../middleware/cache");

const getProductImages = product => [
  ...new Set([...(product.images || []), product.image].filter(Boolean)),
];
const getUploadedImages = files => [
  ...(files?.images || []).map(file => file.path),
  ...(files?.image || []).map(file => file.path),
];

const destroyCloudinaryImage = async imageUrl => {
  const marker = "/BharatCart/products/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return;
  const publicId = `BharatCart/products/${imageUrl.slice(markerIndex + marker.length).replace(/\.[^/.]+$/, "")}`;
  await cloudinary.uploader.destroy(publicId);
};

const resolveProductImages = (value, uploadedImages) => {
  if (value === undefined) return null;
  let images;
  try {
    images = JSON.parse(value);
  } catch {
    throw new Error("Product images must be a valid image list.");
  }
  if (!Array.isArray(images) || images.some(image => typeof image !== "string")) {
    throw new Error("Product images must be a valid image list.");
  }
  const resolved = images.map(image => {
    const uploadMatch = image.match(/^upload:(\d+)$/);
    if (uploadMatch) return uploadedImages[Number(uploadMatch[1])];
    return image;
  });
  if (resolved.some(image => typeof image !== "string" || !image)) {
    throw new Error("Product image upload order is invalid.");
  }
  const uniqueImages = [...new Set(resolved)];
  if (uniqueImages.length > 8) {
    throw new Error("A product can have up to 8 images.");
  }
  return uniqueImages;
};

// GET /api/products
router.get("/", cacheResponse(300), async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
    let query = Product.find(filter);
    if (sort === "price_asc")  query = query.sort({ price:  1 });
    if (sort === "price_desc") query = query.sort({ price: -1 });
    if (sort === "rating")     query = query.sort({ rating: -1 });
    if (sort === "popular")    query = query.sort({ sales:  -1 });
    res.json(await query.lean());
  } catch (err) { res.status(500).json({ message: err.message }); }
});
 
// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
 
// POST /api/products — admin + optional image
router.post("/", protect, adminOnly, upload.fields([{ name: "images", maxCount: 8 }, { name: "image", maxCount: 1 }]), validateProduct, async (req, res) => {
  try {
    const data = { ...req.body, price: Number(req.body.price), stock: Number(req.body.stock), rating: Number(req.body.rating) || 4.0 };
    const uploadedImages = getUploadedImages(req.files);
    data.images = resolveProductImages(req.body.images, uploadedImages) || uploadedImages.slice(0, 8);
    data.image = data.images[0] || "";
    const product = await Product.create(data);
    clearCache("/api/products");
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
 
// PUT /api/products/:id — admin + optional new image
router.put("/:id", protect, adminOnly, upload.fields([{ name: "images", maxCount: 8 }, { name: "image", maxCount: 1 }]), validateProduct, async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });
    const data = { ...req.body };
    if (data.price)  data.price  = Number(data.price);
    if (data.stock)  data.stock  = Number(data.stock);
    if (data.rating) data.rating = Number(data.rating);
    const previousImages = getProductImages(existing);
    const uploadedImages = getUploadedImages(req.files);
    const legacyImage = req.files?.image?.[0]?.path;
    if (req.body.images === undefined && legacyImage) {
      data.images = [legacyImage, ...previousImages.filter(image => image !== previousImages[0])].slice(0, 8);
    } else {
      data.images = resolveProductImages(req.body.images, uploadedImages) || [...previousImages, ...uploadedImages].slice(0, 8);
    }
    data.image = data.images[0] || "";
    const removedImages = previousImages.filter(image => !data.images.includes(image));
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    for (const image of removedImages) {
      try {
        await destroyCloudinaryImage(image);
      } catch (err) {
        console.error("Failed to remove old product image:", err.message);
      }
    }
    clearCache("/api/products");
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
 
// DELETE /api/products/:id — admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    for (const image of getProductImages(product)) {
      try {
        await destroyCloudinaryImage(image);
      } catch (err) {
        console.error("Failed to remove product image:", err.message);
      }
    }
    await product.deleteOne();
    clearCache("/api/products");
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
 
module.exports = router;