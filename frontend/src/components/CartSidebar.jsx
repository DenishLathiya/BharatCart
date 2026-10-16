import { useApp, useCartTotal, useCartActions } from "../context/AppContext.jsx";
import { Btn, EmptyState, fmt, getT, baseStyles } from "./ui.jsx";

export default function CartSidebar({ open, onClose, onCheckout }) {
  const { state } = useApp();
  const { changeQty, removeFromCart } = useCartActions();
  const total = useCartTotal(state.cart);
  const T = getT(state.theme);
  const s = baseStyles(state.theme);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300,
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none", transition: "opacity 0.3s ease",
      }} />
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 380,
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        zIndex: 301, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s ease",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>🛒 Shopping Cart</h3>
          <button onClick={onClose} style={{ ...s.btn("ghost"), padding: "4px 10px", fontSize: 18 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {state.cart.length === 0
            ? <EmptyState emoji="🛒" title="Cart is empty" subtitle="Add some products to get started!" />
            : state.cart.map(item => (
                <div key={item.id || item._id} style={{ display: "flex", gap: 12, padding: 12, background: T.surface2, borderRadius: 12, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 28, minWidth: 40, textAlign: "center" }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, marginTop: 2 }}>{fmt.currency(item.price * item.qty)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <button onClick={() => changeQty((item.id || item._id).toString(), -1)}
                        style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: T.surface, color: T.text, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => changeQty((item.id || item._id).toString(), 1)}
                        style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${T.border}`, background: T.surface, color: T.text, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      <button onClick={() => removeFromCart((item.id || item._id).toString())}
                        style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(248,113,113,0.1)", color: T.danger, cursor: "pointer", fontSize: 12, marginLeft: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
        {state.cart.length > 0 && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 16, fontWeight: 800 }}>
              <span>Total</span><span style={{ color: T.accent }}>{fmt.currency(total)}</span>
            </div>
            <Btn style={{ width: "100%", padding: 13, fontSize: 15, alignItems: "center", justifyContent: "center" }} onClick={onCheckout}>Proceed to Checkout →</Btn>
          </div>
        )}
      </div>
    </>
  );
}
