// backend/src/routes/contacts.js
const express = require("express");
const router  = express.Router();
const Contact = require("../models/Contact");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/contacts — user submits a message
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: "All fields are required." });
    if (message.trim().length < 10)
      return res.status(400).json({ message: "Message must be at least 10 characters." });

    const contact = await Contact.create({
      user: req.user._id,
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    });

    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/contacts/my — user sees their own messages
router.get("/my", protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id })
      .sort({ createdAt: -1 }).lean();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/contacts — admin sees all messages
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 }).lean();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contacts/:id — admin updates status/reply/note
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminReply, adminNote } = req.body;
    const fields = {};
    if (status)                  fields.status     = status;
    if (adminNote !== undefined) fields.adminNote  = adminNote;
    if (adminReply) {
      fields.adminReply = adminReply;
      fields.repliedAt  = new Date();
      fields.status     = status || "Replied";
    }

    const contact = await Contact.findByIdAndUpdate(req.params.id, fields, { new: true })
      .populate("user", "name email");
    if (!contact) return res.status(404).json({ message: "Message not found." });

    const notify = require("../config/notify");

    if (adminReply && contact.user?._id) {
      await notify(contact.user._id, {
        title:   "Support Reply Received",
        message: `${contact.subject}: ${adminReply}`,
        type:    "message",
        icon:    "💬",
        link:    "contact",
      });
    }
    // Send reply email to user
    if (adminReply && contact.email) {
      const { sendContactReply } = require("../config/emails");
      sendContactReply(contact.email, {
        userName:   contact.name,
        subject:    contact.subject,
        adminReply,
      }).catch(console.error);
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contacts/:id — admin deletes message
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;