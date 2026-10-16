// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // Verify token and attach user to req
// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization?.startsWith("Bearer ")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     if (!req.user) return res.status(401).json({ message: "User not found" });
//     next();
//   } catch {
//     return res.status(401).json({ message: "Not authorized, token invalid" });
//   }
// };



// // Must be admin
// const adminOnly = (req, res, next) => {
//   if (req.user?.isAdmin) return next();
//   return res.status(403).json({ message: "Admin access required" });
// };

// module.exports = { protect, adminOnly };

const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // Get token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Not authorized. Token missing." });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please login again." });
      }
      return res.status(401).json({ message: "Invalid token. Please login again." });
    }

    // Get user
    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }

    // Check account status
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support@BharatCart.com" });
    }
    if (user.accountStatus === "spam") {
      return res.status(403).json({ message: "Your account has been flagged. Please contact support@BharatCart.com" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ message: "Authentication error." });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

module.exports = { protect, adminOnly };