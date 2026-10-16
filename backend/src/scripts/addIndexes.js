const mongoose = require("mongoose");
require("dotenv").config();

const addIndexes = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;

  // Products — search and filter
  await db.collection("products").createIndex({ name: "text", description: "text" });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ price: 1 });
  await db.collection("products").createIndex({ rating: -1 });
  await db.collection("products").createIndex({ sales: -1 });
  await db.collection("products").createIndex({ stock: 1 });

  // Orders — user queries and admin
  await db.collection("orders").createIndex({ user: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ status: 1 });
  await db.collection("orders").createIndex({ createdAt: -1 });

  // Users — email lookup (login)
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ createdAt: -1 });

  // Reviews — product queries
  await db.collection("reviews").createIndex({ product: 1, status: 1 });
  await db.collection("reviews").createIndex({ user: 1 });

  // Notifications — user queries
  await db.collection("notifications").createIndex({ user: 1, createdAt: -1 });
  await db.collection("notifications").createIndex({ user: 1, isRead: 1 });

  // Contacts — admin queries
  await db.collection("contacts").createIndex({ status: 1, createdAt: -1 });
  await db.collection("contacts").createIndex({ user: 1 });

  // Returns — user and admin
  await db.collection("returns").createIndex({ user: 1, createdAt: -1 });
  await db.collection("returns").createIndex({ status: 1 });

  // Points history
  await db.collection("pointshistories").createIndex({ user: 1, createdAt: -1 });

  // Addresses
  await db.collection("addresses").createIndex({ user: 1, isDefault: -1 });

  // Sales — active sales query
  await db.collection("sales").createIndex({ isActive: 1, startTime: 1, endTime: 1 });

  console.log("✅ All indexes created successfully!");
  process.exit(0);
};

addIndexes().catch(err => {
  console.error("❌ Index creation failed:", err);
  process.exit(1);
});