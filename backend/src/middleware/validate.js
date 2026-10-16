// ── Input validation helpers ─────────────────────────────────

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone);
};

const validatePincode = (pincode) => {
  return /^\d{6}$/.test(pincode);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// ── Validation middleware for registration ───────────────────
const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters." });
  }
  if (name.length > 50) {
    return res.status(400).json({ message: "Name must be less than 50 characters." });
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }
  if (!password || !validatePassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  if (phone && !validatePhone(phone.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
  }

  // Sanitize
  req.body.name  = name.trim();
  req.body.email = email.toLowerCase().trim();
  next();
};

// ── Validation for product ───────────────────────────────────
const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: "Product name must be at least 2 characters." });
  }
  if (!price || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ message: "Price must be a valid positive number." });
  }
  if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
    return res.status(400).json({ message: "Stock must be a valid non-negative number." });
  }
  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }
  if (Number(price) > 10000000) {
    return res.status(400).json({ message: "Price seems too high. Please check." });
  }

  next();
};

// ── Validation for order ─────────────────────────────────────
const validateOrder = (req, res, next) => {
  const { items, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must contain at least one item." });
  }
  if (!address || !address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
    return res.status(400).json({ message: "Complete delivery address is required." });
  }
  if (!validatePhone(address.phone.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "Invalid phone number in address." });
  }
  if (!validatePincode(address.pincode.replace(/\D/g, ""))) {
    return res.status(400).json({ message: "Invalid pincode in address." });
  }
  if (items.length > 50) {
    return res.status(400).json({ message: "Too many items in cart." });
  }

  next();
};

// ── Validation for review ────────────────────────────────────
const validateReview = (req, res, next) => {
  const { rating, productId, orderId } = req.body;

  if (!productId) return res.status(400).json({ message: "Product ID is required."  });
  if (!orderId)   return res.status(400).json({ message: "Order ID is required."    });
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }
  if (req.body.body && req.body.body.length > 1000) {
    return res.status(400).json({ message: "Review must be less than 1000 characters." });
  }

  next();
};

// ── Sanitize string fields ───────────────────────────────────
const sanitizeBody = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Remove potential script tags
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
        // Remove $ and . from keys to prevent NoSQL injection
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  next();
};

module.exports = {
  validateRegister,
  validateProduct,
  validateOrder,
  validateReview,
  sanitizeBody,
  validateEmail,
  validatePhone,
  validatePincode,
};