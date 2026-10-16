// const express = require("express");
// const router = express.Router();
// const Return = require("../models/Return");
// const Order  = require("../models/Order");
// const Refund = require("../models/Refund");
// const Wallet = require("../models/Wallet");
// const WalletTransaction = require("../models/WalletTransaction");
// const { protect, adminOnly } = require("../middleware/auth");

// // POST /api/returns — customer submits return request
// router.post("/", protect, async (req, res) => {
//   try {
//     const { orderId, productId, productName, productEmoji, productPrice, qty, reason, description } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     if (order.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not your order" });
//     }
//     if (order.status !== "Delivered") {
//       return res.status(400).json({ message: "Only delivered orders can be returned" });
//     }

//     const existing = await Return.findOne({ order: orderId, "product.name": productName, user: req.user._id });
//     if (existing) {
//       return res.status(400).json({ message: "Return already requested for this item" });
//     }

//     const ret = await Return.create({
//       order: orderId,
//       user:  req.user._id,
//       product: {
//         id:    productId,
//         name:  productName,
//         emoji: productEmoji || "📦",
//         price: productPrice,
//         qty,
//       },
//       reason,
//       description: description || "",
//       refundAmount: productPrice * qty,
//     });

//     res.status(201).json(ret);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/returns/my — customer's own returns
// router.get("/my", protect, async (req, res) => {
//   try {
//     const returns = await Return.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
//     res.json(returns);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/returns — admin: all returns
// router.get("/", protect, adminOnly, async (req, res) => {
//   try {
//     const returns = await Return.find()
//       .populate("user", "name email")
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(returns);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.put("/:id", protect, adminOnly, async (req, res) => {
//   try {
//     const { status, adminNote, refundMethod } = req.body;

//     const ret = await Return.findById(req.params.id).populate("user", "name email phone");
//     if (!ret) return res.status(404).json({ message: "Return not found" });

//     // If marking as Refunded and wasn't already refunded
//     if (status === "Refunded" && ret.status !== "Refunded") {
//       const Order   = require("../models/Order");
//       const Product = require("../models/Product");
//       const User    = require("../models/User");

//       // 1. Deduct refund amount from the order total
//       await Order.findByIdAndUpdate(ret.order, {
//         $inc: {
//           total:         -ret.refundAmount,
//           discountAmount: ret.refundAmount,
//         },
//         paymentStatus: "Refunded",
//       });

//       // 2. Restock the product
//       await Product.findByIdAndUpdate(ret.product.id, {
//         $inc: {
//           stock: ret.product.qty,
//           sales: -ret.product.qty,
//         },
//       });

//       // 3. Process refund (wallet or bank)
//       const method = refundMethod || "wallet"; // default to wallet
//       const user = await User.findById(ret.user._id);

//       if (method === "wallet") {
//         // Get or create wallet
//         let wallet = await Wallet.findOne({ user: ret.user._id });
//         if (!wallet) wallet = await Wallet.create({ user: ret.user._id, balance: 0 });

//         // Credit wallet
//         wallet.balance += ret.refundAmount;
//         await wallet.save();

//         // Create transaction record
//         await WalletTransaction.create({
//           user: ret.user._id,
//           type: "refund",
//           amount: ret.refundAmount,
//           balance: wallet.balance,
//           description: `Refund for return of ${ret.product.name}`,
//           orderId: ret.order,
//           status: "success",
//         });

//         // Create refund record
//         await Refund.create({
//           user: ret.user._id,
//           order: ret.order,
//           returnRequest: ret._id,
//           amount: ret.refundAmount,
//           method: "wallet",
//           status: "Completed",
//           reason: `Return approved: ${ret.reason}`,
//           processedBy: req.user._id,
//           processedAt: new Date(),
//         });

//         console.log(`✅ Wallet refund processed: ₹${ret.refundAmount} for return ${ret._id}`);
//       } else if (method === "bank") {
//         // Create refund record for bank transfer
//         if (!user.bankDetails?.accountNumber || !user.bankDetails?.ifscCode) {
//           return res.status(400).json({
//             message: "User bank details not found. Please ask user to update bank details or use wallet refund.",
//           });
//         }

//         await Refund.create({
//           user: ret.user._id,
//           order: ret.order,
//           returnRequest: ret._id,
//           amount: ret.refundAmount,
//           method: "bank",
//           status: "Pending",
//           reason: `Return approved: ${ret.reason}`,
//           bankDetails: {
//             accountHolder: user.bankDetails.accountHolder,
//             accountNumber: user.bankDetails.accountNumber,
//             ifscCode: user.bankDetails.ifscCode,
//             bankName: user.bankDetails.bankName,
//           },
//           processedBy: req.user._id,
//         });

//         console.log(`✅ Bank refund initiated: ₹${ret.refundAmount} for return ${ret._id}`);
//       }
//     }

//     // Update return status
//     ret.status    = status;
//     ret.adminNote = adminNote || ret.adminNote;
//     await ret.save();

//     const notify = require("../config/notify");

//     // Inside PUT /:id after update:
//     await notify(ret.user._id, {
//       title:   `Return ${status}`,
//       message: adminNote || `Your return request has been ${status.toLowerCase()}.`,
//       type:    "return",
//       icon:    status === "Refunded" ? "💰" : status === "Approved" ? "✅" : "↩️",
//       link:    "orders",
//     });
//     const updated = await Return.findById(ret._id).populate("user", "name email");
//  // Send email to user about return status update
//     const { sendReturnUpdate } = require("../config/emails");
//     const User = require("../models/User");
//     const user = await User.findById(ret.user._id);
//     if (user?.email) {
//       sendReturnUpdate(user.email, {
//         userName:     user.name,
//         productName:  ret.product?.name,
//         status,
//         adminNote:    adminNote || "",
//         refundAmount: ret.refundAmount,
//       }).catch(console.error);
//     }

//     res.json(updated);
//   } catch (err) {
//     console.error("Return update error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Return = require("../models/Return");
const Order  = require("../models/Order");
const Refund = require("../models/Refund");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/returns — customer submits return request
router.post("/", protect, async (req, res) => {
  try {
    const { orderId, productId, reason, description } = req.body;
    if (!orderId || !productId) {
      return res.status(400).json({ message: "Order and product are required." });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    const orderItem = order.items.find(item => item.product?.toString() === productId?.toString());
    if (!orderItem) {
      return res.status(400).json({ message: "This product was not part of the order." });
    }
    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ message: "A return reason is required." });
    }

    const existing = await Return.findOne({ order: orderId, "product.id": orderItem.product, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Return already requested for this item" });
    }

    const ret = await Return.create({
      order: orderId,
      user:  req.user._id,
      product: {
        id:    orderItem.product,
        name:  orderItem.name,
        emoji: orderItem.emoji || "📦",
        price: orderItem.price,
        qty:   orderItem.qty,
      },
      reason: reason.trim(),
      description: typeof description === "string" ? description.trim().slice(0, 1000) : "",
      refundAmount: orderItem.price * orderItem.qty,
    });

    res.status(201).json(ret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/returns/my — customer's own returns
router.get("/my", protect, async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/returns — admin: all returns
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote, refundMethod, bankAccountId } = req.body;

    const ret = await Return.findById(req.params.id).populate("user", "name email phone");
    if (!ret) return res.status(404).json({ message: "Return not found" });
    const userId = ret.user?._id || ret.user;
    if (!userId) {
      return res.status(409).json({ message: "The customer account for this return no longer exists." });
    }

    const allowedTransitions = {
      Pending: ["Approved", "Rejected"],
      Approved: ["Refunded"],
    };
    if (!allowedTransitions[ret.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change a ${ret.status.toLowerCase()} return to ${status}.` });
    }

    // A payout can only be issued once a return has been approved.
    if (status === "Refunded") {
      if (!["wallet", "bank"].includes(refundMethod)) {
        return res.status(400).json({ message: "Choose wallet or bank as the refund method." });
      }
      const Order   = require("../models/Order");
      const Product = require("../models/Product");
      const User    = require("../models/User");
      const BankDetails = require("../models/BankDetails");

      const method = refundMethod;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Customer not found." });
      let verifiedBankAccount = null;

      if (method === "bank") {
        const verifiedCondition = {
            user: userId,
            $or: [{ verified: true }, { isVerified: true }],
        };
        verifiedBankAccount = bankAccountId
          ? await BankDetails.findOne({ _id: bankAccountId, ...verifiedCondition })
          : (await BankDetails.findOne({ ...verifiedCondition, isPrimary: true })) ||
            (await BankDetails.findOne(verifiedCondition).sort({ createdAt: -1 }));

        if (!verifiedBankAccount || !verifiedBankAccount.accountNumber || !verifiedBankAccount.ifscCode) {
          return res.status(400).json({
            message: "No verified bank account found. Ask the customer to verify one or use wallet refund.",
          });
        }
      }

      if (method === "wallet") {
        // Get or create wallet
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) wallet = await Wallet.create({ user: userId, balance: 0 });

        // Credit wallet
        wallet.balance += ret.refundAmount;
        await wallet.save();

        // Create transaction record
        await WalletTransaction.create({
          user: userId,
          type: "refund",
          amount: ret.refundAmount,
          balance: wallet.balance,
          description: `Refund for return of ${ret.product.name}`,
          orderId: ret.order,
          status: "success",
        });

        // Create refund record
        await Refund.create({
          user: userId,
          order: ret.order,
          returnRequest: ret._id,
          amount: ret.refundAmount,
          method: "wallet",
          status: "Completed",
          reason: `Return approved: ${ret.reason}`,
          processedBy: req.user._id,
          processedAt: new Date(),
        });

        console.log(`✅ Wallet refund processed: ₹${ret.refundAmount} for return ${ret._id}`);
      } else if (method === "bank") {
        await Refund.create({
          user: userId,
          order: ret.order,
          returnRequest: ret._id,
          amount: ret.refundAmount,
          method: "bank",
          status: "Pending",
          reason: `Return approved: ${ret.reason}`,
          bankDetails: {
            accountHolder: verifiedBankAccount.accountName,
            accountNumber: verifiedBankAccount.accountNumber,
            ifscCode: verifiedBankAccount.ifscCode,
            bankName: verifiedBankAccount.bankName,
          },
          processedBy: req.user._id,
        });

        console.log(`✅ Bank refund initiated: ₹${ret.refundAmount} for return ${ret._id}`);
      }

      // Adjust the original order and inventory only after the payout has been
      // successfully created/credited.
      await Order.findByIdAndUpdate(ret.order, {
        $inc: {
          total: -ret.refundAmount,
          discountAmount: ret.refundAmount,
        },
        ...(method === "wallet" ? { paymentStatus: "Refunded" } : {}),
      });
      await Product.findByIdAndUpdate(ret.product.id, {
        $inc: { stock: ret.product.qty, sales: -ret.product.qty },
      });
      ret.refundMethod = method;
    }

    // Update return status
    ret.status    = status;
    ret.adminNote = adminNote || ret.adminNote;
    await ret.save();

    const notify = require("../config/notify");

    // Inside PUT /:id after update:
    await notify(userId, {
      title:   `Return ${status}`,
      message: adminNote || `Your return request has been ${status.toLowerCase()}.`,
      type:    "return",
      icon:    status === "Refunded" ? "💰" : status === "Approved" ? "✅" : "↩️",
      link:    "orders",
    });
    const updated = await Return.findById(ret._id).populate("user", "name email");
    // Send email to user about return status update
    const { sendReturnUpdate } = require("../config/emails");
    const User2 = require("../models/User");
    const emailUser = await User2.findById(userId);
    if (emailUser?.email) {
      sendReturnUpdate(emailUser.email, {
        userName:     emailUser.name,
        productName:  ret.product?.name,
        status,
        adminNote:    adminNote || "",
        refundAmount: ret.refundAmount,
      }).catch(console.error);
    }

    res.json(updated);
  } catch (err) {
    console.error("Return update error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;