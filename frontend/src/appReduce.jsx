
  

// src/appReduce.jsx
function appReducer(state, action) {
  switch (action.type) {

    // ── AUTH ─────────────────────────────────────────────────
    case "LOGIN":
      return { ...state, currentUser: action.payload.user, isAdmin: action.payload.isAdmin };
    case "LOGOUT":
      return { ...state, currentUser: null, isAdmin: false, cart: [], orders: [], contacts: [], wishlist: [], addresses: [] };

    // ── LOADING ───────────────────────────────────────────────
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    // ── PRODUCTS ──────────────────────────────────────────────
    case "SET_PRODUCTS": {
      if (!Array.isArray(action.payload)) {
        console.error("Product list response must be an array.");
        return state;
      }
      const products = action.payload.filter(product => product && typeof product === "object");
      if (products.length !== action.payload.length) {
        console.error("Product list contained invalid entries; skipped entries without product data.");
      }
      return { ...state, products };
    }
    case "ADD_PRODUCT":
      if (!action.payload || typeof action.payload !== "object") {
        console.error("Cannot add product: product data is missing.");
        return state;
      }
      return { ...state, products: [...state.products, action.payload] };
    case "UPDATE_PRODUCT":
      if (!action.payload || typeof action.payload !== "object") {
        console.error("Cannot update product: product data is missing.");
        return state;
      }
      return { ...state, products: state.products.map(p => p?._id === action.payload._id ? { ...p, ...action.payload } : p).filter(Boolean) };
    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter(p => p && p._id !== action.payload) };

    // ── CART ──────────────────────────────────────────────────
    case "SET_CART":
      return { ...state, cart: action.payload };
    case "ADD_TO_CART": {
      const existing = state.cart.find(c => c.id === action.payload);
      if (existing) return { ...state, cart: state.cart.map(c => c.id === action.payload ? { ...c, qty: c.qty + 1 } : c) };
      return state;
    }
    case "CHANGE_QTY": {
      const updated = state.cart.map(c => (c.id || c._id)?.toString() === action.payload.id ? { ...c, qty: c.qty + action.payload.delta } : c);
      return { ...state, cart: updated.filter(c => c.qty > 0) };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter(c => (c.id || c._id)?.toString() !== action.payload) };
    case "CLEAR_CART":
      return { ...state, cart: [] };

    // ── ORDERS ────────────────────────────────────────────────
    case "SET_ORDERS":
      return { ...state, orders: action.payload };
    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };
    case "UPDATE_ORDER_STATUS":
      return { ...state, orders: state.orders.map(o => o._id === action.payload.id ? { ...o, status: action.payload.status } : o) };
    case "PLACE_ORDER":
      return { ...state, orders: [...state.orders, action.payload], cart: [] };

    // ── WISHLIST ──────────────────────────────────────────────
    case "SET_WISHLIST":
      return { ...state, wishlist: action.payload };
    case "TOGGLE_WISHLIST": {
      const inList = state.wishlist.includes(action.payload);
      return { ...state, wishlist: inList ? state.wishlist.filter(id => id !== action.payload) : [...state.wishlist, action.payload] };
    }

    // ── CONTACTS ─────────────────────────────────────────────
    case "SET_CONTACTS":
      return { ...state, contacts: action.payload };
    case "ADD_CONTACT":
      return { ...state, contacts: [action.payload, ...(state.contacts || [])] };
    case "UPDATE_CONTACT":
      return { ...state, contacts: (state.contacts || []).map(c => c._id === action.payload._id ? action.payload : c) };
    case "DELETE_CONTACT":
      return { ...state, contacts: (state.contacts || []).filter(c => c._id !== action.payload) };

    // ── COUPONS ───────────────────────────────────────────────
    case "SET_COUPONS":
      return { ...state, coupons: action.payload };
    case "ADD_COUPON":
      return { ...state, coupons: [...state.coupons, action.payload] };
    case "UPDATE_COUPON":
      return { ...state, coupons: state.coupons.map(c => c._id === action.payload._id ? action.payload : c) };
    case "DELETE_COUPON":
      return { ...state, coupons: state.coupons.filter(c => c._id !== action.payload) };
    case "TOGGLE_COUPON":
      return { ...state, coupons: state.coupons.map((c, i) => i === action.payload ? { ...c, active: !c.active } : c) };

// ── Reviews ─────────────────────────────────────────────
    case "ADD_REVIEW": {
      const reviews = state.reviews || [];
      // One review per user per product — replace if exists
      const filtered = reviews.filter(r => !(r.productId === action.payload.productId && r.userId === action.payload.userId));
      return { ...state, reviews: [...filtered, action.payload] };
    }
    case "SET_REVIEWS":
      return { ...state, reviews: action.payload };
          
    case "SET_ADS":
      return { ...state, ads: action.payload };
    case "ADD_AD":
      return { ...state, ads: [action.payload, ...(state.ads || [])] };
    
    case "UPDATE_AD":
      return {
        ...state,
        ads: (state.ads || []).map(a => (a._id || a.id) === (action.payload._id || action.payload.id) ? action.payload : a),
      };
    
    case "DELETE_AD":
      return { ...state, ads: (state.ads || []).filter(a => (a._id || a.id) !== action.payload) };
        // ── USERS (admin) ─────────────────────────────────────────
        case "SET_USERS":
          return { ...state, users: action.payload };

    // ── THEME ─────────────────────────────────────────────────
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };

      case "ADD_ADDRESS":
      return { ...state, addresses: [...(state.addresses || []), action.payload] };

    case "UPDATE_ADDRESS":
      return { ...state, addresses: (state.addresses || []).map(a => a.id === action.payload.id ? action.payload : a) };

    case "DELETE_ADDRESS":
      return { ...state, addresses: (state.addresses || []).filter(a => a.id !== action.payload) };

    case "SET_DEFAULT_ADDRESS":
      return {
        ...state,
        addresses: (state.addresses || []).map(a => ({ ...a, isDefault: a.id === action.payload })),
      };

    default:
      return state;
  }
}

export default appReducer;