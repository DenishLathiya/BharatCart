// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name:        { type: String, required: true, trim: true },
//     price:       { type: Number, required: true, min: 0 },
//     stock:       { type: Number, required: true, min: 0, default: 0 },
//     category:    { type: String, required: true, enum: ["Electronics", "Fashion", "Home", "Sports", "Books", "Furniture"] },
//     description: { type: String, default: "" },
//     emoji:       { type: String, default: "📦" },
//     sales:       { type: Number, default: 0 },
//     rating:      { type: Number, default: 4.0, min: 0, max: 5 },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");
 
const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    category:    { type: String, required: true, enum: ["Electronics", "Fashion", "Home", "Sports", "Books", "Furniture"] },
    description: { type: String, default: "" },
    emoji:       { type: String, default: "📦" },
    image:       { type: String, default: "" },  // Cloudinary URL
    images:      { type: [String], default: [] },
    sales:       { type: Number, default: 0 },
    rating:      { type: Number, default: 4.0, min: 0, max: 5 },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Product", productSchema);