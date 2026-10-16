// src/context/AppContext.jsx
// ─────────────────────────────────────────────────────────────
//  All state now synced with MongoDB via API.
//  localStorage is ONLY used for the JWT token and theme preference.
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import appReducer from "../appReduce";
import { auth as authApi, products as productsApi, cart as cartApi, orders as ordersApi, wishlist as wishlistApi, ads as adsApi } from "../services/api";

const safeLocalStorage = {
  getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
  removeItem: (key) => { try { localStorage.removeItem(key); } catch {} },
};

// ── CONSTANTS ─────────────────────────────────────────────────
export const ADMIN_CREDENTIALS = { email: "admin@BharatCart.com", password: "admin123" };
export const CATEGORIES = ["Electronics", "Fashion", "Home", "Sports", "Books", "Furniture"];
export const ORDER_STATUSES = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
export const PAYMENT_METHODS = [
  { value: "upi",     label: "UPI / GPay / PhonePe",      icon: "📱" },
  { value: "card",    label: "Credit / Debit Card",        icon: "💳" },
  { value: "cod",     label: "Cash on Delivery",           icon: "💵" },
  { value: "netbank", label: "Net Banking",                icon: "🏦" },
  { value: "wallet",  label: "Wallet (Amazon / Mobikwik)", icon: "👛" },
];

// ── INITIAL STATE ─────────────────────────────────────────────
const initialState = {
  currentUser: null,
  isAdmin:     false,
  products:    [],
  cart:        [],       // [{ id, qty, name, price, emoji, stock, ... }]
  orders:      [],
  wishlist:    [],       // [productId strings]
  coupons:     [],
  users:       [],       // admin only
  theme:       safeLocalStorage.getItem("sv_theme") || "light",
  loading:     true,     // global bootstrap loading
  contacts:    [],       // [{ id, name, email, subject, message, status, createdAt, ... }]
  addresses:  safeLocalStorage.getItem("sv2_addresses") ? JSON.parse(safeLocalStorage.getItem("sv2_addresses")) : [],
  ads:      safeLocalStorage.getItem("sv2_ads") ? JSON.parse(safeLocalStorage.getItem("sv2_ads")) : [],
};

// ── CONTEXTS ──────────────────────────────────────────────────
const AppContext   = createContext(null);
const ToastContext = createContext(null);

export function useApp()   { return useContext(AppContext);   }
export function useToast() { return useContext(ToastContext); }

// ── CART TOTAL HOOK ───────────────────────────────────────────
export function useCartTotal(cart) {
  return useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
}

// ── TOAST PROVIDER ────────────────────────────────────────────
const SURFACE_STYLES = {
  background: "#111118",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "12px 18px",
  fontSize: 13,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 220,
  maxWidth: 360,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  color: "#efeffa",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const typeIcon = { success: "✓", error: "✕", info: "ℹ" };
  const typeBorder = {
    success: "1px solid rgba(52,211,153,0.4)",
    error:   "1px solid rgba(248,113,113,0.4)",
    info:    "1px solid rgba(124,111,255,0.4)",
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...SURFACE_STYLES, border: typeBorder[t.type] || typeBorder.info, animation: "slideIn 0.25s ease" }}>
            <span style={{ fontWeight: 700 }}>{typeIcon[t.type] || "ℹ"}</span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(120%)}to{transform:translateX(0)}}`}</style>
    </ToastContext.Provider>
  );
}

// ── APP PROVIDER ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Save theme to localStorage whenever it changes ──
  useEffect(() => {
    safeLocalStorage.setItem("sv_theme", state.theme);
    
  }, [state.theme]);

  // ── Bootstrap: restore session from JWT ──────────────────
  useEffect(() => {
    adsApi.list()
      .then(publicAds => dispatch({ type: "SET_ADS", payload: publicAds }))
      .catch(err => console.warn("Failed to load public advertisements:", err.message));

    const token = safeLocalStorage.getItem("sv_token");
    if (!token) {
      // No user session — still load public product list so guests see products
      (async () => {
        try {
          const prods = await productsApi.list();
          dispatch({ type: "SET_PRODUCTS", payload: prods });
        } catch (err) {
          console.warn("Failed to load public products:", err.message);
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      })();
      return;
    }

    (async () => {
      try {
        // Step 1: Verify token — if this fails, logout
        const { user, isAdmin } = await authApi.me();
        dispatch({ type: "LOGIN", payload: { user, isAdmin } });

        // Step 2: Load user data — failures here DON'T trigger logout
        try {
          const [prods, cartData, myOrders, myWishlist] = await Promise.all([
            productsApi.list(),
            cartApi.get(),
            ordersApi.my(),
            wishlistApi.get(),
          ]);

          dispatch({ type: "SET_PRODUCTS",  payload: prods });
          dispatch({ type: "SET_CART",      payload: cartData.items || [] });
          dispatch({ type: "SET_ORDERS",    payload: myOrders });
          dispatch({ type: "SET_WISHLIST",  payload: myWishlist.map(id => id.toString()) });
        } catch (dataErr) {
          console.warn("Failed to load user data:", dataErr.message);
          // Don't logout — token is still valid, data just failed to load
        }
      } catch (authErr) {
        // Clear token — covers suspended, spam, expired token, deleted user
        console.warn("Auth check failed:", authErr.message);
        localStorage.removeItem("sv_token");
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    })();
  }, []);

  // Poll every 30 seconds to check if account is still active
  useEffect(() => {
    if (!state.currentUser || state.isAdmin) return;

    const interval = setInterval(async () => {
      try {
        await authApi.me();
      } catch {
        localStorage.removeItem("sv_token");
        dispatch({ type: "LOGOUT" });
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [state.currentUser, state.isAdmin]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ── API ACTION HOOKS ──────────────────────────────────────────
//  These hooks wrap API calls + dispatch in one function.
//  Components use these instead of calling dispatch directly.

export function useAuthActions() {
  const { dispatch } = useApp();
  const toast = useToast();

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      safeLocalStorage.setItem("sv_token", data.token);
      
      // Dispatch login FIRST so user is logged in
      dispatch({ type: "LOGIN", payload: { user: data.user, isAdmin: data.isAdmin } });

      // Then load all data
      try {
        const [prods, cartData, myOrders, myWishlist] = await Promise.all([
          productsApi.list(),
          cartApi.get(),
          data.isAdmin ? ordersApi.all() : ordersApi.my(),
          wishlistApi.get(),
        ]);
        
        // Update state with all data
        dispatch({ type: "SET_PRODUCTS",  payload: prods });
        dispatch({ type: "SET_CART",      payload: cartData.items || [] });
        dispatch({ type: "SET_ORDERS",    payload: myOrders });
        dispatch({ type: "SET_WISHLIST",  payload: myWishlist.map(id => id.toString()) });
      } catch (err) {
        console.error("Failed to load user data:", err);
        toast("Some data failed to load. Try refreshing.", "info");
      }
    } catch (err) {
      throw err;
    }
  };

  const register = async (form) => {
    await authApi.register(form);
    toast("Account created! Please sign in.", "success");
  };

  const logout = () => {
    safeLocalStorage.removeItem("sv_token");
    dispatch({ type: "LOGOUT" });
  };

  return { login, register, logout };
}

export function useCartActions() {
  const { dispatch } = useApp();
  const toast = useToast();

  const addToCart = async (productId) => {
    try {
      const data = await cartApi.add(productId);
      dispatch({ type: "SET_CART", payload: data.items || [] });
      toast("Added to cart!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const changeQty = async (productId, delta) => {
    try {
      const data = await cartApi.qty(productId, delta);
      dispatch({ type: "SET_CART", payload: data.items || [] });
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await cartApi.remove(productId);
      dispatch({ type: "SET_CART", payload: data.items || [] });
      toast("Item removed from cart", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return { addToCart, changeQty, removeFromCart };
}

export function useWishlistActions() {
  const { dispatch } = useApp();
  const toast = useToast();

  const toggleWishlist = async (productId) => {
    try {
      const ids = await wishlistApi.toggle(productId);
      dispatch({ type: "SET_WISHLIST", payload: ids.map(id => id.toString()) });
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return { toggleWishlist };
}

export function useOrderActions() {
  const { dispatch } = useApp();
  const toast = useToast();

  const placeOrder = async (orderData) => {
    try {
      const order = await ordersApi.place(orderData);
      dispatch({ type: "SET_CART",   payload: [] });
      dispatch({ type: "ADD_ORDER",  payload: order });
      window.dispatchEvent(new Event("notifications:update"));
      toast("Order placed successfully! 🎉", "success");
      return order;
    } catch (err) {
      toast(err.message, "error");
      throw err;
    }
  };

const refreshOrders = async (isAdmin = false) => {
  try {
    const data = isAdmin ? await ordersApi.all() : await ordersApi.my();
    dispatch({ type: "SET_ORDERS", payload: data });
  } catch (err) {
    console.error("Failed to refresh orders:", err.message);
  }
};

  return { placeOrder, refreshOrders };
}
