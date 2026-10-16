const Notification = require("../models/Notification");

module.exports = async function notify(userId, payload) {
  return Notification.create({
    user:    userId,
    title:   payload.title,
    message: payload.message,
    type:    payload.type || "info",
    icon:    payload.icon || "🔔",
    link:    payload.link || "",
  });
};
