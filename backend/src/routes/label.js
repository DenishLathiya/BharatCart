// backend/src/routes/label.js
// ─────────────────────────────────────────────────────────────
//  GET /api/label/:orderId  — generate shipping label PDF
//  Admin only
// ─────────────────────────────────────────────────────────────

const express  = require("express");
const router   = express.Router();
const PDFKit   = require("pdfkit");
const Order    = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/:orderId", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email phone")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found." });

    // ── PDF Setup ────────────────────────────────────────────
    const doc = new PDFKit({
      size:    [400, 550],   // label size in points (about A5 landscape)
      margin:  0,
      info: {
        Title:   `Shipping Label - ${order._id.toString().slice(-8).toUpperCase()}`,
        Author:  "BharatCart",
      },
    });

    res.setHeader("Content-Type",        "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=BharatCart-Label-${order._id.toString().slice(-8).toUpperCase()}.pdf`);
    doc.pipe(res);

    // ── Colors ───────────────────────────────────────────────
    const DARK   = "#0f0e0b";
    const GOLD   = "#c9a84c";
    const WHITE  = "#ffffff";
    const GRAY   = "#666666";
    const LIGHT  = "#f5f4f0";
    const BORDER = "#e0ddd5";
    const GREEN  = "#2a9d6e";

    const W = 400;
    const H = 550;

    // ── Background ───────────────────────────────────────────
    doc.rect(0, 0, W, H).fill(WHITE);

    // ── TOP HEADER BAR ───────────────────────────────────────
    doc.rect(0, 0, W, 70).fill(DARK);

    // Logo text
    doc
      .fillColor(GOLD)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("BharatCart", 20, 15);

    // Tagline
doc
  .fillOpacity(0.5)
  .fillColor(WHITE)
  .fontSize(8)
  .font("Helvetica")
  .text("Premium Shopping | Fast Delivery", 20, 42);

doc.fillOpacity(1);

    // SHIPPING LABEL badge on right
    doc
      .rect(W - 140, 12, 125, 46)
      .fill(GOLD);

    doc
      .fillColor(DARK)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("SHIPPING LABEL", W - 136, 20, { width: 118, align: "center" });

    doc
      .fillColor(DARK)
      .fontSize(9)
      .font("Helvetica")
      .text(order.shipment?.provider || "BharatCart Logistics", W - 136, 34, { width: 118, align: "center" });

    if (order.shipment?.trackingNumber) {
      doc
        .fillColor(DARK)
        .fontSize(7)
        .font("Helvetica-Bold")
        .text(order.shipment.trackingNumber, W - 136, 47, { width: 118, align: "center" });
    }

    // ── ORDER ID BAR ─────────────────────────────────────────
    doc.rect(0, 70, W, 36).fill(LIGHT);

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text("ORDER ID", 20, 78);

    doc
      .fillColor(DARK)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`#${order._id.toString().slice(-8).toUpperCase()}`, 20, 90);

    // Date on right
    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }), W - 110, 78, { width: 90, align: "right" });

    doc
      .fillColor(DARK)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(order.paymentMethod === "cod" ? "COD" : "PAID", W - 110, 90, { width: 90, align: "right" });

    // ── DIVIDER ──────────────────────────────────────────────
    const divider = (y) => doc.moveTo(20, y).lineTo(W - 20, y).strokeColor(BORDER).lineWidth(1).stroke();

    // ── FROM SECTION ─────────────────────────────────────────
    let y = 120;

    doc
      .fillColor(GRAY)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("FROM", 20, y);

    doc
      .rect(20, y + 10, (W / 2) - 30, 80)
      .fill(LIGHT);

    doc
      .fillColor(DARK)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("BharatCart Pvt. Ltd.", 28, y + 16);

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica")
      .text(
        "123 Commerce Street\nAndheri East, Mumbai\nMaharashtra - 400069\nIndia\n Contact: +91 98765 43210",
        28, y + 30,
        { lineGap: 3 }
      );

    // ── TO SECTION ───────────────────────────────────────────
    doc
      .fillColor(GRAY)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text(" TO", W / 2 + 10, y);

    doc
      .rect(W / 2 + 10, y + 10, (W / 2) - 30, 80)
      .fill(DARK);

    const addr = order.address || {};

    doc
      .fillColor(GOLD)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(addr.name || order.user?.name || "Customer", W / 2 + 18, y + 16, { width: (W / 2) - 46 });

    doc
      .fillColor(WHITE)
      .fontSize(8)
      .font("Helvetica")
      .text(
        [
          addr.phone ? `Phone: ${addr.phone}` : (order.user?.phone ? `📱 ${order.user.phone}` : ""),
          addr.line1 || "",
          addr.city && addr.state ? `${addr.city}, ${addr.state}` : addr.city || addr.state || "",
          addr.pincode ? `PIN: ${addr.pincode}` : "",
          "India",
        ].filter(Boolean).join("\n"),
        W / 2 + 18, y + 32,
        { lineGap: 3, width: (W / 2) - 46 }
      );

    // ── DIVIDER ──────────────────────────────────────────────
    y = 220;
    divider(y);

    // ── ORDER ITEMS ──────────────────────────────────────────
    y = 230;

    doc
      .fillColor(GRAY)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("ORDER CONTENTS", 20, y);

    y += 12;

    // Items table header
    doc.rect(20, y, W - 40, 18).fill(DARK);
    doc
      .fillColor(WHITE)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("ITEM",  28,  y + 5)
      .text("QTY",   280, y + 5)
      .text("PRICE", 320, y + 5);

    y += 18;

    // Items rows
    const items = order.items || [];
    items.slice(0, 5).forEach((item, i) => {
      const bg = i % 2 === 0 ? WHITE : LIGHT;
      doc.rect(20, y, W - 40, 18).fill(bg);
      doc
        .fillColor(DARK)
        .fontSize(8)
        .font("Helvetica")
        .text(`*** ${item.name}`, 28, y + 5, { width: 245, ellipsis: true });
      doc
        .text(`×${item.qty}`, 280, y + 5, { width: 35, align: "center" });
      doc
        .fillColor(GRAY)
        .text(`Rs. ${(item.price * item.qty).toLocaleString("en-IN")}`, 320, y + 5, { width: 55, align: "right" });
      y += 18;
    });

    if (items.length > 5) {
      doc
        .fillColor(GRAY)
        .fontSize(7)
        .font("Helvetica")
        .text(`+ ${items.length - 5} more item(s)`, 28, y + 4);
      y += 16;
    }

    // ── DIVIDER ──────────────────────────────────────────────
    divider(y + 4);
    y += 14;

    // ── PAYMENT SUMMARY ──────────────────────────────────────
    doc
      .fillColor(GRAY)
      .fontSize(7)
      .font("Helvetica-Bold")
      .text("PAYMENT SUMMARY", 20, y);

    y += 12;

    const summaryRows = [
      { label: "Subtotal",    value: `Rs. ${(order.subtotal || order.total || 0).toLocaleString("en-IN")}` },
      order.discountAmount > 0 && { label: "Discount",   value: `- Rs. ${order.discountAmount.toLocaleString("en-IN")}` },
      { label: "Delivery",    value: (order.subtotal || 0) > 999 ? "FREE" : "49" },
      { label: "Payment",     value: (order.paymentMethod || "").toUpperCase() },
    ].filter(Boolean);

    summaryRows.forEach(row => {
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica")
        .text(row.label, 20, y);
      doc
        .fillColor(DARK)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(row.value, W - 120, y, { width: 100, align: "right" });
      y += 14;
    });

    // Total row
    doc.rect(20, y, W - 40, 24).fill(DARK);
    doc
      .fillColor(WHITE)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("TOTAL AMOUNT", 28, y + 7);
    doc
      .fillColor(GOLD)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Rs. ${(order.total || 0).toLocaleString("en-IN")}`, W - 130, y + 7, { width: 100, align: "right" });

    y += 24;

    // ── COD NOTICE ───────────────────────────────────────────
    if (order.paymentMethod === "cod") {
      y += 6;
      doc
  .save()
  .fillOpacity(0.12)
  .rect(20, y, W - 40, 26)
  .fill("#f59e0b")
  .restore();

doc
  .rect(20, y, W - 40, 26)
  .lineWidth(1)
  .stroke("#f59e0b");
  
      doc
        .fillColor("#d97706")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`COLLECT Rs. ${(order.total || 0).toLocaleString("en-IN")} CASH ON DELIVERY`, 28, y + 8, {
          width: W - 56,
          align: "center",
          lineBreak: false,
          fit: "shrink",
        });
      y += 26;
    }

    // ── DIVIDER ──────────────────────────────────────────────
    y += 6;
    divider(y);
    y += 10;

    // ── BARCODE PLACEHOLDER (visual) ─────────────────────────
    // Draw a fake barcode using lines
    const barcodeX  = 20;
    const barcodeY  = y;
    const barcodeW  = 120;
    const barcodeH  = 30;

    doc.rect(barcodeX, barcodeY, barcodeW, barcodeH).fill(WHITE).stroke(BORDER);

    // Draw barcode lines
    const lineWidths  = [1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3, 1, 2, 1];
    let bx = barcodeX + 5;
    lineWidths.forEach((w, i) => {
      if (i % 2 === 0) {
        doc.rect(bx, barcodeY + 4, w, barcodeH - 10).fill(DARK);
        
      }
      bx += w + 2;
    });

    doc
      .fillColor(DARK)
      .fontSize(7)
      .font("Helvetica")
      .text(order._id.toString().slice(-12).toUpperCase(), barcodeX, barcodeY + barcodeH + 2, { width: barcodeW, align: "center" });

    // ── STATUS BADGE ─────────────────────────────────────────
    const statusColors = {
      Processing:        [96,  141, 220],
      Shipped:           [245, 158, 11 ],
      "Out for Delivery":[245, 158, 11 ],
      Delivered:         [42,  157, 110],
      Cancelled:         [224, 92,  92 ],
    };
    const sc = statusColors[order.status] || [100, 100, 100];

    doc
      .rect(W - 130, barcodeY, 110, barcodeH)
      .fill(`rgb(${sc[0]},${sc[1]},${sc[2]})`);

    doc
      .fillColor(WHITE)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(order.status || "Processing", W - 130, barcodeY + 4, { width: 110, align: "center" });

    doc
      .fillColor(WHITE)
      .fontSize(7)
      .font("Helvetica")
      .text("ORDER STATUS", W - 130, barcodeY + 18, { width: 110, align: "center" });

    // ── FOOTER ───────────────────────────────────────────────
    doc.rect(0, H - 36, W, 36).fill(DARK);

    doc
      .fillColor("rgba(255,255,255,0.5)")
      .fontSize(7)
      .font("Helvetica")
      .text("Thank you for shopping with BharatCart!", 20, H - 26, { width: W - 40, align: "center" });

    doc
      .fillColor(GOLD)
      .fontSize(7)
      .text("www.bharatcart.com  |  support@bharatcart.com  |  +91 98765 43210", 20, H - 14, { width: W - 40, align: "center" });

    doc.end();
  } catch (err) {
    console.error("Label error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;