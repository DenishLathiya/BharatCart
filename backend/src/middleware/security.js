const rateLimit        = require("express-rate-limit");
const helmet           = require("helmet");
const mongoSanitize    = require("express-mongo-sanitize");
const xss              = require("xss-clean");
const hpp              = require("hpp");

// ── Rate Limiters ────────────────────────────────────────────

// General API limit — 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { message: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1", // skip localhost
});

// Auth limit — 10 attempts per 15 minutes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// OTP limit — 5 OTP requests per hour
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message:  { message: "Too many OTP requests. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Payment limit — 20 payment attempts per hour
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      20,
  message:  { message: "Too many payment attempts. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders:   false,   
});

// Contact form limit — 5 messages per hour
// const contactLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max:      5,
//   message:  { message: "Too many messages sent. Please try again after 1 hour." },
//   standardHeaders: true,
//   legacyHeaders:   false,
// });

// Review limit — 10 reviews per hour
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      10,
  keyGenerator: (req) => req.user._id.toString(),
  message:  { message: "Too many reviews submitted. Please try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Security Headers ─────────────────────────────────────────
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https://res.cloudinary.com", "https://*.razorpay.com"],
      connectSrc:  ["'self'", "https://api.razorpay.com"],
      frameSrc:    ["https://api.razorpay.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  paymentLimiter,
  //  contactLimiter,
  reviewLimiter,
  helmetConfig,
  mongoSanitize,
  xss,
  hpp,
};