const express  = require("express");
const router   = express.Router();
const PDFKit   = require("pdfkit");
const Order    = require("../models/Order");
const { protect } = require("../middleware/auth");

// GET /api/invoice/:orderId — generate and download PDF invoice
router.get("/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email phone")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Make sure user owns this order
    const orderUserId = order.user?._id || order.user;
    if (!orderUserId || orderUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Create PDF with tighter margins to keep the invoice on one page
    const doc = new PDFKit({ margin: 36, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type",        "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=BharatCart-Invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // ── Colors & fonts ──────────────────────────────────────
    const GOLD    = "#c9a84c";
    const DARK    = "#1a1a2e";
    const GRAY    = "#666666";
    const LIGHT   = "#f5f5f5";
    const BLACK   = "#333333";
    const SUCCESS = "#15754d";
    const PANEL   = "#faf7f1";
    const BORDER  = "#e7dcc3";
    const SOFT    = "#f0f7f3";
    const CONTENT_X = 50;
    const CONTENT_W = doc.page.width - CONTENT_X * 2;
    const FOOTER_Y = doc.page.height - 90;
    const formatMoney = value => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

    const drawFooter = () => {
      const footerY = doc.page.height - 90;
      doc.moveTo(CONTENT_X, footerY).lineTo(doc.page.width - CONTENT_X, footerY).strokeColor("#e0e0e0").lineWidth(1).stroke();
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica")
        .text("Thank you for shopping with BharatCart! For any queries, contact us at support@bharatcart.com", CONTENT_X, footerY + 10, { align: "center", width: CONTENT_W, lineBreak: false });
      doc
        .fillColor(GRAY)
        .fontSize(8)
        .text("This is a BharatCart-generated invoice.", CONTENT_X, footerY + 24, { align: "center", width: CONTENT_W, lineBreak: false });
    };

    doc.on("error", err => {
      console.error("Invoice PDF stream error:", err);
      if (!res.headersSent) res.status(500).json({ message: "Failed to generate invoice." });
      else res.destroy(err);
    });
    res.on("error", err => console.error("Invoice response stream error:", err));

    // ── Header ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 130).fill(DARK);

    doc
      .fillColor(GOLD)
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("BharatCart", 50, 40);

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica")
      .text("Your Premium Shopping Destination", 50, 72);

    doc
      .fillColor(GOLD)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("INVOICE", 400, 40, { align: "right", width: 145 });

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica")
      .text(`#${order._id.toString().slice(-8).toUpperCase()}`, 400, 70, { align: "right", width: 145 });

    // doc
    //   .fillColor("rgba(255,255,255,0.6)")
    //   .fontSize(9)
    //   .text(new Date(order.createdAt).toLocaleDateString("en-IN", {
    //     day: "2-digit", month: "long", year: "numeric",
    //   }), 400, 88, { align: "right", width: 145 });

    doc
      .fillColor("#d7f7e0")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("PAID", 455, 94, { align: "right", width: 90 });

    // ── Billing cards ───────────────────────────────────────
    const infoY = 155;
    const infoBoxW = CONTENT_W;

    doc.roundedRect(50, infoY, infoBoxW, 92, 14).fill(PANEL).stroke(BORDER);

    const fromX = 70;
    const toX = 325;

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("FROM", fromX, infoY + 12);

    doc
      .fillColor(BLACK)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("BharatCart Pvt. Ltd.", fromX, infoY + 22);

    doc
      .fillColor(GRAY)
      .fontSize(8.5)
      .font("Helvetica")
      .text("Surat, Gujarat 395006\nIndia\nsupport@bharatcart.com\nGST: 27AABCS1234A1Z5", fromX, infoY + 40, { lineGap: 4 });

    doc
      .fillColor(GRAY)
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("TO", toX, infoY + 12);

    doc
      .fillColor(BLACK)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(order.user?.name || "Customer", toX, infoY + 22);

    doc
      .fillColor(GRAY)
      .fontSize(8.5)
      .font("Helvetica")
      .text([
        order.user?.email || "",
        order.user?.phone ? `Phone: ${order.user.phone}` : "",
        order.address?.line1 || "",
        `${order.address?.city || ""}, ${order.address?.state || ""} - ${order.address?.pincode || ""}`,
      ].filter(Boolean).join("\n"), toX, infoY + 40, { lineGap: 4, width: 220 });

    // ── Order meta info ──────────────────────────────────────
    const metaY = infoY + 110;
    const metaGap = 10;
    const metaW = (CONTENT_W - metaGap * 3) / 4;
    const metaItems = [
      { label: "Order Date", value: new Date(order.createdAt).toLocaleDateString("en-IN") },
      { label: "Payment Method", value: (order.paymentMethod || "—").toUpperCase() },
      { label: "Payment ID", value: order.paymentId?.slice(0, 20) || "—" },
      { label: "Order Status", value: order.status || "—" },
    ];

    doc
      .fillColor(DARK)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("ORDER SUMMARY", 50, metaY - 18);

    metaItems.forEach((item, i) => {
      const x = CONTENT_X + i * (metaW + metaGap);

      doc.roundedRect(x, metaY, metaW, 42, 8).fillAndStroke(i % 2 === 0 ? LIGHT : SOFT, BORDER);
      doc
        .fillColor(GRAY)
        .fontSize(7.3)
        .font("Helvetica")
        .text(item.label, x + 10, metaY + 8, { width: metaW - 20 });
      doc
        .fillColor(BLACK)
        .fontSize(8.5)  
        .font("Helvetica-Bold")
        .text(item.value, x + 10, metaY + 18, { width: metaW - 20, height: 18, ellipsis: true });
    });

    // ── Items table ──────────────────────────────────────────
    const tableX = CONTENT_X;
    const tableW = CONTENT_W;
    const columns = {
      index: tableX,
      item: tableX + 34,
      qty: tableX + tableW - 228,
      price: tableX + tableW - 174,
      total: tableX + tableW - 92,
      itemW: tableW - 34 - 228,
      qtyW: 44,
      priceW: 76,
      totalW: 92,
    };
    const tableHeaderH = 28;
    const drawTableHeader = top => {
      doc.rect(tableX, top, tableW, tableHeaderH).fill(DARK);
      doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
      doc.text("#", columns.index + 9, top + 9);
      doc.text("ITEM", columns.item, top + 9);
      doc.text("QTY", columns.qty, top + 9, { width: columns.qtyW, align: "center" });
      doc.text("PRICE", columns.price, top + 9, { width: columns.priceW, align: "right" });
      doc.text("TOTAL", columns.total, top + 9, { width: columns.totalW, align: "right" });
    };
    const tableTop = metaY + 60;
    drawTableHeader(tableTop);
    let y = tableTop + tableHeaderH;
    order.items?.forEach((item, i) => {
      const itemName = item.name || "Product";
      doc.font("Helvetica-Bold").fontSize(9);
      const itemTextH = doc.heightOfString(itemName, { width: columns.itemW, lineGap: 2 });
      const rowH = Math.max(34, itemTextH + 16);
      if (y + rowH > FOOTER_Y - 8) {
        doc.addPage();
        y = 46;
        drawTableHeader(y);
        y += tableHeaderH;
      }
      const bg   = i % 2 === 0 ? "#ffffff" : LIGHT;

      doc.rect(tableX, y, tableW, rowH).fill(bg);
      doc.rect(tableX, y, tableW, rowH).stroke("#e8e8e8");

      doc
        .fillColor(GRAY)
        .fontSize(8)
        .font("Helvetica")
        .text(`${i + 1}`, columns.index + 9, y + 11, { width: 18 });

      doc
        .fillColor(BLACK)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(itemName, columns.item, y + 8, { width: columns.itemW, lineGap: 2 });

      doc
        .fillColor(BLACK)
        .fontSize(8)
        .font("Helvetica")
        .text(`${item.qty}`, columns.qty, y + 11, { width: columns.qtyW, align: "center" });

      doc
        .fillColor(BLACK)
        .fontSize(8)
        .font("Helvetica")
        .text(formatMoney(item.price), columns.price, y + 11, { width: columns.priceW, align: "right" });

      doc
        .fillColor(DARK)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(formatMoney(item.price * item.qty), columns.total, y + 11, { width: columns.totalW, align: "right" });

      y += rowH;
    });

    // ── Totals section ───────────────────────────────────────
    const totalsW = 250;
    const totalsX = CONTENT_X + CONTENT_W - totalsW;
    const totalsBottomSpace = 190;
    if (y + totalsBottomSpace > FOOTER_Y - 8) {
      doc.addPage();
      y = 48;
    } else {
      y += 16;
    }

    const addTotalRow = (label, value, bold = false, color = BLACK) => {
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text(label, totalsX, y, { width: 125 });
      doc
        .fillColor(color)
        .fontSize(9)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, totalsX + 125, y, { width: totalsW - 125, align: "right" });
      y += 18;
    };

    // Divider
    doc.moveTo(totalsX, y).lineTo(doc.page.width - 50, y).strokeColor("#e0e0e0").stroke();
    y += 10;

    const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
    addTotalRow("Subtotal:",         formatMoney(subtotal));
    if (order.discountAmount > 0) {
      addTotalRow("Coupon Discount:", `-${formatMoney(order.discountAmount)}`, false, SUCCESS);
    }
    addTotalRow("Delivery:",          order.deliveryCharge > 0 ? formatMoney(order.deliveryCharge) : "FREE");

    // Total row with background
    y += 4;
    doc.rect(totalsX - 10, y - 4, totalsW + 20, 28).fill(DARK);
    doc
      .fillColor(GOLD)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TOTAL PAID:", totalsX, y + 4, { width: 110 });
    doc
      .fillColor(GOLD)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(formatMoney(order.total), totalsX + 110, y + 4, { width: totalsW - 110, align: "right" });

    y += 46;

    // ── Payment status badge ─────────────────────────────────
    const badgeX = 50;
    const badgeY = y;
    const badgeW = 176;
    const badgeH = 30;

    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 10).fill(SUCCESS);

    doc
      .fillColor("#ffffff")
      .circle(badgeX + 18, badgeY + badgeH / 2, 9)
      .fill();

    doc
      .strokeColor(SUCCESS)
      .lineWidth(2)
      .moveTo(badgeX + 13, badgeY + badgeH / 2)
      .lineTo(badgeX + 17, badgeY + badgeH / 2 + 4)
      .lineTo(badgeX + 23, badgeY + badgeH / 2 - 5)
      .stroke();

    doc
      .fillColor("#ffffff")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Payment Done", badgeX + 36, badgeY + 9);

    drawFooter();
    doc.end();
  } catch (err) {
    console.error("Invoice error:", err);
    if (res.headersSent) {
      res.destroy(err);
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

module.exports = router;