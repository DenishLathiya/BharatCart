import { useState, useEffect, useRef } from "react";
import { getT, baseStyles } from "./ui.jsx";
import { useApp, useToast } from "../context/AppContext";
import { notifications } from "../services/api";

export default function NotificationBell({ onNavigate }) {
  const { state } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);

  const [open, setOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notifications.list();
      setNotifList(data.notifications || []);
      setUnreadCount(data.unreadCount  || 0);
    } catch (err) {
      // Silent fail — backend might be starting up
      setNotifList([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!state.currentUser || state.isAdmin) return;

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    const handleRefresh = () => loadNotifications();

    window.addEventListener("notifications:update", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications:update", handleRefresh);
    };
  }, [state.currentUser, state.isAdmin]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open) loadNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await notifications.markRead(id);
      setNotifList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifications.markAllRead();
      setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast("All notifications marked as read", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notifications.remove(id);
      const removed = notifList.find(n => n._id === id);
      setNotifList(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    try {
      await notifications.clearAll();
      setNotifList([]);
      setUnreadCount(0);
      toast("All notifications cleared", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    if (notif.link) {
      onNavigate(notif.link);
      setOpen(false);
    }
  };

  const typeColors = {
    order:   T.accent,
    return:  T.warning,
    payment: T.success,
    account: T.danger,
    message: "#608cdc",
    info:    T.muted,
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{
          position: "relative",
          background: open ? T.accentBg : "transparent",
          border: `1px solid ${open ? T.accentBorder : T.border}`,
          borderRadius: 10,
          width: 40,
          height: 40,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "all 0.2s",
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: T.danger,
            color: "#fff",
            borderRadius: "50%",
            minWidth: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,
          width: 360,
          maxHeight: 480,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          zIndex: 500,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.surface2,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: T.danger,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "1px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                }}>{unreadCount} new</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: T.accent,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}>
                  Mark all read
                </button>
              )}
              {notifList.length > 0 && (
                <button onClick={handleClearAll} style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: T.danger,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: T.muted, fontSize: 13 }}>
                Loading...
              </div>
            ) : notifList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>🔔</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                  All caught up!
                </p>
                <p style={{ fontSize: 12, color: T.muted }}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifList.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${T.border}`,
                    background: notif.isRead ? "transparent" : T.accentBg,
                    cursor: notif.link ? "pointer" : "default",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    transition: "background 0.15s",
                    position: "relative",
                  }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `${typeColors[notif.type]}20`,
                    border: `1px solid ${typeColors[notif.type]}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {notif.icon || "🔔"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: notif.isRead ? 500 : 700,
                      color: T.text,
                      margin: "0 0 3px",
                    }}>
                      {notif.title}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: T.muted,
                      margin: "0 0 4px",
                      lineHeight: 1.5,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {notif.message}
                    </p>
                    <p style={{ fontSize: 10, color: T.muted }}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: T.accent,
                      flexShrink: 0,
                      marginTop: 4,
                    }} />
                  )}
                  <button
                    onClick={e => handleDelete(notif._id, e)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.muted,
                      fontSize: 14,
                      lineHeight: 1,
                      opacity: 0,
                      transition: "opacity 0.15s",
                    }}
                    className="delete-btn"
                  >×</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`div:hover .delete-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}
