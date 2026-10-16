// backend/src/routes/wallet.js
const express             = require("express");
const router              = express.Router();
const Razorpay            = require("razorpay");
const crypto              = require("crypto");
const Wallet              = require("../models/Wallet");
const WalletTransaction   = require("../models/WalletTransaction");
const Refund              = require("../models/Refund");
const { protect, adminOnly } = require("../middleware/auth");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Helper: get or create wallet ──────────────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) wallet = await Wallet.create({ user: userId, balance: 0 });
  return wallet;
};

// ─────────────────────────────────────────────────────────────
// GET /api/wallet — get wallet balance + transactions
// ─────────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const wallet       = await getOrCreateWallet(req.user._id);
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({ balance: wallet.balance, transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/topup/create — Step 1: create Razorpay order
// ─────────────────────────────────────────────────────────────
router.post("/topup/create", protect, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ message: "Minimum top-up amount is ₹10." });
    }
    if (amount > 50000) {
      return res.status(400).json({ message: "Maximum top-up amount is ₹50,000." });
    }

    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(amount) * 100, // paise
      currency: "INR",
      receipt:  `wallet_${Date.now()}`,
      notes: {
        userId:  req.user._id.toString(),
        purpose: "wallet_topup",
      },
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        "INR",
      keyId:           process.env.RAZORPAY_KEY_ID,
      userName:        req.user.name,
      userEmail:       req.user.email,
      userPhone:       req.user.phone || "",
    });
  } catch (err) {
    console.error("Wallet topup create error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/topup/verify — Step 2: verify + credit wallet
// ─────────────────────────────────────────────────────────────
router.post("/topup/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // Verify signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    // Credit wallet
    const wallet     = await getOrCreateWallet(req.user._id);
    wallet.balance  += Number(amount);
    await wallet.save();

    // Save transaction
    await WalletTransaction.create({
      user:        req.user._id,
      type:        "credit",
      amount:      Number(amount),
      balance:     wallet.balance,
      description: `Wallet top-up via Razorpay`,
      paymentId:   razorpay_payment_id,
      status:      "success",
    });

    // Send notification
    try {
      const notify = require("../config/notify");
      await notify(req.user._id, {
        title:   "Wallet Credited! 💰",
        message: `₹${Number(amount).toLocaleString("en-IN")} added to your BharatCart wallet. New balance: ₹${wallet.balance.toLocaleString("en-IN")}`,
        type:    "payment",
        icon:    "💰",
        link:    "wallet",
      });
    } catch {}

    res.json({
      success:    true,
      balance:    wallet.balance,
      credited:   Number(amount),
      paymentId:  razorpay_payment_id,
    });
  } catch (err) {
    console.error("Wallet topup verify error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/pay — pay for order using wallet
// ─────────────────────────────────────────────────────────────
router.post("/pay", protect, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount." });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    if (wallet.balance < amount) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Available: ₹${wallet.balance}`,
      });
    }

    // Deduct from wallet
    wallet.balance -= Number(amount);
    await wallet.save();

    // Save transaction
    await WalletTransaction.create({
      user:        req.user._id,
      type:        "debit",
      amount:      Number(amount),
      balance:     wallet.balance,
      description: description || `Payment for order`,
      orderId:     orderId || null,
      status:      "success",
    });

    res.json({ success: true, balance: wallet.balance, deducted: Number(amount) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/refund — refund to wallet (admin/returns)
// ─────────────────────────────────────────────────────────────
router.post("/refund", protect, async (req, res) => {
  try {
    const { userId, amount, orderId, description } = req.body;

    const targetUser = userId || req.user._id;
    const wallet     = await getOrCreateWallet(targetUser);
    wallet.balance  += Number(amount);
    await wallet.save();

    await WalletTransaction.create({
      user:        targetUser,
      type:        "refund",
      amount:      Number(amount),
      balance:     wallet.balance,
      description: description || "Refund credited to wallet",
      orderId:     orderId || null,
      status:      "success",
    });

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/wallet/admin/all — admin view all wallets
// ─────────────────────────────────────────────────────────────
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate("user", "name email phone")
      .sort({ balance: -1 })
      .lean();

    const total = wallets.reduce((s, w) => s + w.balance, 0);
    res.json({ wallets, totalBalance: total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/admin/credit — admin manually credit wallet
// ─────────────────────────────────────────────────────────────
router.post("/admin/credit", protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    if (!userId || !amount) return res.status(400).json({ message: "User ID and amount required." });

    const wallet    = await getOrCreateWallet(userId);
    wallet.balance += Number(amount);
    await wallet.save();

    await WalletTransaction.create({
      user:        userId,
      type:        "cashback",
      amount:      Number(amount),
      balance:     wallet.balance,
      description: description || "Admin credit",
      status:      "success",
    });

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/wallet/admin/refund — admin process refund (wallet/bank)
// ─────────────────────────────────────────────────────────────
router.post("/admin/refund", protect, adminOnly, async (req, res) => {
  try {
    const { userId, amount, method, orderId, returnId, reason } = req.body;
    if (!userId || !amount || !method) {
      return res.status(400).json({ message: "User ID, amount, and method required." });
    }
    if (!["wallet", "bank"].includes(method)) {
      return res.status(400).json({ message: "Method must be 'wallet' or 'bank'." });
    }

    const User = require("../models/User");
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    let refundRecord = {};

    // Wallet refund - immediate credit
    if (method === "wallet") {
      const wallet = await getOrCreateWallet(userId);
      wallet.balance += Number(amount);
      await wallet.save();

      await WalletTransaction.create({
        user: userId,
        type: "refund",
        amount: Number(amount),
        balance: wallet.balance,
        description: reason || "Admin refund to wallet",
        orderId: orderId || null,
        status: "success",
      });

      refundRecord = await Refund.create({
        user: userId,
        order: orderId || null,
        returnRequest: returnId || null,
        amount: Number(amount),
        method: "wallet",
        status: "Completed",
        reason: reason || "",
        processedBy: req.user._id,
        processedAt: new Date(),
      });

      // Send notification
      try {
        const notify = require("../config/notify");
        await notify(userId, {
          title: "Refund Credited! 💰",
          message: `₹${Number(amount).toLocaleString("en-IN")} refund added to your wallet.`,
          type: "payment",
          icon: "💰",
          link: "wallet",
        });
      } catch {}

      return res.json({
        success: true,
        refund: refundRecord,
        message: `Refund of ₹${Number(amount).toLocaleString("en-IN")} added to wallet`,
      });
    }

    // Bank refund - pending processing
    if (method === "bank") {
      if (!user.bankDetails?.accountNumber || !user.bankDetails?.ifscCode) {
        return res.status(400).json({
          message: "User bank details not found. Ask user to update bank details.",
        });
      }

      refundRecord = await Refund.create({
        user: userId,
        order: orderId || null,
        returnRequest: returnId || null,
        amount: Number(amount),
        method: "bank",
        status: "Pending",
        reason: reason || "",
        bankDetails: {
          accountHolder: user.bankDetails.accountHolder,
          accountNumber: user.bankDetails.accountNumber,
          ifscCode: user.bankDetails.ifscCode,
          bankName: user.bankDetails.bankName,
        },
        processedBy: req.user._id,
      });

      // Send notification
      try {
        const notify = require("../config/notify");
        await notify(userId, {
          title: "Refund Initiated! 💳",
          message: `₹${Number(amount).toLocaleString("en-IN")} refund initiated to your bank account. It will be processed within 3-5 business days.`,
          type: "payment",
          icon: "💳",
          link: "orders",
        });
      } catch {}

      return res.json({
        success: true,
        refund: refundRecord,
        message: `Bank refund initiated. It will be processed within 3-5 business days.`,
      });
    }
  } catch (err) {
    console.error("Admin refund error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/wallet/admin/bank-refunds — view pending bank refunds
// ─────────────────────────────────────────────────────────────
router.get("/admin/bank-refunds", protect, adminOnly, async (req, res) => {
  try {
    const status = req.query.status || "Pending";
    const refunds = await Refund.find({ method: "bank", status })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      refunds,
      total: refunds.reduce((sum, r) => sum + r.amount, 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/wallet/admin/bank-refunds/:id — update bank refund status
// ─────────────────────────────────────────────────────────────
router.put("/admin/bank-refunds/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, transactionId, adminNote } = req.body;
    if (!["Processing", "Completed", "Failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    if (status === "Completed" && !transactionId?.trim()) {
      return res.status(400).json({ message: "Transaction reference is required to complete a bank payout." });
    }

    const refund = await Refund.findOne({ _id: req.params.id, method: "bank" });

    if (!refund) return res.status(404).json({ message: "Refund not found." });
    const allowedTransitions = {
      Pending: ["Processing", "Failed"],
      Processing: ["Completed", "Failed"],
      Failed: ["Processing"],
    };
    if (!allowedTransitions[refund.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change a ${refund.status.toLowerCase()} payout to ${status}.` });
    }

    refund.status = status;
    if (adminNote !== undefined) refund.adminNote = adminNote;
    if (transactionId) refund.bankDetails.transactionId = transactionId.trim();
    if (status === "Completed") refund.processedAt = new Date();
    await refund.save();
    await refund.populate("user", "name email");

    if (status === "Completed" && refund.returnRequest) {
      const Return = require("../models/Return");
      await Return.findByIdAndUpdate(refund.returnRequest, {
        transactionRef: transactionId.trim(),
      });
    }

    // Send notification to user
    try {
      const notify = require("../config/notify");
      const messages = {
        Processing: `Your refund of ₹${refund.amount.toLocaleString("en-IN")} is being processed.`,
        Completed: `Your refund of ₹${refund.amount.toLocaleString("en-IN")} has been completed. Transaction ID: ${transactionId}`,
        Failed: `Your refund failed. Contact support for assistance.`,
      };
      await notify(refund.user._id, {
        title: `Bank Refund ${status}`,
        message: messages[status],
        type: "payment",
        icon: status === "Completed" ? "✅" : "ℹ️",
        link: "orders",
      });
    } catch {}

    res.json({ success: true, refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;