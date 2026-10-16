// Step 1: Create a new file — src/components/BharatCartLogo.jsx

export default function BharatCartLogo({ isAdmin, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", gap: 10 }}>
      
      {/* SVG Icon Mark */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Saffron top stripe */}
        <rect x="0" y="0" width="36" height="4" rx="2" fill="#FF9933"/>
        {/* Green bottom stripe */}
        <rect x="0" y="32" width="36" height="4" rx="2" fill="#138808"/>
        {/* White middle bg */}
        <rect x="0" y="4" width="36" height="28" fill="#ffffff" opacity="0.05"/>
        {/* Cart handle */}
        <path d="M6 10 L10 10 L15 22 L28 22" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Cart basket */}
        <rect x="14" y="14" width="15" height="10" rx="3" fill="#FF9933" opacity="0.25" stroke="#FF9933" strokeWidth="1.5"/>
        {/* Cart wheels */}
        <circle cx="17" cy="26" r="2.5" fill="#138808"/>
        <circle cx="26" cy="26" r="2.5" fill="#138808"/>
        {/* Mini Chakra on cart */}
        <circle cx="21.5" cy="19" r="3" fill="none" stroke="#000080" strokeWidth="0.8" opacity="0.6"/>
        <line x1="21.5" y1="16" x2="21.5" y2="22" stroke="#000080" strokeWidth="0.6" opacity="0.6"/>
        <line x1="18.5" y1="19" x2="24.5" y2="19" stroke="#000080" strokeWidth="0.6" opacity="0.6"/>
      </svg>

      {/* Text Mark */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #FF9933, #138808)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          BharatCart
        </span>
        {isAdmin && (
          <span style={{ fontSize: 10, color: "#888", fontWeight: 600, letterSpacing: "0.08em", marginTop: 1 }}>
            ADMIN PANEL
          </span>
        )}
      </div>
    </div>
  );
}