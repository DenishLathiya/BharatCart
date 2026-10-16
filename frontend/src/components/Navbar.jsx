import { useState } from "react";
import { Btn, getT, baseStyles } from "./ui.jsx";
import { useApp } from "../context/AppContext";
import BharatCartLogo from "./BharatCartLogo";
import NotificationBell from "./NotificationBell"; 

export default function Navbar({ isAdmin, user, cartCount, activeSection, onNavigate, onCartOpen, onLogout, onNotificationClick }) {
  const app = useApp();
  const state = app?.state ?? { theme: "light" };
  const dispatch = app?.dispatch;
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (id) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  const handleLogoClick = () => {
    const target = isAdmin ? "dash" : "home";
    if (activeSection === target) {
      window.location.reload();
      return;
    }
    onNavigate(target);
  };

  return (
    <nav className="navbar-root" style={{
      background: T.surface,
      borderBottom: "none",
      minHeight: 62,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 200,
      flexWrap: "wrap",
      gap: 10,
    }}>
      <style>{`
        .navbar-root button.navbar-toggle { display: none; }
        .navbar-links { display: flex; gap: 4px; align-items: center; }
        .navbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        @media (max-width: 900px) {
          .navbar-root { padding: 0.5rem 1rem; }
          .navbar-brand { flex: 1 1 auto; min-width: 0; }
          .navbar-links { display: none; width: 100%; flex-direction: column; gap: 10px; padding: 0.85rem 0; border-top: 1px solid ${T.border}; }
          .navbar-links.open { display: flex; }
          .navbar-links button { width: 100%; justify-content: flex-start; }
          .navbar-actions { width: 100%; justify-content: space-between; }
          .navbar-right { width: 100%; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
          .navbar-toggle { display: inline-flex; align-items: center; justify-content: center; border: none !important; background: transparent !important; color: ${T.text}; border-radius: 10px; padding: 8px 10px; cursor: pointer; box-shadow: none !important; }
          .navbar-toggle span { font-size: 18px; line-height: 1; }
        }
      `}</style>
    <div
      onClick={handleLogoClick}
      style={{
        fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em",
        background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        cursor: "pointer", userSelect: "none",
      }}
    >
      {/* {isAdmin ? "⚙ BharatCart Admin" : "🛍 BharatCart" } */}
      <BharatCartLogo
        isAdmin={isAdmin}
        onClick={handleLogoClick}
      />
    </div>

      {!isAdmin && (
        <>
          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
            style={{
              ...s.btn("ghost"),
              border: "none",
              background: "transparent",
              boxShadow: "none",
              fontSize: 16,
              padding: "6px 10px",
              lineHeight: 1,
            }}
          >
           {/* <span>{menuOpen ? "✕" : "☰"}</span> */}
          </button>

          <div className={`navbar-links${menuOpen ? " open" : ""}`}>
            {[
              { id: "home",     label: "Home"     },
              { id: "shop",     label: "Shop"     },
              { id: "orders",   label: "Orders"   },
              { id: "wishlist", label: "Wishlist" },
              { id: "wallet",   label: "Wallet"   },
              { id: "profile",  label: "Profile"  },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => handleNavigate(id)} style={{
                ...s.btn("ghost"), padding: "8px 14px", fontSize: 13,
                color: activeSection === id ? T.accent : T.muted,
                background: activeSection === id ? "rgba(124,111,255,0.1)" : "transparent",
                border: activeSection === id ? `1px solid rgba(124,111,255,0.2)` : `1px solid transparent`,
                width: "auto",
                textAlign: "left",
              }}>{label}</button>
            ))}
          </div>
        </>
      )}

      <div className="navbar-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {!isAdmin && (
          <button onClick={onCartOpen} style={{ ...s.btn("ghost"), display: "flex", alignItems: "center", gap: 8 }}>
            🛒 Cart
            <span style={{
              background: T.rose, color: "#fff", borderRadius: "50%",
              width: 20, height: 20, fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{cartCount}</span>
          </button>
        )}
        {/* Notification Bell — user only */}
        {!isAdmin && (
          <NotificationBell onNavigate={onNavigate} />
        )}
        <button onClick={() => dispatch?.({ type: "TOGGLE_THEME" })} style={{ ...s.btn("ghost"), fontSize: 13, padding: "6px 14px" }}>
          {state.theme === "light" ? "🌙" : "☀"}
        </button>
        <div style={{
          background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
          padding: "6px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          {isAdmin ? "👑 Admin" : user?.name?.split(" ")[0]}
        </div>
        <button
          onClick={() => { if (window.confirm("Are you sure you want to logout?")) onLogout?.(); }}
          style={{ ...s.btn("ghost"), fontSize: 13, padding: "6px 14px" }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
