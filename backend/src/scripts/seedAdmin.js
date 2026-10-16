// backend/src/scripts/seedAdmin.js
// Run once: node src/scripts/seedAdmin.js
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const exists = await User.findOne({ email: "admin@BharatCart.com" });
    if (exists) {
      console.log("Admin user already exists.");
    } else {
      await User.create({
        name: "Admin",
        email: "admin@BharatCart.com",
        password: "admin123",
        isAdmin: true,
      });
      console.log("✅ Admin user created: admin@BharatCart.com / admin123");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
