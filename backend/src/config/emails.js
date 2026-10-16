const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Email error:", err.message);
  else     console.log("✅ Email service ready");
});

// ── Base email template ──────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 900; color: #d4a843; letter-spacing: -0.03em; }
    .logo-icon { font-size: 32px; margin-bottom: 8px; }
    .body { padding: 40px; }
    .footer { background: #f8f8f8; padding: 24px 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d4a843, #f0cc7a); color: #1a1a2e; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 15px; margin: 20px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-success { background: rgba(52,211,153,0.15); color: #059669; }
    .badge-warning { background: rgba(245,158,11,0.15); color: #d97706; }
    .badge-info    { background: rgba(96,165,250,0.15);  color: #2563eb; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .stat-label { color: #666; font-size: 13px; }
    .stat-value { font-weight: 700; font-size: 13px; }
    h1 { font-size: 24px; font-weight: 900; color: #1a1a2e; margin-bottom: 8px; letter-spacing: -0.02em; }
    p  { font-size: 14px; line-height: 1.7; color: #555; margin-bottom: 12px; }
    .highlight { color: #d4a843; font-weight: 800; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-icon">🛍</div>
        <div class="logo">BharatCart</div>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} BharatCart. All rights reserved.</p>
        <p>Create By Bela Infotech</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ── Send email helper ────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from:    `"BharatCart" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    return false;
  }
};

// ── EMAIL TEMPLATES ──────────────────────────────────────────

// 1. Welcome / OTP
const sendOTP = async (email, otp) => {
  return sendEmail({
    to:      email,
    subject: "🔐 Your BharatCart Verification Code",
    html: baseTemplate(`
      <h1>Verify Your Email</h1>
      <p>Welcome to BharatCart! Use the code below to verify your email address.</p>
      <div style="text-align:center; margin: 30px 0;">
        <div style="background: linear-gradient(135deg,#d4a843,#f0cc7a); border-radius: 14px; padding: 24px; display: inline-block; min-width: 200px;">
          <div style="font-size: 42px; font-weight: 900; color: #1a1a2e; letter-spacing: 8px; font-family: monospace;">${otp}</div>
        </div>
      </div>
      <p style="text-align:center; color:#999; font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    `),
  });
};

const sendPasswordReset = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: "Reset your BharatCart password",
    html: baseTemplate(`
      <h1>Reset Your Password</h1>
      <p>We received a request to reset the password for your BharatCart account. Use the button below to choose a new password.</p>
      <div style="text-align:center; margin: 30px 0;">
        <a class="btn" href="${resetUrl}">Reset Password</a>
      </div>
      <p style="text-align:center; color:#999; font-size:12px;">This link expires in 1 hour and can only be used once. If you did not request a password reset, you can ignore this email.</p>
    `),
  });
};

// 2. Order Confirmed
const sendOrderConfirmation = async (email, { userName, orderId, items, total, address, paymentMethod }) => {
  const itemRows = items.map(item => `
    <div class="stat-row">
      <span class="stat-label">${item.emoji || "📦"} ${item.name} ×${item.qty}</span>
      <span class="stat-value">₹${(item.price * item.qty).toLocaleString("en-IN")}</span>
    </div>
  `).join("");

  return sendEmail({
    to:      email,
    subject: `✅ Order Confirmed — #${orderId}`,
    html: baseTemplate(`
      <h1>Order Confirmed! 🎉</h1>
      <p>Hi <strong>${userName}</strong>, your order has been placed successfully.</p>
      <div class="divider"></div>
      <p><strong>Order ID:</strong> <span class="highlight">#${orderId}</span></p>
      ${itemRows}
      <div class="stat-row">
        <span class="stat-label" style="font-weight:800;">Total Paid</span>
        <span class="stat-value highlight" style="font-size:16px;">₹${total.toLocaleString("en-IN")}</span>
      </div>
      <div class="divider"></div>
      <p><strong>📍 Delivering to:</strong><br>${address.name}, ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}</p>
      <p><strong>💳 Payment:</strong> ${paymentMethod?.toUpperCase()}</p>
      <p>You will receive another email when your order ships. Thank you for shopping with BharatCart!</p>
    `),
  });
};

// 3. Order Shipped
const sendOrderShipped = async (email, { userName, orderId, status, message }) => {
  const statusEmoji = {
    "Shipped":          "🚚",
    "Out for Delivery": "🛵",
    "Delivered":        "✅",
    "Cancelled":        "❌",
  };

  const statusColor = {
    "Shipped":          "badge-info",
    "Out for Delivery": "badge-warning",
    "Delivered":        "badge-success",
    "Cancelled":        "badge-warning",
  };

  return sendEmail({
    to:      email,
    subject: `${statusEmoji[status] || "📦"} Order #${orderId} — ${status}`,
    html: baseTemplate(`
      <h1>${statusEmoji[status] || "📦"} Order Update</h1>
      <p>Hi <strong>${userName}</strong>, your order status has been updated.</p>
      <div style="text-align:center; margin: 24px 0;">
        <span class="badge ${statusColor[status] || "badge-info"}" style="font-size:16px; padding: 10px 24px;">
          ${status}
        </span>
      </div>
      <p>${message || `Your order #${orderId} is now ${status}.`}</p>
      <p><strong>Order ID:</strong> <span class="highlight">#${orderId}</span></p>
      ${status === "Delivered" ? `
        <div class="divider"></div>
        <p>We hope you love your purchase! If you're happy with your order, please leave a review. If you have any issues, contact us at support@bharatcart.com</p>
      ` : ""}
    `),
  });
};

// 4. Return Status Update
const sendReturnUpdate = async (email, { userName, productName, status, adminNote, refundAmount }) => {
  return sendEmail({
    to:      email,
    subject: `↩️ Return ${status} — ${productName}`,
    html: baseTemplate(`
      <h1>Return Request ${status}</h1>
      <p>Hi <strong>${userName}</strong>, your return request has been updated.</p>
      <div class="divider"></div>
      <div class="stat-row">
        <span class="stat-label">Product</span>
        <span class="stat-value">${productName}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Status</span>
        <span class="stat-value highlight">${status}</span>
      </div>
      ${refundAmount ? `
      <div class="stat-row">
        <span class="stat-label">Refund Amount</span>
        <span class="stat-value highlight">₹${refundAmount.toLocaleString("en-IN")}</span>
      </div>` : ""}
      ${adminNote ? `
      <div class="divider"></div>
      <p><strong>Message from BharatCart:</strong><br>${adminNote}</p>
      ` : ""}
      ${status === "Refunded" ? `
      <div class="divider"></div>
      <p>Your refund of <span class="highlight">₹${refundAmount?.toLocaleString("en-IN")}</span> has been processed. It will appear in your account within 3–5 business days.</p>
      ` : ""}
    `),
  });
};

// 5. Contact Reply
const sendContactReply = async (email, { userName, subject, adminReply }) => {
  return sendEmail({
    to:      email,
    subject: `💬 Re: ${subject} — BharatCart Support`,
    html: baseTemplate(`
      <h1>Support Reply</h1>
      <p>Hi <strong>${userName}</strong>, our support team has replied to your message.</p>
      <div class="divider"></div>
      <p><strong>Your Query:</strong> ${subject}</p>
      <div style="background:#f8f8f8; border-left: 4px solid #d4a843; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 16px 0;">
        <p style="margin:0; color:#333;">${adminReply}</p>
      </div>
      <p>If you have more questions, feel free to contact us again at <a href="mailto:support@bharatcart.com" style="color:#d4a843;">support@bharatcart.com</a></p>
    `),
  });
};

// 6. Account Status (Suspended/Spam/Reactivated)
const sendAccountStatus = async (email, { userName, status, note }) => {
  const configs = {
    suspended: { emoji: "⏸", title: "Account Suspended",   color: "#d97706" },
    spam:      { emoji: "🚫", title: "Account Flagged",     color: "#dc2626" },
    active:    { emoji: "✅", title: "Account Reactivated", color: "#059669" },
  };
  const cfg = configs[status] || configs.active;

  return sendEmail({
    to:      email,
    subject: `${cfg.emoji} Your BharatCart Account — ${cfg.title}`,
    html: baseTemplate(`
      <h1>${cfg.emoji} ${cfg.title}</h1>
      <p>Hi <strong>${userName}</strong>,</p>
      ${status === "suspended" ? `<p>Your BharatCart account has been temporarily suspended. You will not be able to login until the suspension is lifted.</p>` : ""}
      ${status === "spam"      ? `<p>Your BharatCart account has been flagged. Please contact support to resolve this.</p>` : ""}
      ${status === "active"    ? `<p>Great news! Your BharatCart account has been reactivated. You can now login and continue shopping.</p>` : ""}
      ${note ? `<p><strong>Reason:</strong> ${note}</p>` : ""}
      <div class="divider"></div>
      <p>For any queries, contact us at <a href="mailto:support@bharatcart.com" style="color:#d4a843;">support@bharatcart.com</a></p>
    `),
  });
};

module.exports = {
  sendOTP,
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderShipped,
  sendReturnUpdate,
  sendContactReply,
  sendAccountStatus,
};