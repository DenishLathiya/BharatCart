// export const getT = (theme = "dark") => ({
//   bg:          theme === "light" ? "#fafafa" : "#0a0a0f",
//   surface:     theme === "light" ? "#ffffff" : "#111118",
//   surface2:    theme === "light" ? "#f5f5f5" : "#18181f",
//   border:      theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)",
//   borderHover: theme === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.14)",
//   accent:      "#7c6fff",
//   accentDark:  "#5d52d4",
//   rose:        "#f472b6",
//   text:        theme === "light" ? "#1a1a1a" : "#f0eff8",
//   muted:       theme === "light" ? "#666666" : "#8b8a9e",
//   faint:       theme === "light" ? "#cccccc" : "#3d3d52",
//   success:     "#34d399",
//   warning:     "#fbbf24",
//   danger:      "#f87171",
//   info:        "#60a5fa",
// });

// export const T = getT("dark"); // fallback

// export const styles = (theme = "dark") => {
//   const T = getT(theme);
//   return {
//     app: {
//       fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
//       background: T.bg,
//       color: T.text,
//       minHeight: "100vh",
//       letterSpacing: "0.01em",
//     },
//     card: {
//       background: T.surface,
//       border: `1px solid ${T.border}`,
//       borderRadius: 16,
//     },
//     input: {
//       width: "100%",
//       padding: "10px 14px",
//       background: T.bg,
//       border: `1px solid ${T.border}`,
//       borderRadius: 10,
//       color: T.text,
//       fontSize: 14,
//       outline: "none",
//       fontFamily: "inherit",
//       boxSizing: "border-box",
//     },
//     btn: (variant = "primary") => ({
//       padding: "10px 20px",
//       borderRadius: 10,
//       border: "none",
//       cursor: "pointer",
//       fontSize: 14,
//       fontWeight: 600,
//       fontFamily: "inherit",
//       transition: "all 0.15s ease",
//       ...(variant === "primary" ? { background: T.accent, color: "#fff" }
//         : variant === "ghost"   ? { background: "transparent", color: T.muted, border: `1px solid ${T.border}` }
//         : variant === "danger"  ? { background: "rgba(248,113,113,0.12)", color: T.danger, border: `1px solid rgba(248,113,113,0.25)` }
//         : variant === "success" ? { background: "rgba(52,211,153,0.12)", color: T.success, border: `1px solid rgba(52,211,153,0.25)` }
//         : {}),
//     }),
//   };
// };

// export const fmt = {
//   currency: (n) => `₹${Number(n).toLocaleString("en-IN")}`,
//   initials: (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
//   orderId:  (id) => id.toString().slice(-8).toUpperCase(),
//   stars:    (r) => "★".repeat(Math.floor(r)) + "☆".repeat(5 - Math.floor(r)),
// };

// export function Badge({ children, color = "default", size = "sm" }) {
//   const colors = {
//     default: { bg: T.faint,                        text: T.muted    },
//     accent:  { bg: "rgba(124,111,255,0.15)",       text: T.accent   },
//     success: { bg: "rgba(52,211,153,0.12)",        text: T.success  },
//     warning: { bg: "rgba(251,191,36,0.12)",        text: T.warning  },
//     danger:  { bg: "rgba(248,113,113,0.12)",       text: T.danger   },
//     info:    { bg: "rgba(96,165,250,0.12)",        text: T.info     },
//     rose:    { bg: "rgba(244,114,182,0.12)",       text: T.rose     },
//   };
//   const { bg, text } = colors[color] || colors.default;
//   return (
//     <span style={{
//       display: "inline-block",
//       padding: size === "sm" ? "3px 9px" : "5px 13px",
//       borderRadius: 20,
//       background: bg, color: text,
//       fontSize: size === "sm" ? 11 : 13,
//       fontWeight: 600,
//       letterSpacing: "0.04em",
//       textTransform: "uppercase",
//     }}>{children}</span>
//   );
// }

// export function Avatar({ name, size = 40 }) {
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: "50%",
//       background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
//       display: "flex", alignItems: "center", justifyContent: "center",
//       fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0,
//     }}>{fmt.initials(name)}</div>
//   );
// }

// export function Divider() {
//   return <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "1.5rem 0" }} />;
// }

// export function Modal({ open, onClose, title, children, footer }) {
//   if (!open) return null;
//   return (
//     <div style={{
//       position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
//       zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//     }} onClick={onClose}>
//       <div style={{
//         ...styles.card, padding: "2rem", width: "100%", maxWidth: 500,
//         maxHeight: "90vh", overflowY: "auto",
//       }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
//           <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
//           <button onClick={onClose} style={{ ...styles.btn("ghost"), padding: "4px 10px", fontSize: 18, lineHeight: 1 }}>×</button>
//         </div>
//         {children}
//         {footer && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>{footer}</div>}
//       </div>
//     </div>
//   );
// }

// export function FormField({ label, children }) {
//   return (
//     <div style={{ marginBottom: 14 }}>
//       <label style={{ display: "block", fontSize: 11, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</label>
//       {children}
//     </div>
//   );
// }

// export function Input({ style: s, ...props }) {
//   return <input style={{ ...styles.input, ...s }} {...props} />;
// }

// export function Select({ style: s, children, ...props }) {
//   return <select style={{ ...styles.input, ...s }} {...props}>{children}</select>;
// }

// export function Btn({ variant = "primary", style: s, children, ...props }) {
//   return (
//     <button
//       style={{ ...styles().btn(variant), ...s }}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }

// export function EmptyState({ emoji, title, subtitle, action }) {
//   return (
//     <div style={{ textAlign: "center", padding: "4rem 2rem", color: T.muted }}>
//       <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
//       <p style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 8 }}>{title}</p>
//       <p style={{ fontSize: 13, marginBottom: 20 }}>{subtitle}</p>
//       {action}
//     </div>
//   );
// }

// export function StatCard({ icon, value, label, delta, color = T.accent }) {
//   return (
//     <div style={{ ...styles.card, padding: "1.25rem" }}>
//       <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
//       <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
//       <div style={{ fontSize: 12, color: T.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
//       {delta && <div style={{ fontSize: 11, color: T.success, marginTop: 6 }}>↑ {delta}</div>}
//     </div>
//   );
// }

import React, { useState } from "react";
 
// ─── TOKENS ────────────────────────────────────────────────────────────────────
 
export const getT = (theme = "dark") => ({
  bg:          theme === "light" ? "#fafafa"               : "#09090e",
  surface:     theme === "light" ? "#ffffff"               : "#111118",
  surface2:    theme === "light" ? "#f4f4f6"               : "#17171f",
  surface3:    theme === "light" ? "#eeeef2"               : "#1e1e28",
  border:      theme === "light" ? "rgba(0,0,0,0.07)"      : "rgba(255,255,255,0.07)",
  borderHover: theme === "light" ? "rgba(0,0,0,0.14)"      : "rgba(255,255,255,0.13)",
  borderFocus: "#7c6fff",
  accent:      "#7c6fff",
  accentHover: "#6b5ef0",
  accentDim:   "rgba(124,111,255,0.12)",
  rose:        "#f472b6",
  roseDim:     "rgba(244,114,182,0.12)",
  text:        theme === "light" ? "#111111"               : "#efeffa",
  muted:       theme === "light" ? "#666677"               : "#8b8a9e",
  faint:       theme === "light" ? "#ccccdd"               : "#2e2e3d",
  success:     "#34d399",
  successDim:  "rgba(52,211,153,0.12)",
  successBorder:"rgba(52,211,153,0.28)",
  warning:     "#fbbf24",
  warningDim:  "rgba(251,191,36,0.12)",
  warningBorder:"rgba(251,191,36,0.28)",
  danger:      "#f87171",
  dangerDim:   "rgba(248,113,113,0.11)",
  dangerBorder:"rgba(248,113,113,0.26)",
  info:        "#60a5fa",
  infoDim:     "rgba(96,165,250,0.12)",
  infoBorder:  "rgba(96,165,250,0.28)",
});
 
export const T = getT("dark");
 
// ─── STYLE HELPERS ─────────────────────────────────────────────────────────────
 
export const baseStyles = (theme = "dark") => {
  const t = getT(theme);
  return {
    app: {
      fontFamily: "'Syne', 'DM Sans', 'Helvetica Neue', sans-serif",
      background: t.bg,
      color: t.text,
      minHeight: "100vh",
      letterSpacing: "0.01em",
    },
    card: {
      background: t.surface,
      border: `0.5px solid ${t.border}`,
      borderRadius: 14,
    },
    input: {
      width: "100%",
      padding: "9px 12px",
      background: t.surface2,
      borderWidth: "0.5px",
      borderStyle: "solid",
      borderColor: t.border,
      borderRadius: 9,
      color: t.text,
      fontSize: 13,
      fontFamily: "'Syne', sans-serif",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.15s, box-shadow 0.15s",
    },
    btn: (variant = "primary") => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "9px 18px",
      borderRadius: 9,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "'Syne', sans-serif",
      letterSpacing: "0.01em",
      transition: "all 0.15s ease",
      ...(variant === "primary"
        ? { background: t.accent, color: "#fff" }
        : variant === "ghost"
        ? { background: "transparent", color: t.muted, border: `0.5px solid ${t.borderHover}` }
        : variant === "danger"
        ? { background: t.dangerDim, color: t.danger, border: `0.5px solid ${t.dangerBorder}` }
        : variant === "success"
        ? { background: t.successDim, color: t.success, border: `0.5px solid ${t.successBorder}` }
        : variant === "warning"
        ? { background: t.warningDim, color: t.warning, border: `0.5px solid ${t.warningBorder}` }
        : variant === "info"
        ? { background: t.infoDim, color: t.info, border: `0.5px solid ${t.infoBorder}` }
        : variant === "icon"
        ? { background: t.surface2, border: `0.5px solid ${t.border}`, color: t.muted, padding: "9px" }
        : {}),
    }),
  };
};
 
// ─── FORMAT UTILITIES ──────────────────────────────────────────────────────────
 
export const fmt = {
  currency: (n) => `₹${Number(n).toLocaleString("en-IN")}`,
  initials: (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  orderId: (id) => id.toString().slice(-8).toUpperCase(),
  stars: (r) => "★".repeat(Math.floor(r)) + "☆".repeat(5 - Math.floor(r)),
  date: (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
};
 
// ─── BADGE ─────────────────────────────────────────────────────────────────────
 
export function Badge({ children, color = "default", size = "sm", dot = true }) {
  const t = T;
  const colors = {
    default: { bg: t.faint,       text: t.muted    },
    accent:  { bg: t.accentDim,   text: t.accent   },
    success: { bg: t.successDim,  text: t.success  },
    warning: { bg: t.warningDim,  text: t.warning  },
    danger:  { bg: t.dangerDim,   text: t.danger   },
    info:    { bg: t.infoDim,     text: t.info     },
    rose:    { bg: t.roseDim,     text: t.rose     },
  };
  const { bg, text } = colors[color] ?? colors.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "4px 10px" : "5px 13px",
        borderRadius: 100,
        background: bg,
        color: text,
        fontSize: size === "sm" ? 11 : 13,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: text,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
 
// ─── AVATAR ────────────────────────────────────────────────────────────────────
 
export function Avatar({ name, size = 40, gradient = true }) {
  const initials = fmt.initials(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: gradient
          ? `linear-gradient(135deg, ${T.accent}, ${T.rose})`
          : T.surface2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 700,
        color: gradient ? "#fff" : T.muted,
        flexShrink: 0,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}
 
// ─── AVATAR STACK ──────────────────────────────────────────────────────────────
 
export function AvatarStack({ names = [], max = 3 }) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;
  const gradients = [
    `linear-gradient(135deg, ${T.accent}, #a78bfa)`,
    `linear-gradient(135deg, ${T.rose}, #fb7185)`,
    `linear-gradient(135deg, ${T.success}, #10b981)`,
    `linear-gradient(135deg, ${T.info}, #3b82f6)`,
  ];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {visible.map((name, i) => (
        <div
          key={name}
          title={name}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: gradients[i % gradients.length],
            border: `2px solid ${T.surface}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            marginLeft: i === 0 ? 0 : -10,
            zIndex: visible.length - i,
            position: "relative",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {fmt.initials(name)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: T.surface2,
            border: `2px solid ${T.surface}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
            color: T.muted,
            marginLeft: -10,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
 
// ─── DIVIDER ───────────────────────────────────────────────────────────────────
 
export function Divider({ margin = "1.5rem 0" }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `0.5px solid ${T.border}`,
        margin,
      }}
    />
  );
}
 
// ─── STAT CARD ─────────────────────────────────────────────────────────────────
 
export function StatCard({
  icon,
  value,
  label,
  delta,
  deltaUp = true,
  color = T.accent,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `0.5px solid ${hovered ? T.borderHover : T.border}`,
        borderRadius: 14,
        padding: "1rem 1.1rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}
    >
      {/* top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: color,
          borderRadius: "2px 2px 0 0",
        }}
      />
      <div style={{ fontSize: 18, color, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: T.muted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </div>
      {delta && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: deltaUp ? T.success : T.danger,
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {deltaUp ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  );
}
 
// ─── INPUT ─────────────────────────────────────────────────────────────────────
 
export function Input({ style: s, icon, ...props }) {
  const [focused, setFocused] = useState(false);
  const base = baseStyles().input;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {icon && (
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 15,
            color: T.muted,
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
      )}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...base,
          ...(icon ? { paddingLeft: 34 } : {}),
          ...(focused
            ? {
                borderColor: T.borderFocus,
                boxShadow: `0 0 0 3px ${T.accentDim}`,
              }
            : {}),
          ...s,
        }}
        {...props}
      />
    </div>
  );
}
 
// ─── SELECT ────────────────────────────────────────────────────────────────────
 
export function Select({ style: s, children, ...props }) {
  const [focused, setFocused] = useState(false);
  const base = baseStyles().input;
  return (
    <select
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...base,
        ...(focused
          ? {
              borderColor: T.borderFocus,
              boxShadow: `0 0 0 3px ${T.accentDim}`,
            }
          : {}),
        ...s,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
 
// ─── BUTTON ────────────────────────────────────────────────────────────────────
 
export function   Btn({ variant = "primary", style: s, children, ...props }) {
  const [hovered, setHovered] = useState(false);
  const base = baseStyles().btn(variant);
  const hoverStyles =
    variant === "primary"
      ? { background: T.accentHover, transform: "translateY(-1px)" }
      : variant === "icon"
      ? { borderColor: T.borderHover, color: T.text }
      : { filter: "brightness(1.1)" };
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        ...(hovered ? hoverStyles : {}),
        ...s,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
 
// ─── FORM FIELD ────────────────────────────────────────────────────────────────
 
export function FormField({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          color: T.muted,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>{hint}</p>
      )}
    </div>
  );
}
 
// ─── MODAL ─────────────────────────────────────────────────────────────────────
 
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        color: T.muted,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `0.5px solid ${T.borderHover}`,
          borderRadius: 16,
          padding: "1.5rem",
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
          <Btn
            variant="icon"
            onClick={onClose}
            style={{ width: 28, height: 28, padding: 0, borderRadius: 7, fontSize: 16, justifyContent: "center" }}
          >
            ×
          </Btn>
        </div>
        {children}
        {footer && (
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: `0.5px solid ${T.border}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── ALERT BANNER ──────────────────────────────────────────────────────────────
 
export function Alert({ variant = "info", icon, children }) {
  const map = {
    info:    { bg: T.infoDim,    border: T.infoBorder,    color: T.info    },
    success: { bg: T.successDim, border: T.successBorder, color: T.success },
    warning: { bg: T.warningDim, border: T.warningBorder, color: T.warning },
    danger:  { bg: T.dangerDim,  border: T.dangerBorder,  color: T.danger  },
  };
  const s = map[variant] ?? map.info;
  return (
    <div
      style={{
        background: s.bg,
        border: `0.5px solid ${s.border}`,
        borderRadius: 9,
        padding: "10px 12px",
        fontSize: 12,
        color: s.color,
        display: "flex",
        alignItems: "center",
        gap: 8,
        lineHeight: 1.5,
      }}
    >
      {icon && <span style={{ flexShrink: 0, fontSize: 15 }}>{icon}</span>}
      {children}
    </div>
  );
}
 
// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
 
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 2rem",
        background: T.surface,
        border: `0.5px dashed ${T.borderHover}`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          background: T.surface2,
          border: `0.5px solid ${T.border}`,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: T.muted,
          margin: "0 auto 14px",
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>
        {title}
      </p>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>{subtitle}</p>
      {action}
    </div>
  );
}
 
// ─── ORDER CARD ────────────────────────────────────────────────────────────────
 
export function OrderCard({ orderId, date, status, items = [], total }) {
  const statusColor = {
    Delivered:  "success",
    Processing: "info",
    Pending:    "warning",
    Refunded:   "danger",
    Cancelled:  "danger",
  }[status] ?? "default";
 
  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px",
          borderBottom: `0.5px solid ${T.border}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              color: T.muted,
            }}
          >
            #ORDER · {fmt.orderId(orderId)}
          </div>
          {date && (
            <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>
              {fmt.date(date)}
            </div>
          )}
        </div>
        <Badge color={statusColor}>{status}</Badge>
      </div>
 
      {/* items */}
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 16px",
            borderBottom: `0.5px solid ${T.border}`,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.surface2)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              background: T.surface2,
              border: `0.5px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {item.emoji ?? "📦"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>
              Qty: {item.qty}
              {item.variant ? ` · ${item.variant}` : ""}
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              color: T.text,
              whiteSpace: "nowrap",
            }}
          >
            {fmt.currency(item.price)}
          </div>
        </div>
      ))}
 
      {/* footer total */}
      <div
        style={{
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: T.surface2,
        }}
      >
        <span style={{ fontSize: 12, color: T.muted }}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "'DM Mono', monospace",
            color: T.text,
          }}
        >
          {fmt.currency(total)}
        </span>
      </div>
    </div>
  );
}
 
// ─── AVATAR INFO CARD ──────────────────────────────────────────────────────────
 
export function AvatarCard({ name, subtitle, gradient }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: T.surface,
        border: `0.5px solid ${hovered ? T.borderHover : T.border}`,
        borderRadius: 12,
        padding: "10px 14px",
        cursor: "default",
        transition: "border-color 0.15s",
      }}
    >
      <Avatar name={name} size={38} gradient={gradient !== false} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: T.muted }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
 
// ─── SECTION LABEL ─────────────────────────────────────────────────────────────
 
export function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: T.muted,
        marginBottom: "0.75rem",
        paddingLeft: 2,
      }}
    >
      {children}
    </p>
  );
}
 
// ─── SHOWCASE (default export for preview) ─────────────────────────────────────
 
export default function UIShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
 
  return (
    <div
      style={{
        fontFamily: "'Syne', 'DM Sans', sans-serif",
        background: T.bg,
        color: T.text,
        minHeight: "100vh",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 780,
        margin: "0 auto",
      }}
    >
      {/* ── STAT CARDS ── */}
      <section>
        <SectionLabel>Stat cards</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <StatCard icon="🛍️" value="₹2,48,500" label="Total Revenue"  color={T.accent}   delta="12.4% this week" deltaUp />
          <StatCard icon="📦" value="1,284"      label="Active Orders"  color={T.success}  delta="8 new today"    deltaUp />
          <StatCard icon="💜" value="4.8 / 5"   label="Avg. Rating"    color={T.rose}     />
          <StatCard icon="⚡" value="97.3%"      label="Fulfillment"    color={T.warning}  delta="0.2% vs last month" deltaUp={false} />
        </div>
      </section>
 
      <Divider />
 
      {/* ── BADGES ── */}
      <section>
        <SectionLabel>Badges</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Badge color="accent">Active</Badge>
          <Badge color="success">Delivered</Badge>
          <Badge color="warning">Pending</Badge>
          <Badge color="danger">Refunded</Badge>
          <Badge color="info">Processing</Badge>
          <Badge color="rose">VIP</Badge>
          <Badge color="default" dot={false}>Draft</Badge>
        </div>
      </section>
 
      <Divider />
 
      {/* ── AVATARS ── */}
      <section>
        <SectionLabel>Avatars</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <AvatarStack names={["Priya Kapoor", "Rahul Sharma", "Ananya Singh", "Vikram Nair", "Deepa Menon"]} max={3} />
          <AvatarCard name="Priya Kapoor"  subtitle="Customer · Mumbai" />
          <AvatarCard name="Rahul Sharma"  subtitle="Admin · Delhi" />
        </div>
      </section>
 
      <Divider />
 
      {/* ── BUTTONS ── */}
      <section>
        <SectionLabel>Buttons</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Btn variant="primary">＋ New Order</Btn>
          <Btn variant="ghost">⚙ Filter</Btn>
          <Btn variant="success">✓ Approve</Btn>
          <Btn variant="danger">🗑 Delete</Btn>
          <Btn variant="warning">⚠ Hold</Btn>
          <Btn variant="info">↗ Export</Btn>
          <Btn variant="icon" title="Download">⬇</Btn>
          <Btn variant="icon" title="Settings">⚙</Btn>
        </div>
      </section>
 
      <Divider />
 
      {/* ── FORM FIELDS ── */}
      <section>
        <SectionLabel>Form fields</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Customer name">
            <Input placeholder="Ananya Singh" />
          </FormField>
          <FormField label="Phone number">
            <Input placeholder="+91 98765 43210" icon="📞" />
          </FormField>
          <FormField label="Search orders">
            <Input placeholder="Order ID or product…" icon="🔍" />
          </FormField>
          <FormField label="Status">
            <Select>
              <option>All orders</option>
              <option>Delivered</option>
              <option>Processing</option>
              <option>Refunded</option>
            </Select>
          </FormField>
        </div>
      </section>
 
      <Divider />
 
      {/* ── ORDER CARD ── */}
      <section>
        <SectionLabel>Order card</SectionLabel>
        <OrderCard
          orderId="a3f8c21b"
          date="2026-05-09"
          status="Delivered"
          total={1280}
          items={[
            { emoji: "🍕", name: "Margherita Pizza", qty: 2, variant: "Large",  price: 840 },
            { emoji: "🥤", name: "Masala Chai 500ml", qty: 4, variant: null,    price: 220 },
            { emoji: "🍰", name: "Gulab Jamun (6 pcs)", qty: 1, variant: "Box", price: 180 },
          ]}
        />
      </section>
 
      <Divider />
 
      {/* ── ALERTS ── */}
      <section>
        <SectionLabel>Alerts</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Alert variant="info"    icon="ℹ">Order #A3F8C21B is currently being processed by the warehouse.</Alert>
          <Alert variant="success" icon="✓">Payment of ₹1,280 received successfully from Priya Kapoor.</Alert>
          <Alert variant="warning" icon="⚠">Stock for Margherita Pizza (Large) is running low — only 3 left.</Alert>
          <Alert variant="danger"  icon="!">Refund will be credited within 5–7 business days. This cannot be undone.</Alert>
        </div>
      </section>
 
      <Divider />
 
      {/* ── MODAL TRIGGER ── */}
      <section>
        <SectionLabel>Modal</SectionLabel>
        <Btn variant="primary" onClick={() => setModalOpen(true)}>
          Open Refund Modal
        </Btn>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Refund"
          footer={
            <>
              <Btn variant="ghost"  onClick={() => setModalOpen(false)} style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</Btn>
              <Btn variant="danger" onClick={() => setModalOpen(false)} style={{ fontSize: 13, padding: "8px 16px" }}>Issue Refund</Btn>
            </>
          }
        >
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
            You are about to issue a full refund of{" "}
            <strong style={{ color: T.text }}>₹1,280</strong> to{" "}
            <strong style={{ color: T.text }}>Priya Kapoor</strong> for order{" "}
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.muted }}>
              #A3F8C21B
            </span>
            . This action cannot be undone.
          </p>
          <Alert variant="danger" icon="⚠">
            The refund will be credited within 5–7 business days.
          </Alert>
        </Modal>
      </section>
 
      <Divider />
 
      {/* ── EMPTY STATE ── */}
      <section>
        <SectionLabel>Empty state</SectionLabel>
        <EmptyState
          icon="📭"
          title="No orders found"
          subtitle="Try adjusting your filters or search for a different order ID"
          action={<Btn variant="primary" style={{ fontSize: 12, padding: "8px 16px" }}>＋ Create Order</Btn>}
        />
      </section>
    </div>
  );
}