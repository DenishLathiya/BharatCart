// // backend/src/routes/bankDetails.js
// const express       = require("express");
// const router        = express.Router();
// const BankDetails   = require("../models/BankDetails");
// const RefundRequest = require("../models/RefundRequest");
// const Wallet        = require("../models/Wallet");
// const WalletTransaction = require("../models/WalletTransaction");
// const { protect, adminOnly } = require("../middleware/auth");

// // ─────────────────────────────────────────────────────────────
// // BANK DETAILS ROUTES (User)
// // ─────────────────────────────────────────────────────────────

// // GET /api/bank — get user's bank details
// router.get("/", protect, async (req, res) => {
//   try {
//     const banks = await BankDetails.find({ user: req.user._id }).sort({ isPrimary: -1, createdAt: -1 });
//     res.json(banks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/bank — add bank details
// router.post("/", protect, async (req, res) => {
//   try {
//     const { accountName, accountNumber, ifscCode, bankName, branchName, accountType, upiId, isPrimary } = req.body;

//     if (!accountName || !accountNumber || !ifscCode || !bankName) {
//       return res.status(400).json({ message: "Account name, number, IFSC and bank name are required." });
//     }
//     if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
//       return res.status(400).json({ message: "Invalid IFSC code format. Example: SBIN0001234" });
//     }
//     if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ""))) {
//       return res.status(400).json({ message: "Account number must be 9-18 digits." });
//     }

//     // If primary clear others
//     if (isPrimary) {
//       await BankDetails.updateMany({ user: req.user._id }, { isPrimary: false });
//     }

//     const count = await BankDetails.countDocuments({ user: req.user._id });
//     const bank  = await BankDetails.create({
//       user: req.user._id,
//       accountName:   accountName.trim(),
//       accountNumber: accountNumber.replace(/\s/g, ""),
//       ifscCode:      ifscCode.toUpperCase().trim(),
//       bankName:      bankName.trim(),
//       branchName:    branchName?.trim() || "",
//       accountType:   accountType || "savings",
//       upiId:         upiId?.trim() || "",
//       isPrimary:     isPrimary || count === 0,
//     });

//     res.status(201).json(bank);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/bank/:id — update bank details
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const { isPrimary } = req.body;
//     if (isPrimary) {
//       await BankDetails.updateMany({ user: req.user._id }, { isPrimary: false });
//     }
//     const bank = await BankDetails.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true }
//     );
//     if (!bank) return res.status(404).json({ message: "Bank details not found." });
//     res.json(bank);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE /api/bank/:id — delete bank details
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const bank = await BankDetails.findOneAndDelete({ _id: req.params.id, user: req.user._id });
//     if (!bank) return res.status(404).json({ message: "Bank details not found." });
//     // If deleted was primary set next one as primary
//     if (bank.isPrimary) {
//       const next = await BankDetails.findOne({ user: req.user._id });
//       if (next) { next.isPrimary = true; await next.save(); }
//     }
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // REFUND REQUEST ROUTES (User)
// // ─────────────────────────────────────────────────────────────

// // POST /api/bank/refund-request — user requests bank refund
// router.post("/refund-request", protect, async (req, res) => {
//   try {
//     const { type, amount, reason, bankDetails, orderId, returnId } = req.body;

//     if (!type || !amount || !reason) {
//       return res.status(400).json({ message: "Type, amount and reason are required." });
//     }
//     if (!bankDetails?.method) {
//       return res.status(400).json({ message: "Please provide bank/UPI details for refund." });
//     }
//     if (bankDetails.method === "bank" && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
//       return res.status(400).json({ message: "Account number and IFSC code are required for bank transfer." });
//     }
//     if (bankDetails.method === "upi" && !bankDetails.upiId) {
//       return res.status(400).json({ message: "UPI ID is required." });
//     }

//     // For wallet refund check balance
//     if (type === "wallet") {
//       const wallet = await Wallet.findOne({ user: req.user._id });
//       if (!wallet || wallet.balance < amount) {
//         return res.status(400).json({ message: `Insufficient wallet balance. Available: ₹${wallet?.balance || 0}` });
//       }
//     }

//     const refund = await RefundRequest.create({
//       user: req.user._id,
//       type,
//       amount,
//       reason,
//       bankDetails,
//       orderId:  orderId  || null,
//       returnId: returnId || null,
//       status:   "Pending",
//     });

//     // Notify admin
//     try {
//       const notify = require("../config/notify");
//       // notify admin here if needed
//     } catch {}

//     res.status(201).json(refund);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/bank/refund-requests/my — user's refund requests
// router.get("/refund-requests/my", protect, async (req, res) => {
//   try {
//     const refunds = await RefundRequest.find({ user: req.user._id })
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(refunds);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─────────────────────────────────────────────────────────────
// // ADMIN ROUTES
// // ─────────────────────────────────────────────────────────────

// // GET /api/bank/admin/refund-requests — admin sees all refund requests
// router.get("/admin/refund-requests", protect, adminOnly, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const query = status && status !== "all" ? { status } : {};

//     const refunds = await RefundRequest.find(query)
//       .populate("user", "name email phone")
//       .sort({ createdAt: -1 })
//       .lean();

//     const stats = {
//       total:      await RefundRequest.countDocuments(),
//       pending:    await RefundRequest.countDocuments({ status: "Pending"    }),
//       processing: await RefundRequest.countDocuments({ status: "Processing" }),
//       completed:  await RefundRequest.countDocuments({ status: "Completed"  }),
//       rejected:   await RefundRequest.countDocuments({ status: "Rejected"   }),
//       totalAmount: (await RefundRequest.aggregate([
//         { $match: { status: "Completed" } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]))[0]?.total || 0,
//     };

//     res.json({ refunds, stats });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/bank/admin/refund-requests/:id — admin processes refund
// router.put("/admin/refund-requests/:id", protect, adminOnly, async (req, res) => {
//   try {
//     const { status, adminNote, transactionRef } = req.body;

//     const refund = await RefundRequest.findById(req.params.id).populate("user", "name email");
//     if (!refund) return res.status(404).json({ message: "Refund request not found." });

//     refund.status         = status;
//     refund.adminNote      = adminNote      || "";
//     refund.transactionRef = transactionRef || "";
//     refund.processedBy    = req.user._id;

//     if (status === "Completed" || status === "Rejected") {
//       refund.processedAt = new Date();
//     }

//     // If completed + wallet type → deduct from wallet
//     if (status === "Completed" && refund.type === "wallet") {
//       const wallet = await Wallet.findOne({ user: refund.user._id });
//       if (wallet && wallet.balance >= refund.amount) {
//         wallet.balance -= refund.amount;
//         await wallet.save();

//         await WalletTransaction.create({
//           user:        refund.user._id,
//           type:        "debit",
//           amount:      refund.amount,
//           balance:     wallet.balance,
//           description: `Refund to bank account — Ref: ${transactionRef || "N/A"}`,
//           status:      "success",
//         });
//       }
//     }

//     await refund.save();

//     // Send notification to user
//     try {
//       const notify = require("../config/notify");
//       const messages = {
//         Processing: `Your refund of ₹${refund.amount.toLocaleString("en-IN")} is being processed.`,
//         Completed:  `₹${refund.amount.toLocaleString("en-IN")} has been transferred to your bank account! Ref: ${transactionRef || "N/A"}`,
//         Rejected:   `Your refund request of ₹${refund.amount.toLocaleString("en-IN")} was rejected. ${adminNote || ""}`,
//       };
//       await notify(refund.user._id, {
//         title:   `Refund ${status}`,
//         message: messages[status] || `Your refund request status: ${status}`,
//         type:    "payment",
//         icon:    status === "Completed" ? "💰" : status === "Rejected" ? "❌" : "⏳",
//         link:    "wallet",
//       });
//     } catch {}

//     res.json(refund);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

const express           = require("express");
const router            = express.Router();
const BankDetails       = require("../models/BankDetails");
const RefundRequest     = require("../models/RefundRequest");
const Wallet            = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { protect, adminOnly } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────
// USER ROUTES
// ─────────────────────────────────────────────────────────────

// GET /api/bank
router.get("/", protect, async (req, res) => {
  try {
    const banks = await BankDetails.find({ user: req.user._id })
      .sort({ isPrimary: -1, createdAt: -1 });
    res.json(banks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bank
router.post("/", protect, async (req, res) => {
  try {
    const { accountName, accountNumber, ifscCode, bankName, branchName, accountType, upiId, isPrimary } = req.body;

    if (!accountName || !accountNumber || !ifscCode || !bankName)
      return res.status(400).json({ message: "Account name, number, IFSC and bank name are required." });
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase()))
      return res.status(400).json({ message: "Invalid IFSC code format. Example: SBIN0001234" });
    if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, "")))
      return res.status(400).json({ message: "Account number must be 9-18 digits." });

    if (isPrimary)
      await BankDetails.updateMany({ user: req.user._id }, { isPrimary: false });

    const count = await BankDetails.countDocuments({ user: req.user._id });
    const bank  = await BankDetails.create({
      user:          req.user._id,
      accountName:   accountName.trim(),
      accountNumber: accountNumber.replace(/\s/g, ""),
      ifscCode:      ifscCode.toUpperCase().trim(),
      bankName:      bankName.trim(),
      branchName:    branchName?.trim() || "",
      accountType:   accountType || "savings",
      upiId:         upiId?.trim() || "",
      isPrimary:     isPrimary || count === 0,
    });
    res.status(201).json(bank);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── IMPORTANT: static sub-paths BEFORE /:id ──────────────────

// POST /api/bank/refund-request
router.post("/refund-request", protect, async (req, res) => {
  try {
    const { amount, reason, bankDetails } = req.body;

    if (!amount || amount < 1)
      return res.status(400).json({ message: "Enter a valid amount." });
    if (!reason?.trim())
      return res.status(400).json({ message: "Please provide a reason." });
    if (!bankDetails?.method)
      return res.status(400).json({ message: "Please provide bank/UPI details." });
    if (bankDetails.method === "bank" && (!bankDetails.accountNumber || !bankDetails.ifscCode))
      return res.status(400).json({ message: "Account number and IFSC are required." });
    if (bankDetails.method === "upi" && !bankDetails.upiId)
      return res.status(400).json({ message: "UPI ID is required." });

    const refund = await RefundRequest.create({
      user: req.user._id,
      amount, reason, bankDetails,
      status: "Pending",
    });
    res.status(201).json(refund);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bank/refund-requests/my
router.get("/refund-requests/my", protect, async (req, res) => {
  try {
    const refunds = await RefundRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 }).lean();
    res.json(refunds);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES  (all static paths — must stay above /:id too)
// ─────────────────────────────────────────────────────────────

// GET /api/bank/admin/all?status=pending|verified|rejected
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status === "pending")  filter = { verified: false, rejected: false };
    if (status === "verified") filter = { verified: true };
    if (status === "rejected") filter = { rejected: true };

    const accounts = await BankDetails.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();
    res.json(accounts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bank/admin/refund-requests?status=all|Pending|Processing|Completed|Rejected
router.get("/admin/refund-requests", protect, adminOnly, async (req, res) => {
  try {
    
    const { status } = req.query;
    const query = status && status !== "all" ? { status } : {};
    
    const refunds = await RefundRequest.find(query)
      
      .populate("user", "name email phone")
      .sort({ createdAt: -1 }).lean();

    const stats = {
      total:       await RefundRequest.countDocuments(),
      pending:     await RefundRequest.countDocuments({ status: "Pending"    }),
      processing:  await RefundRequest.countDocuments({ status: "Processing" }),
      completed:   await RefundRequest.countDocuments({ status: "Completed"  }),
      rejected:    await RefundRequest.countDocuments({ status: "Rejected"   }),
      totalAmount: (await RefundRequest.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]))[0]?.total || 0,
    };
    res.json({ refunds, stats });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bank/admin/refund-requests/:id
router.put("/admin/refund-requests/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, transactionRef } = req.body;

    if (status === "Completed" && !transactionRef?.trim())
      return res.status(400).json({ message: "Transaction reference required for completed refunds." });

    const refund = await RefundRequest.findById(req.params.id).populate("user", "name email");
    if (!refund) return res.status(404).json({ message: "Refund request not found." });

    refund.status         = status;
    refund.adminNote      = adminNote      || "";
    refund.transactionRef = transactionRef || "";
    refund.processedBy    = req.user._id;
    if (["Completed", "Rejected"].includes(status)) refund.processedAt = new Date();

    // Deduct wallet on completion
    if (status === "Completed" && refund.type === "wallet") {
      const wallet = await Wallet.findOne({ user: refund.user._id });
      if (wallet && wallet.balance >= refund.amount) {
        wallet.balance -= refund.amount;
        await wallet.save();
        await WalletTransaction.create({
          user:        refund.user._id,
          type:        "debit",
          amount:      refund.amount,
          balance:     wallet.balance,
          description: `Refund to bank — Ref: ${transactionRef || "N/A"}`,
          status:      "success",
        });
      }
    }

    await refund.save();

    try {
      const notify = require("../config/notify");
      const messages = {
        Processing: `Your refund of ₹${refund.amount.toLocaleString("en-IN")} is being processed.`,
        Completed:  `₹${refund.amount.toLocaleString("en-IN")} transferred to your bank! Ref: ${transactionRef || "N/A"}`,
        Rejected:   `Your refund of ₹${refund.amount.toLocaleString("en-IN")} was rejected. ${adminNote || ""}`,
      };
      await notify(refund.user._id, {
        title:   `Refund ${status}`,
        message: messages[status] || `Refund status: ${status}`,
        type:    "payment",
        icon:    status === "Completed" ? "💰" : status === "Rejected" ? "❌" : "⏳",
        link:    "wallet",
      });
    } catch {}

    res.json(refund);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// /:id ROUTES  — must come LAST
// ─────────────────────────────────────────────────────────────

// PUT /api/bank/:id
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.body.isPrimary)
      await BankDetails.updateMany({ user: req.user._id }, { isPrimary: false });

    // Reset verification if sensitive fields changed
    const sensitiveFields = ["accountNumber", "ifscCode", "bankName"];
    if (sensitiveFields.some(f => req.body[f] !== undefined)) {
      req.body.verified  = false;
      req.body.rejected  = false;
      req.body.adminNote = "";
    }

    const bank = await BankDetails.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!bank) return res.status(404).json({ message: "Bank details not found." });
    res.json(bank);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/bank/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const bank = await BankDetails.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bank) return res.status(404).json({ message: "Bank details not found." });
    if (bank.isPrimary) {
      const next = await BankDetails.findOne({ user: req.user._id });
      if (next) { next.isPrimary = true; await next.save(); }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bank/:id/verify  (admin)
router.put("/:id/verify", protect, adminOnly, async (req, res) => {
  try {
    const bank = await BankDetails.findByIdAndUpdate(
      req.params.id,
      { verified: true, rejected: false, adminNote: req.body.adminNote || "" },
      { new: true }
    ).populate("user", "name email");
    if (!bank) return res.status(404).json({ message: "Bank account not found." });

    try {
      const notify = require("../config/notify");
      await notify(bank.user._id, {
        title:   "Bank Account Verified ✅",
        message: `Your bank account (${bank.bankName} ••••${bank.accountNumber.slice(-4)}) has been verified. You can now request refunds.`,
        type:    "payment",
        icon:    "✅",
        link:    "wallet",
      });
    } catch {}

    res.json(bank);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bank/:id/reject  (admin)
router.put("/:id/reject", protect, adminOnly, async (req, res) => {
  try {
    const bank = await BankDetails.findByIdAndUpdate(
      req.params.id,
      { verified: false, rejected: true, adminNote: req.body.adminNote || "" },
      { new: true }
    ).populate("user", "name email");
    if (!bank) return res.status(404).json({ message: "Bank account not found." });

    try {
      const notify = require("../config/notify");
      await notify(bank.user._id, {
        title:   "Bank Account Rejected ❌",
        message: `Your bank account was rejected. ${req.body.adminNote || "Please resubmit with correct details."}`,
        type:    "payment",
        icon:    "❌",
        link:    "wallet",
      });
    } catch {}

    res.json(bank);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;