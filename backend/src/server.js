const express        = require("express");
const mongoose       = require("mongoose");
const cors           = require("cors");
const dotenv         = require("dotenv");
const {
  generalLimiter,
  authLimiter,
  otpLimiter,
  paymentLimiter,
 // contactLimiter,
  helmetConfig,
  mongoSanitize,
  xss,
  hpp,
} = require("./middleware/security");

dotenv.config();

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmetConfig);          // Security headers
app.use(mongoSanitize());       // Prevent MongoDB injection
app.use(xss());                 // Prevent XSS attacks
app.use(hpp());                 // Prevent HTTP Parameter Pollution

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:4173",
    /\.vercel\.app$/,
  ],
  credentials:     true,
  methods:         ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders:  ["Content-Type", "Authorization"],
}));

// ── Body Parser ──────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Trust Proxy (for rate limiting behind reverse proxy) ─────
app.set("trust proxy", 1);

// ── Request Logger (development) ─────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.path}`);
    next();
  });
}

// ── Database ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

// ── Apply General Rate Limit to all API routes ───────────────
app.use("/api", generalLimiter);

// ── Routes with specific rate limits ─────────────────────────
app.use("/api/auth/login",       authLimiter);
app.use("/api/auth/register",    otpLimiter);
app.use("/api/auth/verify-otp",  authLimiter);
app.use("/api/auth/resend-otp",  otpLimiter);
app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/payments",         paymentLimiter);
//app.use("/api/contacts",         contactLimiter);

// ── Route Handlers ───────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/products",      require("./routes/products"));
app.use("/api/cart",          require("./routes/cart"));
app.use("/api/orders",        require("./routes/orders"));
app.use("/api/wishlist",      require("./routes/wishlist"));
app.use("/api/coupons",       require("./routes/coupons"));
app.use("/api/returns",       require("./routes/returns"));
app.use("/api/payments",      require("./routes/payments"));
app.use("/api/admin",         require("./routes/admin"));
app.use("/api/contacts",      require("./routes/contacts"));
app.use("/api/reviews",       require("./routes/reviews"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/sales",         require("./routes/sales"));
app.use("/api/analytics",     require("./routes/analytics"));
app.use("/api/addresses",     require("./routes/addresses"));
app.use("/api/invoice",       require("./routes/invoice"));
app.use("/api/label",         require("./routes/label"));
app.use("/api/wallet",        require("./routes/wallet"));
app.use("/api/bank", require("./routes/bankDetails"));
app.use("/api/ads",            require("./routes/ads"));

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: errors.join(", ") });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists.` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError")  return res.status(401).json({ message: "Invalid token."  });
  if (err.name === "TokenExpiredError")  return res.status(401).json({ message: "Token expired."  });

  res.status(err.status || 500).json({ message: err.message || "Internal server error." });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BharatCart API running on http://localhost:${PORT}`);
});