import { useState, useEffect, useRef, useMemo, useCallback, useReducer, lazy, Suspense } from "react";
import { CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS } from "./context/AppContext";
import {
  AppProvider, ToastProvider, useApp, useToast, useCartTotal,
  useAuthActions, useCartActions, useWishlistActions, useOrderActions
} from "./context/AppContext";
import { auth as authApi, auth, invoice, cart, analytics,label,products, products as productsApi, orders as ordersApi, coupons as couponsApi, admin, orders, admin as adminApi, returns as returns_api, payments as paymentsApi, contacts, notifications, reviews, wishlist, addresses, sales, wallet as walletApi, ads as adsApi, bankApi} from "./services/api";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import ProductCard, { ProductDetailModal } from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import BharatCartLogo from "./components/BharatCartLogo";
import { T, baseStyles, Badge, Avatar, Modal, FormField, Input, Select, Btn, Divider, EmptyState, StatCard, fmt, getT } from "./components/ui";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const socials = [
  { icon: <FaFacebookF />, link: "https://facebook.com" },
  { icon: <FaInstagram />, link: "https://instagram.com" },
  { icon: <FaTwitter />, link: "https://twitter.com" },
  { icon: <FaYoutube />, link: "https://youtube.com" },
];

const ADMIN_PAGE_IDS = [
  "dash", "products", "orders", "returns", "payments", "users", "analytics",
  "coupons", "contacts", "reviews", "sales", "wallet", "ads", "bankVerify",
];
const USER_PAGE_IDS = [
  "home", "shop", "orders", "wishlist", "wallet", "profile", "checkout",
  "helpcenter", "contact", "faq", "privacy", "terms", "reviews", "ads",
];
const GUEST_PAGE_IDS = ["home", "shop", "helpcenter", "faq", "privacy", "terms", "contact"];

function readPageFromUrl(fallback, pageIds) {
  const page = new URLSearchParams(window.location.search).get("section");
  return pageIds.includes(page) ? page : fallback;
}

function writePageToUrl(page, replace = false) {
  const url = new URL(window.location.href);
  if (url.searchParams.get("section") === page) return;
  url.searchParams.set("section", page);
  window.history[replace ? "replaceState" : "pushState"]({}, "", url.toString());
}

// function AuthPage() {
//   const { dispatch, state } = useApp();
//   const toast = useToast();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);

//   const [tab, setTab] = useState("login");
//   const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // OTP step states
//   const [otpStep, setOtpStep] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [enteredOtp, setEnteredOtp] = useState("");
//   const [otpError, setOtpError] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(0);

//   const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };

//   // ── Countdown timer ──────────────────────────────────────
//   const startCountdown = () => {
//     setResendCountdown(60);
//     const t = setInterval(() => {
//       setResendCountdown(prev => {
//         if (prev <= 1) { clearInterval(t); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // ── Login ────────────────────────────────────────────────
//   const handleLogin = async () => {
//     if (!form.email || !form.password) { setError("Please fill all fields."); return; }
//     setLoading(true);
//     try {
//       const data = await auth.login(form.email, form.password);
//       localStorage.setItem("sv_token", data.token);
//       dispatch({ type: "LOGIN", payload: { user: data.user, isAdmin: data.isAdmin } });

//       // Load data after login
//       try {
//         const [prods, cartData, myOrders, myWishlist] = await Promise.all([
//           products.list(),
//           cart.get(),
//           data.isAdmin ? orders.all() : orders.my(),
//           wishlist.get(),
//         ]);
//         dispatch({ type: "SET_PRODUCTS", payload: prods });
//         dispatch({ type: "SET_CART", payload: cartData.items || [] });
//         dispatch({ type: "SET_ORDERS", payload: myOrders });
//         dispatch({ type: "SET_WISHLIST", payload: myWishlist.map(id => id.toString()) });
//       } catch (err) {
//         console.error("Data load error:", err);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Register Step 1 — Send OTP ───────────────────────────
//   const handleRegister = async () => {
//     if (!form.name || !form.email || !form.password) {
//       setError("Name, email and password are required."); return;
//     }
//     if (form.password.length < 6) {
//       setError("Password must be at least 6 characters."); return;
//     }
//     if (!form.phone || form.phone.length !== 10) {
//       setError("Phone number must be exactly 10 digits."); return;
//     }

//     setLoading(true);
//     try {
//       const res = await auth.register(form);
//       setUserId(res.userId);
//       setOtpStep(true);
//       setEnteredOtp("");
//       setOtpError("");
//       startCountdown();
//       toast("OTP sent to your email!", "success");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Register Step 2 — Verify OTP ────────────────────────
//   const handleVerifyOtp = async () => {
//     if (!enteredOtp || enteredOtp.length !== 6) {
//       setOtpError("Please enter the 6-digit OTP."); return;
//     }
//     setOtpLoading(true);
//     try {
//       await auth.verifyOtp(userId, enteredOtp);

//       // Email verified successfully
//       toast("✅ Email verified! Please log in with your credentials.", "success");

//       // Reset OTP screen and go back to login form
//       setOtpStep(false);
//       setEnteredOtp("");
//       setOtpError("");
//       setTab("login");
//       setForm({ name: "", email: form.email, password: "", phone: "" });
//       setError("");
//     } catch (err) {
//       setOtpError(err.message);
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   // ── Resend OTP ───────────────────────────────────────────
//   const handleResendOtp = async () => {
//     setOtpLoading(true);
//     try {
//       await auth.resendOtp(userId);
//       setEnteredOtp("");
//       setOtpError("");
//       startCountdown();
//       toast("New OTP sent to your email!", "success");
//     } catch (err) {
//       setOtpError(err.message);
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16, background: T.bg }}>
//       <div style={{ ...s.card, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>

//         {/* Logo */}
//         <div style={{ textAlign: "center", marginBottom: "2rem" }}>
//           <div style={{ fontSize: 42, marginBottom: 12 }}>🛍</div>
//           <h1 style={{
//             fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: 0,
//             background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
//             WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
//           }}>BharatCart</h1>
//           <p style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Your premium shopping destination</p>
//         </div>

//         {/* ── OTP Screen ── */}
//         {otpStep && (
//           <div>
//             <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
//               <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>
//                 Verify Your Email
//               </h2>
//               <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
//                 We sent a 6-digit code to<br />
//                 <strong style={{ color: T.text }}>{form.email}</strong>
//               </p>
//             </div>

//             <FormField label="Enter 6-Digit OTP *">
//               <input
//                 type="text"
//                 value={enteredOtp}
//                 onChange={e => {
//                   const v = e.target.value.replace(/\D/g, "").slice(0, 6);
//                   setEnteredOtp(v);
//                   setOtpError("");
//                 }}
//                 placeholder="000000"
//                 maxLength={6}
//                 onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
//                 style={{
//                   width: "100%", padding: "16px 14px",
//                   textAlign: "center", fontSize: 30, fontWeight: 900,
//                   letterSpacing: 12, borderRadius: 12,
//                   border: `2px solid ${otpError ? T.danger : enteredOtp.length === 6 ? T.success : T.border}`,
//                   background: T.surface2, color: T.text,
//                   fontFamily: "monospace", outline: "none",
//                   boxSizing: "border-box", transition: "border-color 0.2s",
//                 }}
//               />
//               {otpError && (
//                 <p style={{ color: T.danger, fontSize: 12, marginTop: 6 }}>⚠ {otpError}</p>
//               )}
//               {enteredOtp.length === 6 && !otpError && (
//                 <p style={{ color: T.success, fontSize: 12, marginTop: 6 }}>✓ OTP entered</p>
//               )}
//             </FormField>

//             {/* Verify button */}
//             <button
//               onClick={handleVerifyOtp}
//               disabled={otpLoading || enteredOtp.length !== 6}
//               style={{
//                 width: "100%", padding: "13px 0", borderRadius: 12,
//                 border: "none", cursor: enteredOtp.length !== 6 ? "not-allowed" : "pointer",
//                 fontSize: 15, fontWeight: 800, fontFamily: "inherit",
//                 background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
//                 color: "#fff", marginBottom: 14,
//                 opacity: (otpLoading || enteredOtp.length !== 6) ? 0.6 : 1,
//                 transition: "all 0.2s",
//               }}
//             >
//               {otpLoading ? "Verifying..." : "Verify Email ✓"}
//             </button>

//             {/* Resend */}
//             <p style={{ textAlign: "center", fontSize: 13, color: T.muted, marginBottom: 12 }}>
//               {resendCountdown > 0
//                 ? `Resend code in ${resendCountdown}s`
//                 : (
//                   <button
//                     onClick={handleResendOtp}
//                     disabled={otpLoading}
//                     style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}
//                   >
//                     📧 Resend OTP
//                   </button>
//                 )
//               }
//             </p>

//             {/* Back */}
//             <button
//               onClick={() => { setOtpStep(false); setEnteredOtp(""); setOtpError(""); }}
//               style={{
//                 width: "100%", padding: "10px 0", borderRadius: 10,
//                 border: `1px solid ${T.border}`, background: "transparent",
//                 color: T.muted, cursor: "pointer", fontSize: 13,
//                 fontFamily: "inherit", fontWeight: 600,
//               }}
//             >
//               ← Back to Registration
//             </button>
//           </div>
//         )}

//         {/* ── Login / Register tabs ── */}
//         {!otpStep && (
//           <>
//             <div style={{ display: "flex", gap: 4, background: T.surface2, borderRadius: 12, padding: 4, marginBottom: "1.5rem" }}>
//               {[["login", "Sign In"], ["register", "Register"]].map(([id, label]) => (
//                 <button key={id} onClick={() => { setTab(id); setError(""); }} style={{
//                   flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
//                   cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
//                   background: tab === id ? T.accent : "transparent",
//                   color: tab === id ? "#fff" : T.muted,
//                   transition: "all 0.2s",
//                 }}>{label}</button>
//               ))}
//             </div>

//             {/* Login form */}
//             {tab === "login" && (
//               <div>
//                 <FormField label="Email">
//                   <Input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email address" onKeyDown={e => e.key === "Enter" && handleLogin()} />
//                 </FormField>
//                 <FormField label="Password">
//                   <Input type="password" value={form.password} onChange={set("password")} placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && handleLogin()} />
//                 </FormField>
//                 {error && <p style={{ color: T.danger, fontSize: 12, margin: "0 0 12px" }}>{error}</p>}
//                 <button
//                   onClick={handleLogin}
//                   disabled={loading}
//                   style={{
//                     width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
//                     cursor: loading ? "not-allowed" : "pointer",
//                     fontSize: 15, fontWeight: 800, fontFamily: "inherit",
//                     background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
//                     color: "#fff", opacity: loading ? 0.7 : 1, transition: "all 0.2s",
//                   }}
//                 >
//                   {loading ? "Signing in..." : "Sign In →"}
//                 </button>
//               </div>
//             )}

//             {/* Register form */}
//             {tab === "register" && (
//               <div>
//                 <FormField label="Full Name *">
//                   <Input type="text" value={form.name} onChange={set("name")} placeholder="Enter your full name" />
//                 </FormField>
//                 <FormField label="Email Address *">
//                   <Input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email address" />
//                 </FormField>
//                 <FormField label="Phone Number *">
//                   <Input
//                     type="tel"
//                     value={form.phone}
//                     onChange={e => {
//                       const v = e.target.value.replace(/\D/g, "");
//                       if (v.length <= 10) setForm(p => ({ ...p, phone: v }));
//                     }}
//                     placeholder="Enter your 10 digit mobile number"
//                     maxLength={10}
//                     style={{ borderColor: form.phone && form.phone.length !== 10 ? T.danger : "" }}
//                   />
//                   {form.phone.length > 0 && form.phone.length < 10 && (
//                     <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>⚠ {form.phone.length}/10 digits</p>
//                   )}
//                   {form.phone.length === 10 && (
//                     <p style={{ color: T.success, fontSize: 11, marginTop: 4 }}>✓ Valid phone number</p>
//                   )}
//                 </FormField>
//                 <FormField label="Password *">
//                   <Input type="password" value={form.password} onChange={set("password")} placeholder="Enter a strong password" />
//                 </FormField>
//                 {error && <p style={{ color: T.danger, fontSize: 12, margin: "0 0 12px" }}>{error}</p>}
//                 <button
//                   onClick={handleRegister}
//                   disabled={loading}
//                   style={{
//                     width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
//                     cursor: loading ? "not-allowed" : "pointer",
//                     fontSize: 15, fontWeight: 800, fontFamily: "inherit",
//                     background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
//                     color: "#fff", opacity: loading ? 0.7 : 1
//                   }}
//                 >
//                   {loading ? "Sending OTP..." : "Create Account →"}
//                 </button>
//                 <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
//                   📧 OTP will be sent to your email to verify your account
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

function AuthPageInline({ initialTab = "login", onSuccess }) {
  const { dispatch, state } = useApp();
  const toast  = useToast();
  const TT     = getT(state.theme);
  const s      = baseStyles(state.theme);
 
  const [tab,  setTab]  = useState(initialTab);
  const [form, setForm] = useState({ email:"", password:"", name:"", phone:"" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [otpStep,  setOtpStep]  = useState(false);
  const [userId,   setUserId]   = useState(null);
  const [enteredOtp,    setEnteredOtp]    = useState("");
  const [otpError,      setOtpError]      = useState("");
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get("resetToken") || "");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
 
  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setError(""); };
 
  const startCountdown = () => {
    setResendCountdown(60);
    const t = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
 
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    try {
      const data = await auth.login(form.email, form.password);
      localStorage.setItem("sv_token", data.token);
      dispatch({ type:"LOGIN", payload:{ user:data.user, isAdmin:data.isAdmin } });
      try {
        const [prods, cartData, myOrders, myWishlist] = await Promise.all([
          products.list(), cart.get(),
          data.isAdmin ? orders.all() : orders.my(),
          wishlist.get(),
        ]);
        dispatch({ type:"SET_PRODUCTS", payload:prods });
        dispatch({ type:"SET_CART",     payload:cartData.items || [] });
        dispatch({ type:"SET_ORDERS",   payload:myOrders });
        dispatch({ type:"SET_WISHLIST", payload:myWishlist.map(id=>id.toString()) });
      } catch(err) { console.error("Data load error:", err); }
      if (onSuccess) onSuccess();
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };
 
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError("Name, email and password are required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!form.phone || form.phone.length !== 10) { setError("Phone number must be exactly 10 digits."); return; }
    setLoading(true);
    try {
      const res = await auth.register(form);
      setUserId(res.userId);
      setOtpStep(true);
      setEnteredOtp(""); setOtpError(""); startCountdown();
      toast("OTP sent to your email!", "success");
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };
 
  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.length !== 6) { setOtpError("Please enter the 6-digit OTP."); return; }
    setOtpLoading(true);
    try {
      await auth.verifyOtp(userId, enteredOtp);
      toast("✅ Email verified! Please log in.", "success");
      setOtpStep(false); setEnteredOtp(""); setOtpError("");
      setTab("login"); setForm({ name:"", email:form.email, password:"", phone:"" }); setError("");
    } catch(err) { setOtpError(err.message); }
    finally { setOtpLoading(false); }
  };
 
  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      await auth.resendOtp(userId);
      setEnteredOtp(""); setOtpError(""); startCountdown();
      toast("New OTP sent!", "success");
    } catch(err) { setOtpError(err.message); }
    finally { setOtpLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!form.email.trim()) { setError("Enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await auth.requestPasswordReset(form.email.trim());
      setResetRequested(true);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (resetPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (resetPassword !== confirmResetPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await auth.resetPassword(resetToken, resetPassword);
      const url = new URL(window.location.href);
      url.searchParams.delete("resetToken");
      window.history.replaceState({}, document.title, url.toString());
      setResetToken("");
      setResetPassword("");
      setConfirmResetPassword("");
      setForm(previous => ({ ...previous, password: "" }));
      setTab("login");
      toast("Password reset successfully. Please sign in.", "success");
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };
 
  return (
    <div style={{ ...s.card, padding:"2.5rem", boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
        <div style={{ fontSize:36, marginBottom:10 }}>🛍</div>
        <h1 style={{
          fontSize:24, fontWeight:900, letterSpacing:"-0.04em", margin:0,
          background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>BharatCart</h1>
        <p style={{ color:TT.muted, fontSize:12, marginTop:4 }}>Your premium shopping destination</p>
      </div>
 
      {/* OTP screen */}
      {otpStep && (
        <div>
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>✉️</div>
            <h2 style={{ fontSize:16, fontWeight:800, color:TT.text, marginBottom:6 }}>Verify Your Email</h2>
            <p style={{ fontSize:12, color:TT.muted }}>We sent a 6-digit code to <strong style={{ color:TT.text }}>{form.email}</strong></p>
          </div>
          <FormField label="Enter 6-Digit OTP *">
            <input type="text" value={enteredOtp}
              onChange={e => { const v=e.target.value.replace(/\D/g,"").slice(0,6); setEnteredOtp(v); setOtpError(""); }}
              placeholder="000000" maxLength={6}
              onKeyDown={e => e.key==="Enter" && handleVerifyOtp()}
              style={{
                width:"100%", padding:"14px", textAlign:"center", fontSize:26, fontWeight:900,
                letterSpacing:10, borderRadius:12,
                border:`2px solid ${otpError?TT.danger:enteredOtp.length===6?TT.success:TT.border}`,
                background:TT.surface2, color:TT.text, fontFamily:"monospace", outline:"none",
                boxSizing:"border-box",
              }}
            />
            {otpError && <p style={{ color:TT.danger, fontSize:11, marginTop:5 }}>⚠ {otpError}</p>}
          </FormField>
          <button onClick={handleVerifyOtp} disabled={otpLoading||enteredOtp.length!==6} style={{
            width:"100%", padding:"12px 0", borderRadius:12, border:"none",
            cursor:enteredOtp.length!==6?"not-allowed":"pointer", fontSize:14, fontWeight:800,
            fontFamily:"inherit", background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
            color:"#fff", marginBottom:12, opacity:(otpLoading||enteredOtp.length!==6)?0.6:1,
          }}>{otpLoading?"Verifying...":"Verify Email ✓"}</button>
          <p style={{ textAlign:"center", fontSize:12, color:TT.muted, marginBottom:10 }}>
            {resendCountdown>0 ? `Resend in ${resendCountdown}s` : (
              <button onClick={handleResendOtp} disabled={otpLoading} style={{ background:"none", border:"none", color:TT.accent, cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"inherit" }}>
                📧 Resend OTP
              </button>
            )}
          </p>
          <button onClick={()=>{setOtpStep(false);setEnteredOtp("");setOtpError("");}} style={{
            width:"100%", padding:"9px 0", borderRadius:10, border:`1px solid ${TT.border}`,
            background:"transparent", color:TT.muted, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600,
          }}>← Back to Registration</button>
        </div>
      )}

      {resetToken && !otpStep && (
        <div>
          <h2 style={{ fontSize:16, fontWeight:800, color:TT.text, marginBottom:6 }}>Choose a new password</h2>
          <p style={{ fontSize:12, color:TT.muted, marginBottom:16 }}>Your email has been verified. Enter a new password for your account.</p>
          <FormField label="New Password">
            <Input type="password" value={resetPassword} onChange={e=>{setResetPassword(e.target.value);setError("");}} placeholder="At least 6 characters" />
          </FormField>
          <FormField label="Confirm New Password">
            <Input type="password" value={confirmResetPassword} onChange={e=>{setConfirmResetPassword(e.target.value);setError("");}} placeholder="Enter your new password again" onKeyDown={e=>e.key==="Enter"&&handleResetPassword()} />
          </FormField>
          {error && <p role="alert" style={{ color:TT.danger, fontSize:12, margin:"0 0 12px" }}>{error}</p>}
          <button onClick={handleResetPassword} disabled={loading} style={{
            width:"100%", padding:"12px 0", borderRadius:12, border:"none",
            cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:800,
            fontFamily:"inherit", background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
            color:"#fff", opacity:loading?0.7:1,
          }}>{loading?"Updating password...":"Update Password"}</button>
        </div>
      )}

      {forgotPassword && !resetToken && !otpStep && (
        <div>
          <h2 style={{ fontSize:16, fontWeight:800, color:TT.text, marginBottom:6 }}>Forgot your password?</h2>
          {resetRequested ? (
            <p role="status" style={{ fontSize:13, color:TT.muted, marginBottom:16 }}>
              If an account exists for that email, a password reset link has been sent. Check your inbox.
            </p>
          ) : (
            <>
              <p style={{ fontSize:12, color:TT.muted, marginBottom:16 }}>Enter your account email and we’ll send you a secure reset link.</p>
              <FormField label="Email">
                <Input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email address" onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()} />
              </FormField>
              {error && <p role="alert" style={{ color:TT.danger, fontSize:12, margin:"0 0 12px" }}>{error}</p>}
              <button onClick={handleForgotPassword} disabled={loading} style={{
                width:"100%", padding:"12px 0", borderRadius:12, border:"none",
                cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:800,
                fontFamily:"inherit", background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
                color:"#fff", opacity:loading?0.7:1,
              }}>{loading?"Sending link...":"Send Reset Link"}</button>
            </>
          )}
          <button onClick={()=>{setForgotPassword(false);setResetRequested(false);setError("");}} style={{
            width:"100%", padding:"9px 0", marginTop:12, borderRadius:10, border:`1px solid ${TT.border}`,
            background:"transparent", color:TT.muted, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600,
          }}>← Back to Sign In</button>
        </div>
      )}
 
      {/* Login / Register tabs */}
      {!otpStep && !resetToken && !forgotPassword && (
        <>
          <div style={{ display:"flex", gap:4, background:TT.surface2, borderRadius:12, padding:4, marginBottom:"1.5rem" }}>
            {[["login","Sign In"],["register","Register"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setTab(id);setError("");}} style={{
                flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, fontFamily:"inherit",
                background:tab===id?TT.accent:"transparent",
                color:tab===id?"#fff":TT.muted, transition:"all 0.2s",
              }}>{label}</button>
            ))}
          </div>
 
          {/* Login form */}
          {tab==="login" && (
            <div>
              <FormField label="Email">
                <Input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email address" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              </FormField>
              <FormField label="Password">
                <Input type="password" value={form.password} onChange={set("password")} placeholder="Enter your password" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              </FormField>
              <div style={{ textAlign:"right", marginTop:-6, marginBottom:12 }}>
                <button type="button" onClick={()=>{setForgotPassword(true);setError("");}} style={{
                  border:"none", background:"none", color:TT.accent, cursor:"pointer",
                  fontSize:12, fontWeight:700, fontFamily:"inherit",
                }}>Forgot password?</button>
              </div>
              {error && <p style={{ color:TT.danger, fontSize:12, margin:"0 0 12px" }}>{error}</p>}
              <button onClick={handleLogin} disabled={loading} style={{
                width:"100%", padding:"12px 0", borderRadius:12, border:"none",
                cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:800,
                fontFamily:"inherit", background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
                color:"#fff", opacity:loading?0.7:1,
              }}>{loading?"Signing in...":"Sign In →"}</button>
            </div>
          )}
 
          {/* Register form */}
          {tab==="register" && (
            <div>
              <FormField label="Full Name *">
                <Input type="text" value={form.name} onChange={set("name")} placeholder="Enter your full name" />
              </FormField>
              <FormField label="Email Address *">
                <Input type="email" value={form.email} onChange={set("email")} placeholder="Enter your email address" />
              </FormField>
              <FormField label="Phone Number *">
                <Input type="tel" value={form.phone}
                  onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v.length<=10)setForm(p=>({...p,phone:v}));}}
                  placeholder="10 digit mobile number" maxLength={10} />
                {form.phone.length>0 && form.phone.length<10 && (
                  <p style={{ color:TT.danger, fontSize:11, marginTop:3 }}>⚠ {form.phone.length}/10 digits</p>
                )}
              </FormField>
              <FormField label="Password *">
                <Input type="password" value={form.password} onChange={set("password")} placeholder="Enter a strong password" />
              </FormField>
              {error && <p style={{ color:TT.danger, fontSize:12, margin:"0 0 12px" }}>{error}</p>}
              <button onClick={handleRegister} disabled={loading} style={{
                width:"100%", padding:"12px 0", borderRadius:12, border:"none",
                cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:800,
                fontFamily:"inherit", background:`linear-gradient(135deg,${TT.accent},${TT.rose})`,
                color:"#fff", opacity:loading?0.7:1,
              }}>{loading?"Sending OTP...":"Create Account →"}</button>
              <p style={{ fontSize:11, color:TT.muted, textAlign:"center", marginTop:8 }}>
                📧 OTP will be sent to verify your email
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CatalogFilterPanel({
  T,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
}) {
  const priceRangeError = priceMin !== "" && priceMax !== "" && Number(priceMin) > Number(priceMax);
  const fieldStyle = {
    width: "100%",
    minWidth: 0,
    padding: "9px 10px",
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    background: T.surface2,
    color: T.text,
    fontFamily: "inherit",
    fontSize: 13,
    boxSizing: "border-box",
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: 16,
      padding: 16,
      marginBottom: 16,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      background: T.surface,
    }}>
      <div>
        <label style={{ display: "block", marginBottom: 8, color: T.muted, fontSize: 12, fontWeight: 700 }}>
          Price range (₹)
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            min="0"
            aria-label="Minimum price"
            placeholder="Min"
            value={priceMin}
            onChange={event => setPriceMin(event.target.value)}
            style={{ ...fieldStyle, flex: 1 }}
          />
          <span style={{ color: T.muted, fontSize: 12 }}>to</span>
          <input
            type="number"
            min="0"
            aria-label="Maximum price"
            placeholder="Max"
            value={priceMax}
            onChange={event => setPriceMax(event.target.value)}
            style={{ ...fieldStyle, flex: 1 }}
          />
        </div>
        {priceRangeError && (
          <p role="alert" style={{ margin: "6px 0 0", color: T.danger, fontSize: 12 }}>
            Minimum price must not exceed maximum price.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="catalog-min-rating" style={{ display: "block", marginBottom: 8, color: T.muted, fontSize: 12, fontWeight: 700 }}>
          Customer rating
        </label>
        <select
          id="catalog-min-rating"
          value={minRating}
          onChange={event => setMinRating(Number(event.target.value))}
          style={{ ...fieldStyle, minHeight: 38, padding: "8px 10px" }}
        >
          <option value={0}>Any rating</option>
          <option value={3}>3★ & up</option>
          <option value={4}>4★ & up</option>
        </select>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 9, alignSelf: "center", color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={event => setInStockOnly(event.target.checked)}
        />
        In-stock products only
      </label>
    </div>
  );
}

function GuestShopSection({ onNavigate, onRequireLogin }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
 
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category,    setCategory]    = useState("All");
  const [sortBy,      setSortBy]      = useState("default");
  const [priceMin,    setPriceMin]    = useState("");
  const [priceMax,    setPriceMax]    = useState("");
  const [minRating,   setMinRating]   = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(!state.products?.length);
 
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
 
  useEffect(() => {
    if (state.products?.length > 0) setLoadingProducts(false);
  }, [state.products]);
 
  const ITEMS_PER_PAGE = 12;
  const categories = ["All", ...CATEGORIES];
 
  const filtered = useMemo(() => {
    let list = [...(state.products || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter(p => p.category === category);
    const priceRangeError = priceMin !== "" && priceMax !== "" && Number(priceMin) > Number(priceMax);
    if (priceRangeError) return [];
    if (priceMin !== "") list = list.filter(p => p.price >= Number(priceMin));
    if (priceMax !== "") list = list.filter(p => p.price <= Number(priceMax));
    if (minRating > 0) list = list.filter(p => (p.rating || 0) >= minRating);
    if (inStockOnly) list = list.filter(p => p.stock > 0);
    switch(sortBy) {
      case "price_asc":  list.sort((a,b) => a.price - b.price); break;
      case "price_desc": list.sort((a,b) => b.price - a.price); break;
      case "rating":     list.sort((a,b) => b.rating - a.rating); break;
      case "popular":    list.sort((a,b) => (b.sales||0) - (a.sales||0)); break;
      default: break;
    }
    return list;
  }, [state.products, search, category, sortBy, priceMin, priceMax, minRating, inStockOnly]);
 
  useEffect(() => { setPage(1); }, [search, category, sortBy, priceMin, priceMax, minRating, inStockOnly]);

  const activeFilterCount = [
    category !== "All",
    priceMin !== "",
    priceMax !== "",
    minRating > 0,
    inStockOnly,
  ].filter(Boolean).length;
  const hasActiveControls = Boolean(searchInput || activeFilterCount || sortBy !== "default");
  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("All");
    setSortBy("default");
    setPriceMin("");
    setPriceMax("");
    setMinRating(0);
    setInStockOnly(false);
  };
 
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
 
  return (
    <div style={{ padding:"1.5rem 2rem" }}>
 
      {/* Login banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.accentBg}, ${T.surface2})`,
        border: `1px solid ${T.accentBorder}`,
        borderRadius: 14,
        padding: "14px 20px",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🛍️</span>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:0 }}>
              Sign in to add items to cart & wishlist
            </p>
            <p style={{ fontSize:12, color:T.muted, margin:0 }}>
              Browse freely — create an account to start shopping
            </p>
          </div>
        </div>
        {/* <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => onRequireLogin("login")} style={{
            padding:"7px 16px", borderRadius:8,
            border:`1px solid ${T.border}`, background:"transparent",
            color:T.text, fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer",
          }}>Sign In</button>
          <button onClick={() => onRequireLogin("register")} style={{
            padding:"7px 18px", borderRadius:8, border:"none",
            background:`linear-gradient(135deg,${T.accent},${T.rose})`,
            color:"#fff", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer",
          }}>Sign Up Free →</button>
        </div> */}
      </div>
 
      {/* Search + sort */}
      <div style={{ display:"flex", gap:10, marginBottom:"1rem", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            placeholder="Search products..."
            style={{ width:"100%", padding:"10px 14px 10px 40px", borderRadius:12, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
          />
          {searchInput && (
            <button onClick={()=>{setSearch("");setSearchInput("");}} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:18 }}>×</button>
          )}
        </div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"10px 14px",borderRadius:12,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13,fontFamily:"inherit",outline:"none",cursor:"pointer",minWidth:160 }}>
          <option value="default">🔀 Default</option>
          <option value="popular">🔥 Most Popular</option>
          <option value="rating">⭐ Highest Rated</option>
          <option value="price_asc">💰 Price: Low → High</option>
          <option value="price_desc">💎 Price: High → Low</option>
        </select>
        <button
          type="button"
          aria-expanded={showFilters}
          aria-controls="guest-catalog-filters"
          onClick={() => setShowFilters(open => !open)}
          style={{ ...baseStyles(state.theme).btn(activeFilterCount ? "primary" : "ghost"), padding: "9px 14px" }}
        >
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        {hasActiveControls && (
          <button type="button" onClick={clearFilters} style={{ ...baseStyles(state.theme).btn("ghost"), padding: "9px 14px" }}>
            Clear filters
          </button>
        )}
      </div>
 
      {/* Category pills */}
      <div style={{ display:"flex", gap:8, marginBottom:"1.25rem", flexWrap:"wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={()=>setCategory(cat)} style={{
            padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600,
            border:`1px solid ${category===cat?T.accentBorder:T.border}`,
            background:category===cat?T.accentBg:"transparent",
            color:category===cat?T.accent:T.muted,
            cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.15s",
          }}>{cat}</button>
        ))}
      </div>

      {showFilters && (
        <div id="guest-catalog-filters">
          <CatalogFilterPanel
            T={T}
            priceMin={priceMin} setPriceMin={setPriceMin}
            priceMax={priceMax} setPriceMax={setPriceMax}
            minRating={minRating} setMinRating={setMinRating}
            inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
          />
        </div>
      )}
 
      {/* Count */}
      <p style={{ fontSize:13, color:T.muted, marginBottom:"1rem" }}>
        {filtered.length===0 ? "No products found" : `${filtered.length} products`}
        {search && <span> for "<strong style={{ color:T.text }}>{search}</strong>"</span>}
      </p>
 
      {/* Grid */}
      {loadingProducts ? (
        <SkeletonGrid count={8} />
      ) : paginated.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 2rem", background:T.surface, borderRadius:16, border:`1px dashed ${T.border}` }}>
          <div style={{ fontSize:48, marginBottom:12, opacity:0.5 }}>🔍</div>
          <p style={{ fontSize:16, fontWeight:700 }}>No products found</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:20 }}>
          {paginated.map(product => (
            <GuestProductCard
              key={product._id || product.id}
              product={product}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
      )}
 
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:"2rem", flexWrap:"wrap" }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ padding:"8px 16px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:page===1?T.muted:T.text,fontSize:13,fontFamily:"inherit",cursor:page===1?"not-allowed":"pointer",opacity:page===1?0.4:1 }}>← Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)} style={{ padding:"8px 14px",borderRadius:10,border:`1px solid ${p===page?T.accentBorder:T.border}`,background:p===page?T.accent:T.surface,color:p===page?"#fff":T.text,fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:p===page?800:400 }}>{p}</button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ padding:"8px 16px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:page===totalPages?T.muted:T.text,fontSize:13,fontFamily:"inherit",cursor:page===totalPages?"not-allowed":"pointer",opacity:page===totalPages?0.4:1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}

function GuestProductCard({ product, onRequireLogin }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [detailOpen, setDetailOpen] = useState(false);
 
  const p = product;
  const primaryImage = p.images?.[0] || p.image;
  const hasImage = primaryImage && primaryImage.trim() !== "";
  const discountPct = p.originalPrice && p.originalPrice > p.price
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : null;
 
  return (
    <>
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    }}
      onClick={() => setDetailOpen(true)}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.15)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* Image / emoji */}
      <div style={{ position:"relative", height:160, background:T.surface2, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        {hasImage ? (
          <img src={primaryImage} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <span style={{ fontSize:64 }}>{p.emoji}</span>
        )}
        {discountPct && (
          <div style={{ position:"absolute",top:8,left:8,background:T.danger,color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700 }}>
            -{discountPct}%
          </div>
        )}
        {/* Wishlist button — requires login */}
        <button
          onClick={event => { event.stopPropagation(); onRequireLogin("login"); }}
          title="Sign in to save to wishlist"
          style={{ position:"absolute",top:8,right:8,width:32,height:32,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.9)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}
        >🤍</button>
        {p.stock === 0 && (
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ color:"#fff",fontWeight:700,fontSize:14,background:"rgba(0,0,0,0.6)",padding:"4px 12px",borderRadius:8 }}>Out of Stock</span>
          </div>
        )}
      </div>
 
      {/* Info */}
      <div style={{ padding:"0.9rem" }}>
        <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{p.category}</p>
        <p style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:4, lineHeight:1.3,
          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {p.name}
        </p>
 
        {/* Rating */}
        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:8 }}>
          <span style={{ color:"#f59e0b", fontSize:12 }}>★</span>
          <span style={{ fontSize:12, color:T.muted }}>{p.rating}</span>
          {p.sales > 0 && <span style={{ fontSize:11, color:T.muted }}>· {p.sales} sold</span>}
        </div>
 
        {/* Price */}
        <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:10 }}>
          <span style={{ fontSize:18, fontWeight:900, color:T.accent }}>
            ₹{p.price?.toLocaleString("en-IN")}
          </span>
          {p.originalPrice && p.originalPrice > p.price && (
            <span style={{ fontSize:13, color:T.muted, textDecoration:"line-through" }}>
              ₹{p.originalPrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>
 
        {/* Add to Cart — requires login */}
        <button
          onClick={event => { event.stopPropagation(); onRequireLogin("login"); }}
          disabled={p.stock === 0}
          title={p.stock===0 ? "Out of stock" : "Sign in to add to cart"}
          style={{
            width:"100%", padding:"9px 0", borderRadius:10, border:"none",
            cursor: p.stock===0 ? "not-allowed" : "pointer",
            fontSize:13, fontWeight:700, fontFamily:"inherit",
            background: p.stock===0 ? T.surface2 : `linear-gradient(135deg,${T.accent},${T.rose})`,
            color: p.stock===0 ? T.muted : "#fff",
            opacity: p.stock===0 ? 0.6 : 1,
            transition:"all 0.2s",
          }}
        >
          {p.stock===0 ? "Out of Stock" : "🛒 Add to Cart"}
        </button>
 
        {/* Login hint */}
        {p.stock > 0 && (
          <p style={{ fontSize:10, color:T.muted, textAlign:"center", marginTop:6 }}>
            <button onClick={event => { event.stopPropagation(); onRequireLogin("login"); }} style={{ background:"none",border:"none",color:T.accent,cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600 }}>
              Sign in
            </button> to shop
          </p>
        )}
      </div>
    </div>
    <ProductDetailModal
      product={product}
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      inCart={false}
      inWishlist={false}
      onAddToCart={() => { setDetailOpen(false); onRequireLogin("login"); }}
      onToggleWish={() => { setDetailOpen(false); onRequireLogin("login"); }}
    />
    </>
  );
}
  

function AuthModal({ initialTab, onClose }) {
  const T = getT(useApp().state.theme);
 
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close button */}
      <div style={{ position:"relative", width:"100%", maxWidth:440 }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.muted,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >×</button>
 
        {/* Render the full AuthPage but with initialTab */}
        <AuthPageInline initialTab={initialTab} onSuccess={onClose} />
      </div>
    </div>
  );
}

function StarRating({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  const T = getT(useApp().state.theme);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: size, cursor: onChange ? "pointer" : "default",
            color: star <= (hovered || value) ? "#f59e0b" : T.border,
            transition: "color 0.15s",
          }}
        >★</span>
      ))}
    </div>
  );
}

function ProductReviews({ productId, orderId }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [data, setData] = useState({ reviews: [], total: 0, avgRating: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });

  const loadReviews = async () => {
    try {
      const res = await reviews.getByProduct(productId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [productId]);

  const handleSubmit = async () => {
    if (!form.rating) { toast("Please select a star rating.", "error"); return; }
    if (!orderId) { toast("You can only review products you've purchased.", "error"); return; }
    setSubmitting(true);
    try {
      await reviews.submit({ productId, orderId, ...form });
      toast("Review submitted! Thank you.", "success");
      setShowForm(false);
      setForm({ rating: 0, title: "", body: "" });
      loadReviews();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: T.muted, fontSize: 13 }}>Loading reviews...</div>;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text }}>
          Customer Reviews ({data.total})
        </h3>
        {orderId && (
          <button onClick={() => setShowForm(!showForm)} style={{ ...s.btn("primary"), padding: "8px 18px", fontSize: 13 }}>
            {showForm ? "Cancel" : "✍️ Write Review"}
          </button>
        )}
      </div>

      {/* Average rating summary */}
      {data.total > 0 && (
        <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: T.accent, letterSpacing: "-0.04em" }}>{data.avgRating}</div>
            <StarRating value={Math.round(data.avgRating)} size={20} />
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{data.total} reviews</div>
          </div>
          <div>
            {[5, 4, 3, 2, 1].map(star => {
              const count = data.breakdown[star] || 0;
              const pct = data.total > 0 ? (count / data.total) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.muted, width: 20 }}>{star}★</span>
                  <div style={{ flex: 1, height: 8, background: T.surface2, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: 12, color: T.muted, width: 24 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem", border: `1px solid ${T.accentBorder}` }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: "1rem", color: T.text }}>Write Your Review</h4>
          <FormField label="Rating *">
            <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} size={32} />
          </FormField>
          <FormField label="Review Title">
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Summarize your experience..." />
          </FormField>
          <FormField label="Your Review">
            <textarea
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Share your detailed experience with this product..."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </FormField>
          <Btn onClick={handleSubmit} disabled={submitting || !form.rating}>
            {submitting ? "Submitting..." : "Submit Review ⭐"}
          </Btn>
        </div>
      )}

      {/* Reviews list */}
      {data.reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: T.muted, background: T.surface, borderRadius: 14, border: `1px dashed ${T.border}` }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <p style={{ fontWeight: 700 }}>No reviews yet</p>
          <p style={{ fontSize: 13 }}>Be the first to review this product!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.reviews.map(review => (
            <div key={review._id} style={{ ...s.card, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#0a0908" }}>
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{review.user?.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StarRating value={review.rating} size={14} />
                      {review.verified && (
                        <span style={{ fontSize: 10, color: T.success, fontWeight: 700 }}>✅ Verified Purchase</span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              {review.title && <p style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 6 }}>{review.title}</p>}
              {review.body && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Recently Viewed Hook ─────────────────────────────────────
function useRecentlyViewed() {
  const MAX = 10;
  const KEY = "sv_recently_viewed";

  const get = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  };

  const add = (productId) => {
    const list = get().filter(id => id !== productId);
    list.unshift(productId);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  };

  const clear = () => localStorage.removeItem(KEY);

  return { get, add, clear };
}

function SkeletonCard() {
  const { state } = useApp();
  const T = getT(state.theme);

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: "hidden",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.5; }
        }
        @keyframes shimmer {
          0%   { background-position: -1000px 0; }
          100% { background-position:  1000px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--sk-base) 25%,
            var(--sk-shine) 50%,
            var(--sk-base) 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Image skeleton */}
      <div className="shimmer" style={{
        height: 150,
        "--sk-base": T.surface2,
        "--sk-shine": T.border,
      }} />

      {/* Content skeleton */}
      <div style={{ padding: "1rem" }}>
        <div className="shimmer" style={{
          height: 12, borderRadius: 6, marginBottom: 10, width: "40%",
          "--sk-base": T.surface2,
          "--sk-shine": T.border,
        }} />
        <div className="shimmer" style={{
          height: 14, borderRadius: 6, marginBottom: 8, width: "80%",
          "--sk-base": T.surface2,
          "--sk-shine": T.border,
        }} />
        <div className="shimmer" style={{
          height: 12, borderRadius: 6, marginBottom: 8, width: "60%",
          "--sk-base": T.surface2,
          "--sk-shine": T.border,
        }} />
        <div className="shimmer" style={{
          height: 12, borderRadius: 6, marginBottom: 14, width: "30%",
          "--sk-base": T.surface2,
          "--sk-shine": T.border,
        }} />
        <div className="shimmer" style={{
          height: 36, borderRadius: 10,
          "--sk-base": T.surface2,
          "--sk-shine": T.border,
        }} />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: 20,
    }}>
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

function RecommendationsSection({ currentProductId, currentCategory, onAddToCart, onToggleWish, title = "You Might Also Like" }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();

  const cartIds = state.cart.map(c => (c.id || c._id)?.toString());
  const wishlistIds = state.wishlist.map(id => id.toString());

  const recommended = useMemo(() => {
    if (!state.products?.length) return [];

    return state.products
      .filter(p => {
        const pid = (p._id || p.id)?.toString();
        return pid !== currentProductId?.toString() && p.category === currentCategory;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [state.products, currentProductId, currentCategory]);

  if (recommended.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: "1rem" }}>
        {title}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {recommended.map(product => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            inCart={cartIds.includes((product._id || product.id)?.toString())}
            inWishlist={wishlistIds.includes((product._id || product.id)?.toString())}
            onAddToCart={() => addToCart((product._id || product.id)?.toString())}
            onToggleWish={() => toggleWishlist((product._id || product.id)?.toString())}
          />
        ))}
      </div>
    </div>
  );
}

function TrendingSection() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();

  const cartIds = state.cart.map(c => (c.id || c._id)?.toString());
  const wishlistIds = state.wishlist.map(id => id.toString());

  // Top 4 by sales
  const trending = useMemo(() => {
    return [...(state.products || [])]
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 4);
  }, [state.products]);

  if (trending.length === 0) return null;

  return (
    <div style={{ padding: "2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
              🔥 Trending Now
            </h2>
            <p style={{ fontSize: 13, color: T.muted }}>Most popular products this week</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {trending.map((product, i) => (
            <div key={product._id || product.id} style={{ position: "relative" }}>
              {/* Rank badge */}
              <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 3,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3f" : T.surface2,
                color: i < 3 ? "#fff" : T.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 900,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                {i + 1}
              </div>
              <ProductCard
                product={product}
                inCart={cartIds.includes((product._id || product.id)?.toString())}
                inWishlist={wishlistIds.includes((product._id || product.id)?.toString())}
                onAddToCart={() => addToCart((product._id || product.id)?.toString())}
                onToggleWish={() => toggleWishlist((product._id || product.id)?.toString())}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentlyViewedSection() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();

  const cartIds = state.cart.map(c => (c.id || c._id)?.toString());
  const wishlistIds = state.wishlist.map(id => id.toString());

  const recentIds = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sv_recently_viewed") || "[]"); }
    catch { return []; }
  }, []);

  const recentProducts = useMemo(() => {
    return recentIds
      .map(id => state.products?.find(p => (p._id || p.id)?.toString() === id))
      .filter(Boolean)
      .slice(0, 6);
  }, [recentIds, state.products]);

  if (recentProducts.length === 0) return null;

  return (
    <div style={{ padding: "2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
              🕐 Recently Viewed
            </h2>
            <p style={{ fontSize: 13, color: T.muted }}>Pick up where you left off</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem("sv_recently_viewed"); window.location.reload(); }}
            style={{ ...s.btn("ghost"), fontSize: 12, padding: "6px 12px" }}
          >
            Clear
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
          {recentProducts.map(product => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              inCart={cartIds.includes((product._id || product.id)?.toString())}
              inWishlist={wishlistIds.includes((product._id || product.id)?.toString())}
              onAddToCart={() => addToCart((product._id || product.id)?.toString())}
              onToggleWish={() => toggleWishlist((product._id || product.id)?.toString())}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TopRatedSection() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();

  const cartIds = state.cart.map(c => (c.id || c._id)?.toString());
  const wishlistIds = state.wishlist.map(id => id.toString());

  const topRated = useMemo(() => {
    return [...(state.products || [])]
      .filter(p => p.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [state.products]);

  if (topRated.length === 0) return null;

  return (
    <div style={{ padding: "2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
            ⭐ Top Rated Products
          </h2>
          <p style={{ fontSize: 13, color: T.muted }}>Loved by our customers — rated 4.5★ and above</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {topRated.map(product => (
            <div key={product._id || product.id} style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 3,
                background: "#f59e0b",
                color: "#fff",
                borderRadius: 8,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
              }}>
                ★ {product.rating}
              </div>
              <ProductCard
                product={product}
                inCart={cartIds.includes((product._id || product.id)?.toString())}
                inWishlist={wishlistIds.includes((product._id || product.id)?.toString())}
                onAddToCart={() => addToCart((product._id || product.id)?.toString())}
                onToggleWish={() => toggleWishlist((product._id || product.id)?.toString())}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Countdown Timer ──────────────────────────────────────────
function CountdownTimer({ endTime, size = "normal" }) {
  const { state } = useApp();
  const T = getT(state.theme);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - Date.now();
      if (diff <= 0) { setTimeLeft({ hours: 0, mins: 0, secs: 0, expired: true }); return; }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, mins, secs, expired: false });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  if (timeLeft.expired) return (
    <span style={{ fontSize: size === "small" ? 11 : 13, color: T.muted, fontWeight: 600 }}>
      Sale ended
    </span>
  );

  const pad = n => String(n).padStart(2, "0");
  const fs = size === "small" ? 14 : 20;
  const lfs = size === "small" ? 9 : 10;
  const pad2 = size === "small" ? "4px 6px" : "8px 10px";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[
        { val: pad(timeLeft.hours), label: "HRS" },
        { val: ":", label: null },
        { val: pad(timeLeft.mins), label: "MINS" },
        { val: ":", label: null },
        { val: pad(timeLeft.secs), label: "SECS" },
      ].map((item, i) => item.label === null ? (
        <span key={i} style={{ fontSize: fs, fontWeight: 900, color: T.danger, lineHeight: 1 }}>:</span>
      ) : (
        <div key={i} style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 6,
          padding: pad2,
          textAlign: "center",
          minWidth: size === "small" ? 28 : 40,
        }}>
          <div style={{ fontSize: fs, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{item.val}</div>
          {size !== "small" && (
            <div style={{ fontSize: lfs, color: "rgba(255,255,255,0.7)", marginTop: 2, letterSpacing: "0.05em" }}>
              {item.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Flash Sale Banner ────────────────────────────────────────
function FlashSaleBanner() {
  const { state } = useApp();
  const T = getT(state.theme);

  const [activeSales, setActiveSales] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    sales.active()
      .then(setActiveSales)
      .catch(() => { });
  }, []);

  // Cycle through multiple sales
  useEffect(() => {
    if (activeSales.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % activeSales.length), 5000);
    return () => clearInterval(t);
  }, [activeSales]);

  if (activeSales.length === 0) return null;

  const sale = activeSales[current];

  return (
    <div style={{
      background: "linear-gradient(135deg, #e05c5c, #d4a843)",
      padding: "14px 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>⚡</span>
        <div>
          <p style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
            {sale.title} — {sale.discount}% OFF
          </p>
          {sale.description && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: 0 }}>
              {sale.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "0 0 4px", fontWeight: 600 }}>
            ENDS IN
          </p>
          <CountdownTimer endTime={sale.endTime} />
        </div>
        {activeSales.length > 1 && (
          <div style={{ display: "flex", gap: 4 }}>
            {activeSales.map((_, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.2s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) callback(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, callback]);

  return loaderRef;
}

function AdBanner({ ad, onCategoryFilter }) {
  const T = getT(useApp().state.theme);
 
  if (!ad || !ad.active) return null;
 
  return (
    <div
      onClick={() => ad.link && onCategoryFilter && onCategoryFilter(ad.link)}
      style={{
        borderRadius: 16, overflow: "hidden",
        background: `linear-gradient(135deg, ${ad.bgColor || "#7c6fff"}, ${ad.bgColor2 || "#e05c8a"})`,
        padding: ad.type === "strip" ? "12px 20px" : ad.type === "card" ? "1.75rem" : "1.5rem",
        display: "flex",
        alignItems: ad.type === "strip" ? "center" : "flex-start",
        justifyContent: "space-between",
        gap: 14,
        flexDirection: ad.type === "card" ? "column" : "row",
        cursor: ad.link ? "pointer" : "default",
        marginBottom: "1.25rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)"; }}
    >
      {/* Decorative circle */}
      <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 40, bottom: -50, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
 
      {ad.type !== "strip" && (
        <div style={{ fontSize: ad.type === "card" ? 48 : 38, lineHeight: 1, position: "relative", zIndex: 1 }}>
          {ad.emoji}
        </div>
      )}
 
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {ad.badgeText && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: "#fff",
            background: "rgba(0,0,0,0.2)", borderRadius: 20,
            padding: "3px 12px", display: "inline-block",
            marginBottom: 8, letterSpacing: "0.07em",
          }}>{ad.badgeText}</span>
        )}
        <p style={{
          fontSize: ad.type === "banner" ? 20 : ad.type === "card" ? 22 : 15,
          fontWeight: 900, color: "#fff", margin: 0,
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {ad.title}
        </p>
        {ad.subtitle && ad.type !== "strip" && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", margin: "6px 0 0", lineHeight: 1.5 }}>
            {ad.subtitle}
          </p>
        )}
      </div>
 
      <button
        onClick={e => { e.stopPropagation(); ad.link && onCategoryFilter && onCategoryFilter(ad.link); }}
        style={{
          background: "#fff",
          color: ad.bgColor || "#7c6fff",
          border: "none", borderRadius: 12,
          padding: ad.type === "strip" ? "8px 18px" : "10px 22px",
          fontSize: 13, fontWeight: 800,
          cursor: "pointer", flexShrink: 0,
          fontFamily: "inherit",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "relative", zIndex: 1,
          transition: "transform 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {ad.linkLabel || "Shop Now"} →
      </button>
    </div>
  );
}

// function ShopSection({ onNavigate }) {
//   const { state, dispatch } = useApp();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);
//   const { addToCart } = useCartActions();
//   const { toggleWishlist } = useWishlistActions();

//   const [search, setSearch] = useState("");
//   const [searchInput, setSearchInput] = useState("");
//   const [category, setCategory] = useState("All");
//   const [sortBy, setSortBy] = useState("default");
//   const [priceMin, setPriceMin] = useState("");
//   const [priceMax, setPriceMax] = useState("");
//   const [minRating, setMinRating] = useState(0);
//   const [inStockOnly, setInStockOnly] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [page, setPage] = useState(1);
//   const [loadingProducts, setLoadingProducts] = useState(!state.products?.length);
//   const [useInfinite, setUseInfinite] = useState(false);
//   const [infiniteItems, setInfiniteItems] = useState(12);

//   // Debounce search by 300ms
//   useEffect(() => {
//     const t = setTimeout(() => setSearch(searchInput), 300);
//     return () => clearTimeout(t);
//   }, [searchInput]);

//   useEffect(() => {
//     if (state.products?.length > 0) setLoadingProducts(false);
//   }, [state.products]);

//   const ITEMS_PER_PAGE = 12;
//   const categories = ["All", ...CATEGORIES];

//   const cartIds = state.cart.map(c => (c.id || c._id)?.toString());
//   const wishlistIds = state.wishlist.map(id => id.toString());

//   // ── Filter + Sort logic ──────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = [...(state.products || [])];

//     // Search
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(p =>
//         p.name?.toLowerCase().includes(q) ||
//         p.description?.toLowerCase().includes(q) ||
//         p.category?.toLowerCase().includes(q)
//       );
//     }

//     // Category
//     if (category !== "All") {
//       list = list.filter(p => p.category === category);
//     }

//     // Price range
//     if (priceMin !== "") list = list.filter(p => p.price >= Number(priceMin));
//     if (priceMax !== "") list = list.filter(p => p.price <= Number(priceMax));

//     // Rating
//     if (minRating > 0) list = list.filter(p => p.rating >= minRating);

//     // In stock
//     if (inStockOnly) list = list.filter(p => p.stock > 0);

//     // Sort
//     switch (sortBy) {
//       case "price_asc": list.sort((a, b) => a.price - b.price); break;
//       case "price_desc": list.sort((a, b) => b.price - a.price); break;
//       case "rating": list.sort((a, b) => b.rating - a.rating); break;
//       case "newest": list.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
//       case "popular": list.sort((a, b) => (b.sales || 0) - (a.sales || 0)); break;
//       case "name_az": list.sort((a, b) => a.name.localeCompare(b.name)); break;
//       case "name_za": list.sort((a, b) => b.name.localeCompare(a.name)); break;
//       default: break;
//     }

//     return list;
//   }, [state.products, search, category, sortBy, priceMin, priceMax, minRating, inStockOnly]);

//   // Reset page when filters change
//   useEffect(() => { setPage(1); }, [search, category, sortBy, priceMin, priceMax, minRating, inStockOnly]);

//   const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
//   const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

//   const loadMore = useCallback(() => {
//     if (infiniteItems < filtered.length) {
//       setInfiniteItems(prev => prev + 12);
//     }
//   }, [infiniteItems, filtered.length]);

//   const loaderRef = useInfiniteScroll(loadMore, useInfinite && infiniteItems < filtered.length);

//   const displayedProducts = useInfinite
//     ? filtered.slice(0, infiniteItems)
//     : paginated;

//   const activeFilterCount = [
//     category !== "All",
//     sortBy !== "default",
//     priceMin !== "",
//     priceMax !== "",
//     minRating > 0,
//     inStockOnly,
//   ].filter(Boolean).length;

//   const clearAllFilters = () => {
//     setSearch("");
//     setSearchInput("");
//     setCategory("All");
//     setSortBy("default");
//     setPriceMin("");
//     setPriceMax("");
//     setMinRating(0);
//     setInStockOnly(false);
//     setPage(1);
//   };

//   return (
//     <div style={{ padding: "1.5rem 2rem" }}>

//       {/* ── Top bar: search + filter toggle ── */}
//       <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>

//         {/* Search box */}
//         <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
//           <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔍</span>
//           <input
//             value={searchInput}
//             onChange={e => setSearchInput(e.target.value)}
//             placeholder="Search products, categories..."
//             style={{
//               width: "100%", padding: "10px 14px 10px 40px",
//               borderRadius: 12, border: `1px solid ${T.border}`,
//               background: T.surface, color: T.text,
//               fontSize: 13, fontFamily: "inherit", outline: "none",
//               boxSizing: "border-box",
//               transition: "border-color 0.2s",
//             }}
//             onFocus={e => e.target.style.borderColor = T.accent}
//             onBlur={e => e.target.style.borderColor = T.border}
//           />
//           {searchInput && (
//             <button
//               onClick={() => { setSearch(""); setSearchInput(""); }}
//               style={{
//                 position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
//                 background: "none", border: "none", cursor: "pointer",
//                 color: T.muted, fontSize: 18, lineHeight: 1,
//               }}
//             >×</button>
//           )}
//         </div>

//         {/* Sort dropdown */}
//         <select
//           value={sortBy}
//           onChange={e => setSortBy(e.target.value)}
//           style={{
//             padding: "10px 14px", borderRadius: 12,
//             border: `1px solid ${T.border}`, background: T.surface,
//             color: T.text, fontSize: 13, fontFamily: "inherit",
//             outline: "none", cursor: "pointer", minWidth: 160,
//           }}
//         >
//           <option value="default">🔀 Default</option>
//           <option value="popular">🔥 Most Popular</option>
//           <option value="rating">⭐ Highest Rated</option>
//           <option value="newest">🆕 Newest First</option>
//           <option value="price_asc">💰 Price: Low → High</option>
//           <option value="price_desc">💎 Price: High → Low</option>
//           <option value="name_az">🔤 Name: A → Z</option>
//           <option value="name_za">🔤 Name: Z → A</option>
//         </select>

//         {/* Filter toggle button */}
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           style={{
//             padding: "10px 18px", borderRadius: 12,
//             border: `1px solid ${activeFilterCount > 0 ? T.accentBorder : T.border}`,
//             background: activeFilterCount > 0 ? T.accentBg : T.surface,
//             color: activeFilterCount > 0 ? T.accent : T.text,
//             fontSize: 13, fontWeight: 600, fontFamily: "inherit",
//             cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
//           }}
//         >
//           ⚙️ Filters
//           {activeFilterCount > 0 && (
//             <span style={{
//               background: T.accent, color: "#fff",
//               borderRadius: "50%", width: 18, height: 18,
//               fontSize: 10, fontWeight: 800,
//               display: "flex", alignItems: "center", justifyContent: "center",
//             }}>{activeFilterCount}</span>
//           )}
//         </button>

//         {/* Infinite Scroll Toggle */}
//         <button
//           onClick={() => { setUseInfinite(!useInfinite); setPage(1); setInfiniteItems(12); }}
//           style={{
//             padding: "10px 18px", borderRadius: 12,
//             border: `1px solid ${T.border}`,
//             background: T.surface,
//             color: T.text,
//             fontSize: 13, fontWeight: 600, fontFamily: "inherit",
//             cursor: "pointer",
//           }}
//         >
//           {useInfinite ? "📄 Pages" : "♾️ Infinite Scroll"}
//         </button>

//         {/* Clear all */}
//         {activeFilterCount > 0 && (
//           <button
//             onClick={clearAllFilters}
//             style={{
//               padding: "10px 16px", borderRadius: 12,
//               border: `1px solid ${T.danger}`,
//               background: "transparent", color: T.danger,
//               fontSize: 13, fontWeight: 600, fontFamily: "inherit",
//               cursor: "pointer",
//             }}
//           >
//             ✕ Clear All
//           </button>
//         )}
//       </div>

//       {/* ── Expanded Filter Panel ── */}
//       {showFilters && (
//         <div style={{
//           ...s.card, padding: "1.25rem",
//           marginBottom: "1rem",
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//           gap: 16,
//         }}>

//           {/* Category */}
//           <div>
//             <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
//               Category
//             </p>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//               {categories.map(cat => (
//                 <button key={cat} onClick={() => setCategory(cat)} style={{
//                   padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
//                   border: "none", cursor: "pointer", fontFamily: "inherit",
//                   background: category === cat ? T.accent : T.surface2,
//                   color: category === cat ? "#fff" : T.muted,
//                   transition: "all 0.15s",
//                 }}>{cat}</button>
//               ))}
//             </div>
//           </div>

//           {/* Price range */}
//           <div>
//             <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
//               Price Range (₹)
//             </p>
//             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//               <input
//                 type="number"
//                 value={priceMin}
//                 onChange={e => setPriceMin(e.target.value)}
//                 placeholder="Min"
//                 style={{
//                   flex: 1, padding: "8px 10px", borderRadius: 8,
//                   border: `1px solid ${T.border}`, background: T.surface2,
//                   color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none",
//                 }}
//               />
//               <span style={{ color: T.muted, fontSize: 12 }}>to</span>
//               <input
//                 type="number"
//                 value={priceMax}
//                 onChange={e => setPriceMax(e.target.value)}
//                 placeholder="Max"
//                 style={{
//                   flex: 1, padding: "8px 10px", borderRadius: 8,
//                   border: `1px solid ${T.border}`, background: T.surface2,
//                   color: T.text, fontSize: 12, fontFamily: "inherit", outline: "none",
//                 }}
//               />
//             </div>
//             {/* Quick price presets */}
//             <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
//               {[
//                 { label: "Under ₹1K", min: "", max: "1000" },
//                 { label: "₹1K–5K", min: "1000", max: "5000" },
//                 { label: "₹5K–20K", min: "5000", max: "20000" },
//                 { label: "Above ₹20K", min: "20000", max: "" },
//               ].map(preset => (
//                 <button key={preset.label} onClick={() => { setPriceMin(preset.min); setPriceMax(preset.max); }}
//                   style={{
//                     padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
//                     border: `1px solid ${T.border}`, cursor: "pointer",
//                     fontFamily: "inherit", background: T.surface2, color: T.muted,
//                     transition: "all 0.15s",
//                   }}
//                   onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
//                   onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
//                 >{preset.label}</button>
//               ))}
//             </div>
//           </div>

//           {/* Min Rating */}
//           <div>
//             <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
//               Minimum Rating
//             </p>
//             <div style={{ display: "flex", gap: 6 }}>
//               {[0, 3, 3.5, 4, 4.5].map(r => (
//                 <button key={r} onClick={() => setMinRating(r)} style={{
//                   padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
//                   border: "none", cursor: "pointer", fontFamily: "inherit",
//                   background: minRating === r ? T.accent : T.surface2,
//                   color: minRating === r ? "#fff" : T.muted,
//                   transition: "all 0.15s",
//                 }}>
//                   {r === 0 ? "All" : `${r}★+`}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* In Stock toggle */}
//           <div>
//             <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
//               Availability
//             </p>
//             <button
//               onClick={() => setInStockOnly(!inStockOnly)}
//               style={{
//                 padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
//                 border: `1px solid ${inStockOnly ? T.accentBorder : T.border}`,
//                 background: inStockOnly ? T.accentBg : "transparent",
//                 color: inStockOnly ? T.accent : T.muted,
//                 cursor: "pointer", fontFamily: "inherit",
//                 display: "flex", alignItems: "center", gap: 6,
//               }}
//             >
//               <span style={{
//                 width: 16, height: 16, borderRadius: 4, display: "flex",
//                 alignItems: "center", justifyContent: "center", fontSize: 11,
//                 background: inStockOnly ? T.accent : T.border,
//                 color: "#fff",
//               }}>
//                 {inStockOnly ? "✓" : ""}
//               </span>
//               In Stock Only
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Category pills (always visible) ── */}
//       <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap", overflowX: "auto" }}>
//         {categories.map(cat => (
//           <button key={cat} onClick={() => setCategory(cat)} style={{
//             padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
//             border: `1px solid ${category === cat ? T.accentBorder : T.border}`,
//             background: category === cat ? T.accentBg : "transparent",
//             color: category === cat ? T.accent : T.muted,
//             cursor: "pointer", fontFamily: "inherit",
//             whiteSpace: "nowrap", transition: "all 0.15s",
//           }}>{cat}</button>
//         ))}
//       </div>

//       {/* ── Results count ── */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//         <p style={{ fontSize: 13, color: T.muted }}>
//           {filtered.length === 0
//             ? "No products found"
//             : `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} products`
//           }
//           {search && <span> for "<strong style={{ color: T.text }}>{search}</strong>"</span>}
//         </p>
//         {activeFilterCount > 0 && (
//           <button onClick={clearAllFilters} style={{
//             fontSize: 12, color: T.danger, background: "none",
//             border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
//           }}>
//             ✕ Clear filters
//           </button>
//         )}
//       </div>

//       {/* ── Product Grid ── */}

//       {/* Show skeleton while loading */}
//       {loadingProducts && <SkeletonGrid count={8} />}

//       {/* Actual grid */}
//       {!loadingProducts && displayedProducts.length === 0 ? (
//         <div style={{
//           textAlign: "center", padding: "4rem 2rem",
//           background: T.surface, borderRadius: 16,
//           border: `1px dashed ${T.border}`,
//         }}>
//           <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>🔍</div>
//           <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No products found</p>
//           <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
//             Try different keywords or remove some filters.
//           </p>
//           <button onClick={clearAllFilters} style={{
//             padding: "10px 24px", borderRadius: 10, border: "none",
//             background: T.gradient, color: "#0a0908",
//             fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
//           }}>
//             Clear All Filters
//           </button>
//         </div>
//       ) : (
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//           gap: 20,
//         }}>
//           {displayedProducts.map(product => (
//             <ProductCard
//               key={product._id || product.id}
//               product={product}
//               inCart={cartIds.includes((product._id || product.id)?.toString())}
//               inWishlist={wishlistIds.includes((product._id || product.id)?.toString())}
//               onAddToCart={() => addToCart((product._id || product.id)?.toString())}
//               onToggleWish={() => toggleWishlist((product._id || product.id)?.toString())}
//             />
//           ))}
//         </div>
//       )}

//       {/* Infinite scroll loader */}
//       {useInfinite && (
//         <div ref={loaderRef} style={{ textAlign: "center", padding: "2rem", color: T.muted }}>
//           {infiniteItems < filtered.length
//             ? <div style={{ fontSize: 13 }}>Loading more products...</div>
//             : filtered.length > 0 && <div style={{ fontSize: 13 }}>✅ All products loaded</div>
//           }
//         </div>
//       )}

//       {/* ── Pagination ── */}
//       {!useInfinite && totalPages > 1 && (
//         <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "2rem", flexWrap: "wrap" }}>
//           {/* Prev */}
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             style={{
//               padding: "8px 16px", borderRadius: 10,
//               border: `1px solid ${T.border}`, background: T.surface,
//               color: page === 1 ? T.muted : T.text,
//               fontSize: 13, fontFamily: "inherit", cursor: page === 1 ? "not-allowed" : "pointer",
//               opacity: page === 1 ? 0.4 : 1,
//             }}
//           >← Prev</button>

//           {/* Page numbers */}
//           {Array.from({ length: totalPages }, (_, i) => i + 1)
//             .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
//             .reduce((acc, p, i, arr) => {
//               if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
//               acc.push(p);
//               return acc;
//             }, [])
//             .map((p, i) => p === "..." ? (
//               <span key={`dot-${i}`} style={{ padding: "8px 4px", color: T.muted, fontSize: 13 }}>...</span>
//             ) : (
//               <button
//                 key={p}
//                 onClick={() => setPage(p)}
//                 style={{
//                   padding: "8px 14px", borderRadius: 10,
//                   border: `1px solid ${page === p ? T.accentBorder : T.border}`,
//                   background: page === p ? T.accent : T.surface,
//                   color: page === p ? "#fff" : T.text,
//                   fontSize: 13, fontFamily: "inherit", cursor: "pointer",
//                   fontWeight: page === p ? 800 : 400,
//                   transition: "all 0.15s",
//                 }}
//               >{p}</button>
//             ))
//           }

//           {/* Next */}
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             style={{
//               padding: "8px 16px", borderRadius: 10,
//               border: `1px solid ${T.border}`, background: T.surface,
//               color: page === totalPages ? T.muted : T.text,
//               fontSize: 13, fontFamily: "inherit", cursor: page === totalPages ? "not-allowed" : "pointer",
//               opacity: page === totalPages ? 0.4 : 1,
//             }}
//           >Next →</button>
//         </div>
//       )}
//       {/* Trending section */}
//       {filtered.length > 0 && search === "" && category === "All" && (
//         <>
//           <TrendingSection />
//           <TopRatedSection />
//           <RecentlyViewedSection />
//         </>
//       )}
//     </div>
//   );
// }

function ShopSection({ onNavigate }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { addToCart } = useCartActions();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
 
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [sortBy,   setSortBy]   = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const categories = useMemo(() => [...new Set(
    (state.products || []).filter(product => product && typeof product === "object").map(product => product.category).filter(Boolean)
  )].sort(), [state.products]);
  const categoryIcons = { Electronics: "📱", Fashion: "👕", Sports: "⚽", Books: "📚", Home: "🏠", Beauty: "✨" };
 
  const cartIds = useMemo(() => new Set(state.cart.map(c => (c.id || c._id)?.toString())), [state.cart]);
 
  // Active ads sorted by priority
  const activeAds = useMemo(() =>
    [...(state.ads || [])].filter(a => a.active).sort((a, b) => (a.priority || 5) - (b.priority || 5)),
    [state.ads]
  );
 
  const topAds    = activeAds.filter(a => a.position === "top");
  const middleAds = activeAds.filter(a => a.position === "middle");
  const bottomAds = activeAds.filter(a => a.position === "bottom");
 
  const filtered = useMemo(() => {
    let prods = (state.products || []).filter(product => product && typeof product === "object");
    // Ads can pin products to "first priority" via their link (category)
    const priorityCats = new Set(activeAds.filter(a => a.link).map(a => a.link));
 
    if (search) {
      const query = search.trim().toLowerCase();
      prods = prods.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    if (category) prods = prods.filter(p => p.category === category);
    const priceRangeError = priceMin !== "" && priceMax !== "" && Number(priceMin) > Number(priceMax);
    if (priceRangeError) return [];
    if (priceMin !== "") prods = prods.filter(p => p.price >= Number(priceMin));
    if (priceMax !== "") prods = prods.filter(p => p.price <= Number(priceMax));
    if (minRating > 0) prods = prods.filter(p => (p.rating || 0) >= minRating);
    if (inStockOnly) prods = prods.filter(p => p.stock > 0);
    if (sortBy === "low")  prods.sort((a, b) => a.price - b.price);
    if (sortBy === "high") prods.sort((a, b) => b.price - a.price);
    if (sortBy === "name") prods.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "pop")  prods.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    if (sortBy === "rating") prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
 
    // If no manual sort, promoted category products float to top
    if (!sortBy && !category && !search && priorityCats.size > 0) {
      prods.sort((a, b) => {
        const aP = priorityCats.has(a.category) ? 0 : 1;
        const bP = priorityCats.has(b.category) ? 0 : 1;
        return aP - bP;
      });
    }
 
    return prods;
  }, [state.products, search, category, sortBy, priceMin, priceMax, minRating, inStockOnly, activeAds]);

  const activeFilterCount = [
    category,
    priceMin !== "",
    priceMax !== "",
    minRating > 0,
    inStockOnly,
  ].filter(Boolean).length;
  const hasActiveControls = Boolean(search || category || sortBy || priceMin || priceMax || minRating || inStockOnly);
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSortBy("");
    setPriceMin("");
    setPriceMax("");
    setMinRating(0);
    setInStockOnly(false);
  };
 
  const handleAddToCart = (id) => {
    const productId = id?.toString();
    const p = state.products.find(x => (x._id || x.id)?.toString() === productId);
    if (!p) {
      toast("This product is no longer available. Please refresh the shop.", "error");
      return;
    }
    addToCart(productId);
  };
 
  const handleWish = (id) => {
    const inList = state.wishlist.includes(id);
    dispatch({ type: "TOGGLE_WISHLIST", payload: id });
    toast(inList ? "Removed from wishlist" : "❤️ Added to wishlist!", "info");
  };
 
  // Jump to category from ad click
  const handleAdCategory = (cat) => {
    setCategory(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  // Split products for middle ad injection
  const midPoint = Math.ceil(filtered.length / 2);
 
  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(1rem, 3vw, 2.5rem)", color: T.text }}>
      <style>{`
        .shop-hero-layout { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr); gap:24px; align-items:center; }
        .shop-category-list { display:flex; gap:10px; overflow-x:auto; padding:2px 1px 8px; scrollbar-width:thin; }
        .shop-category-list button { flex:0 0 auto; }
        .shop-product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; }
        @media (max-width:700px) {
          .shop-hero-layout { grid-template-columns:1fr; }
          .shop-hero-art { display:none !important; }
          .shop-filter-row { align-items:stretch !important; }
          .shop-filter-row select { flex:1 1 100% !important; }
          .shop-product-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        }
        @media (max-width:390px) { .shop-product-grid { grid-template-columns:1fr; } }
      `}</style>
 
      {/* ── TOP ADS ── */}
      {topAds.map(ad => <AdBanner key={ad._id || ad.id} ad={ad} onCategoryFilter={handleAdCategory} />)}
 
      <section className="shop-hero-layout" style={{
        position: "relative", overflow: "hidden", marginBottom: 28, padding: "clamp(22px, 4vw, 42px)",
        borderRadius: 24, border: `1px solid ${T.border}`,
        background: `linear-gradient(120deg, ${T.surface}, ${T.accentBg})`,
        boxShadow: "0 18px 50px rgba(20, 18, 50, 0.08)",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, color: T.accent, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
            <span aria-hidden="true">✦</span> The BharatCart collection
          </div>
          <h1 style={{ maxWidth: 650, margin: "16px 0 10px", color: T.text, fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.08, letterSpacing: "-.045em", fontWeight: 900 }}>
            Find something<br /><span style={{ color: T.accent }}>you’ll love.</span>
          </h1>
          <p style={{ maxWidth: 510, margin: "0 0 22px", color: T.muted, fontSize: 15, lineHeight: 1.65 }}>
            Explore the latest picks across the categories you care about. Search, compare, and discover your next favorite.
          </p>
          <button type="button" onClick={() => document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{
            ...s.btn("primary"), padding: "11px 18px", borderRadius: 10, fontWeight: 800,
          }}>Explore products <span aria-hidden="true">↓</span></button>
        </div>
        <div className="shop-hero-art" aria-hidden="true" style={{
          minHeight: 205, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 20, background: `radial-gradient(circle at 50% 45%, ${T.surface} 0, transparent 68%)`,
        }}>
          <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`, opacity: .13 }} />
          <span style={{ position: "relative", fontSize: 112, filter: "drop-shadow(0 18px 18px rgba(30,20,80,.16))" }}>🛍️</span>
          <span style={{ position: "absolute", top: 20, right: "16%", fontSize: 34 }}>✨</span>
          <span style={{ position: "absolute", bottom: 20, left: "17%", fontSize: 30 }}>💜</span>
        </div>
      </section>

      <section aria-label="Shop by category" style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 850, letterSpacing: "-.02em" }}>Shop by category</h2>
            <p style={{ margin: "4px 0 0", color: T.muted, fontSize: 12 }}>A quick way to find what you’re looking for</p>
          </div>
          {category && <button type="button" onClick={() => setCategory("")} style={{ border: 0, background: "transparent", color: T.accent, font: "inherit", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>View all</button>}
        </div>
        <div className="shop-category-list">
          <button type="button" onClick={() => setCategory("")} aria-pressed={!category} style={{
            ...s.btn(!category ? "primary" : "ghost"), minHeight: 44, padding: "9px 16px", borderRadius: 12, whiteSpace: "nowrap",
          }}>✦ All products</button>
          {categories.map(cat => (
            <button key={cat} type="button" onClick={() => setCategory(category === cat ? "" : cat)} aria-pressed={category === cat} style={{
              ...s.btn(category === cat ? "primary" : "ghost"), minHeight: 44, padding: "9px 16px", borderRadius: 12, whiteSpace: "nowrap",
            }}>{categoryIcons[cat] || "◈"}&nbsp; {cat}</button>
          ))}
        </div>
      </section>
 
      {/* ── Filters ── */}
      <div id="shop-products" style={{ scrollMarginTop: 90 }} />
      <div className="shop-filter-row" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center", padding: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14 }}>
        <Input
          aria-label="Search products"
          placeholder="Search products, brands or categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: "1 1 280px", minWidth: 180, minHeight: 42 }}
        />
        <Select aria-label="Sort products" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ flex: "0 0 200px", minHeight: 42 }}>
          <option value="">Sort: Recommended</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="name">Name A–Z</option>
          <option value="pop">Most popular</option>
          <option value="rating">Top rated</option>
        </Select>
        <button
          type="button"
          aria-expanded={showFilters}
          aria-controls="catalog-filters"
          onClick={() => setShowFilters(open => !open)}
          style={{ ...s.btn(activeFilterCount ? "primary" : "ghost"), minHeight: 42, padding: "8px 14px" }}
        >
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        {hasActiveControls && (
          <button
            onClick={clearFilters}
            style={{ ...s.btn("ghost"), minHeight: 42, padding: "8px 14px", fontSize: 12, color: T.danger }}
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div id="catalog-filters">
          <CatalogFilterPanel
            T={T}
            priceMin={priceMin} setPriceMin={setPriceMin}
            priceMax={priceMax} setPriceMax={setPriceMax}
            minRating={minRating} setMinRating={setMinRating}
            inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 850, letterSpacing: "-.025em" }}>
            {category || (search ? "Search results" : "Explore products")}
          </h2>
          <p style={{ margin: "4px 0 0", color: T.muted, fontSize: 12 }}>
            {filtered.length} {filtered.length === 1 ? "item" : "items"}{search ? ` matching “${search}”` : ""}
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.muted, fontSize: 12, whiteSpace: "nowrap" }}>
          <span style={{ color: T.success }}>●</span> {filtered.length ? "Ready to explore" : "No matches yet"}
        </span>
      </div>
 
      {/* ── Product grid with middle ad injection ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "clamp(2rem, 6vw, 4rem) 1.5rem", background: T.surface, border: `1px dashed ${T.border}`, borderRadius: 18 }}>
          <div style={{ width: 68, height: 68, margin: "0 auto 14px", display: "grid", placeItems: "center", borderRadius: 20, background: T.accentBg, fontSize: 30 }}>⌕</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 18, color: T.text }}>No products found</h3>
          <p style={{ margin: "0 0 16px", color: T.muted, fontSize: 13 }}>Try a different search or clear your filters to see everything.</p>
          <button type="button" onClick={() => { setSearch(""); setCategory(""); setSortBy(""); }} style={{ ...s.btn("primary"), padding: "9px 16px" }}>Show all products</button>
        </div>
      ) : (
        <>
          {/* First half */}
          <div className="shop-product-grid" style={{ marginBottom: "1.25rem" }}>
            {filtered.slice(0, midPoint).map(p => (
              <ProductCard
                key={p._id || p.id} product={p}
                inCart={cartIds.has((p._id || p.id)?.toString())}
                inWishlist={state.wishlist.includes((p._id || p.id)?.toString())}
                onAddToCart={handleAddToCart}
                onToggleWish={handleWish}
              />
            ))}
          </div>
 
          {/* ── MIDDLE ADS ── */}
          {middleAds.length > 0 && filtered.length > 4 && (
            <div style={{ margin: "1.5rem 0" }}>
              {middleAds.map(ad => <AdBanner key={ad._id || ad.id} ad={ad} onCategoryFilter={handleAdCategory} />)}
            </div>
          )}
 
          {/* Second half */}
          {filtered.length > midPoint && (
            <div className="shop-product-grid">
              {filtered.slice(midPoint).map(p => (
                <ProductCard
                  key={p._id || p.id} product={p}
                  inCart={cartIds.has((p._id || p.id)?.toString())}
                  inWishlist={state.wishlist.includes((p._id || p.id)?.toString())}
                  onAddToCart={handleAddToCart}
                  onToggleWish={handleWish}
                />
              ))}
            </div>
          )}
        </>
      )}
 
      {/* ── BOTTOM ADS ── */}
      {bottomAds.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {bottomAds.map(ad => <AdBanner key={ad._id || ad.id} ad={ad} onCategoryFilter={handleAdCategory} />)}
        </div>
      )}
    </div>
  );
}
const RETURN_REASONS = [
  "Defective / Damaged product",
  "Wrong item delivered",
  "Product not as described",
  "Size / fit issue",
  "Changed my mind",
  "Better price available",
  "Other",
];


function InvoiceButton({ orderId }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await invoice.download(orderId);
      toast("Invoice downloaded!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download Invoice PDF"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${T.accent}`,
        background: T.accent,
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "all 0.2s",
      }}
    >
      {loading ? "⏳" : "📄"} {loading ? "Generating..." : "Download Invoice"}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Replace your ENTIRE OrdersSection function in App.jsx with this
// ═══════════════════════════════════════════════════════════════

function OrdersSection({ onNavigate }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [returnModal, setReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myReturns, setMyReturns] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");

  // Review states
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    returns_api.my().then(setMyReturns).catch(() => { });
  }, []);

  const RETURN_REASONS = [
    "Defective / Damaged product",
    "Wrong item delivered",
    "Product not as described",
    "Size / fit issue",
    "Changed my mind",
    "Better price available",
    "Other",
  ];

  const statusColor = {
    Processing: "info", Shipped: "warning",
    "Out for Delivery": "warning", Delivered: "success", Cancelled: "danger",
  };

  const returnStatusColor = {
    Pending: "warning", Approved: "success", Rejected: "danger", Refunded: "success",
  };

  const openReturnModal = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setReason(""); setDescription("");
    setReturnModal(true);
  };

  const submitReturn = async () => {
    if (!reason) { toast("Please select a reason", "error"); return; }
    setSubmitting(true);
    try {
      await returns_api.request({
        orderId: selectedOrder._id,
        productId: selectedItem.product || selectedItem._id,
        productName: selectedItem.name,
        productEmoji: selectedItem.emoji,
        productPrice: selectedItem.price,
        qty: selectedItem.qty,
        reason,
        description,
      });
      toast("Return request submitted!", "success");
      setReturnModal(false);
      const updated = await returns_api.my();
      setMyReturns(updated);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = [
    { status: "Processing", icon: "📋", label: "Order Confirmed" },
    { status: "Shipped", icon: "🚚", label: "Shipped" },
    { status: "Out for Delivery", icon: "🛵", label: "Out for Delivery" },
    { status: "Delivered", icon: "✅", label: "Delivered" },
  ];

  return (
    <div style={{ padding: "2rem" }}>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: T.surface2, borderRadius: 12, padding: 4, marginBottom: "1.5rem", width: "fit-content" }}>
        {[["orders", "📦 My Orders"], ["returns", "↩️ My Returns"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            background: activeTab === id ? T.accent : "transparent",
            color: activeTab === id ? "#fff" : T.muted,
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <>
          {state.orders.length === 0
            ? <EmptyState emoji="📭" title="No orders yet" subtitle="Browse our shop and place your first order!"
              action={<Btn onClick={() => onNavigate("shop")}>Shop Now →</Btn>} />
            : state.orders.map(order => (
              <div key={order._id} style={{ ...s.card, padding: "1.25rem", marginBottom: 14 }}>
                {/* Order header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                      Order #{(order._id)?.toString().slice(-8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 11, color: T.muted }}>
                      📅 {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      {order.paymentMethod && ` · 💳 ${order.paymentMethod.toUpperCase()}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Badge color={statusColor[order.status] || "default"}>{order.status}</Badge>
                    <span style={{ fontSize: 16, fontWeight: 900, color: T.accent }}>{fmt.currency(order.total)}</span>
                    {order.status === "Delivered" && (
                      <InvoiceButton orderId={order._id} />
                    )}
                  </div>
                </div>

                {/* Order items */}
                {order.items?.map((item, i) => {
                  const alreadyReturned = myReturns.some(
                    r => r.order === order._id && r.product?.name === item.name
                  );
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: T.surface2, borderRadius: 10, padding: "10px 14px", marginBottom: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{item.emoji}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{item.name}</p>
                          <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Qty: {item.qty} · {fmt.currency(item.price * item.qty)}</p>
                        </div>
                      </div>
                      {order.status === "Delivered" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          {/* Review button */}
                          <button
                            onClick={() => {
                              setReviewProduct({ ...item, productId: item.product, orderId: order._id });
                              setReviewRating(0); setReviewTitle(""); setReviewBody("");
                              setReviewModal(true);
                            }}style={{ ...s.btn("ghost"), fontSize: 11,padding: "8px 14px", color: T.accent, border: `1px solid ${T.accent}` , hover: { background: T.accent } }}
                          >⭐ Review</button>
                          {/* Return button */}
                          {alreadyReturned
                            ? <Badge color="info">↩ Returned</Badge>
                            : <button
                              onClick={() => openReturnModal(order, item)}
                              style={{ ...s.btn("ghost"), fontSize: 11, padding: "8px 14px", color: T.danger, border: `1px solid ${T.danger}` }}
                            >↩ Return</button>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Address */}
                {order.address && (
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
                    📍 {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                )}

                {/* Track Order button */}
                {order.status !== "Cancelled" && (
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    style={{
                      marginTop: 12, padding: "6px 16px",
                      borderRadius: 8, border: `1px solid ${T.border}`,
                      background: "transparent", color: T.accent,
                      fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {expandedOrder === order._id ? "▲ Hide Tracking" : "📍 Track Order"}
                  </button>
                )}

                {/* Timeline */}
                {expandedOrder === order._id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 16 }}>📦 Order Timeline</p>

                    {order.shipment?.trackingNumber && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18, padding: "12px 14px", borderRadius: 12, background: T.accentBg, border: `1px solid ${T.accentBorder}` }}>
                        <span style={{ fontSize: 22 }} aria-hidden="true">🚚</span>
                        <div style={{ flex: "1 1 180px" }}>
                          <p style={{ margin: 0, color: T.text, fontWeight: 750, fontSize: 12 }}>{order.shipment.provider}</p>
                          <p style={{ margin: "3px 0 0", color: T.muted, fontSize: 11 }}>
                            Demo tracking number: <strong style={{ color: T.accent }}>{order.shipment.trackingNumber}</strong>
                          </p>
                        </div>
                        {order.shipment.estimatedDelivery && (
                          <div style={{ fontSize: 11, color: T.muted }}>
                            Estimated delivery<br />
                            <strong style={{ color: T.text }}>{new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ position: "relative" }}>
                      {/* Vertical connector line */}
                      <div style={{
                        position: "absolute", left: 18, top: 20, bottom: 20,
                        width: 2, background: T.border, zIndex: 0,
                      }} />

                      {STEPS.map((step, idx) => {
                        const currentIdx = STEPS.findIndex(s => s.status === order.status);
                        const done = idx <= currentIdx;
                        const current = idx === currentIdx;
                        const entry = (order.timeline || []).find(t => t.status === step.status);

                        return (
                          <div key={step.status} style={{
                            display: "flex", gap: 14,
                            marginBottom: idx < STEPS.length - 1 ? 20 : 0,
                            position: "relative", zIndex: 1,
                          }}>
                            {/* Step circle */}
                            <div style={{
                              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 16,
                              background: done
                                ? current ? T.accent : T.success
                                : T.surface2,
                              border: `2px solid ${done ? (current ? T.accent : T.success) : T.border}`,
                              boxShadow: current ? `0 0 0 4px ${T.accentBg}` : "none",
                              color: done ? "#fff" : T.muted,
                              transition: "all 0.3s",
                            }}>
                              {done && !current ? "✓" : step.icon}
                            </div>

                            {/* Step info */}
                            <div style={{ paddingTop: 6 }}>
                              <p style={{
                                fontSize: 13, fontWeight: done ? 700 : 500,
                                color: done ? T.text : T.muted, margin: 0,
                              }}>
                                {step.label}
                                {current && (
                                  <span style={{
                                    marginLeft: 8, fontSize: 10, fontWeight: 700,
                                    color: T.accent, background: T.accentBg,
                                    padding: "2px 8px", borderRadius: 10,
                                  }}>CURRENT</span>
                                )}
                              </p>
                              {entry?.message && (
                                <p style={{ fontSize: 11, color: T.muted, margin: "3px 0 0" }}>{entry.message}</p>
                              )}
                              {entry?.timestamp && (
                                <p style={{ fontSize: 10, color: T.muted, margin: "2px 0 0" }}>
                                  🕐 {new Date(entry.timestamp).toLocaleString("en-IN", {
                                    day: "2-digit", month: "short",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                              )}
                              {!done && (
                                <p style={{ fontSize: 11, color: T.muted, margin: "3px 0 0" }}>Pending</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          }
        </>
      )}

      {/* ── RETURNS TAB ── */}
      {activeTab === "returns" && (
        <>
          {myReturns.length === 0
            ? <EmptyState emoji="↩️" title="No return requests" subtitle="You haven't requested any returns yet." />
            : myReturns.map(r => (
              <div key={r._id} style={{ ...s.card, padding: "1.25rem", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                      {r.product?.emoji} {r.product?.name}
                    </p>
                    <p style={{ fontSize: 11, color: T.muted }}>Qty: {r.product?.qty} · Refund: {fmt.currency(r.refundAmount)}</p>
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Reason: {r.reason}</p>
                    <p style={{ fontSize: 11, color: T.muted }}>📅 {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Badge color={returnStatusColor[r.status] || "default"}>{r.status}</Badge>
                </div>
                {r.adminNote && (
                  <div style={{ background: T.surface2, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: T.muted }}>
                    <strong>Admin note:</strong> {r.adminNote}
                  </div>
                )}
              </div>
            ))
          }
        </>
      )}

      {/* ── RETURN MODAL ── */}
      <Modal open={returnModal} onClose={() => setReturnModal(false)} title="↩️ Request Return"
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setReturnModal(false)}>Cancel</Btn>,
          <Btn key="submit" onClick={submitReturn} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Return Request"}
          </Btn>,
        ]}>
        {selectedItem && (
          <div>
            <div style={{ background: T.surface2, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}>{selectedItem.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{selectedItem.name}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Qty: {selectedItem.qty} · {fmt.currency(selectedItem.price * selectedItem.qty)}</p>
              </div>
            </div>
            <FormField label="Reason for Return *">
              <Select value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">Select a reason…</option>
                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </FormField>
            <FormField label="Additional Details (optional)">
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in more detail…" rows={3}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </FormField>
            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.muted }}>
              💡 Refund of <strong style={{ color: T.accent }}>{fmt.currency(selectedItem?.price * selectedItem?.qty || 0)}</strong> will be processed after admin approval within 3–5 business days.
            </div>
          </div>
        )}
      </Modal>

      {/* ── REVIEW MODAL ── */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title={`⭐ Review — ${reviewProduct?.name || ""}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setReviewModal(false)}>Cancel</Btn>,
          <Btn key="submit" disabled={reviewSubmitting || !reviewRating}
            onClick={async () => {
              if (!reviewRating) { toast("Please select a star rating.", "error"); return; }
              setReviewSubmitting(true);
              try {
                await reviews.submit({
                  productId: reviewProduct.productId?.toString() || reviewProduct.product?.toString(),
                  orderId: reviewProduct.orderId?.toString(),
                  rating: reviewRating,
                  title: reviewTitle,
                  body: reviewBody,
                });
                toast("Review submitted! Thank you. ⭐", "success");
                setReviewModal(false);
              } catch (err) {
                toast(err.message, "error");
              } finally {
                setReviewSubmitting(false);
              }
            }}>
            {reviewSubmitting ? "Submitting..." : "Submit Review ⭐"}
          </Btn>,
        ]}>
        {reviewProduct && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{reviewProduct.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{reviewProduct.name}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>Qty: {reviewProduct.qty} · {fmt.currency(reviewProduct.price)}</p>
              </div>
            </div>
            <FormField label="Your Rating *">
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} onClick={() => setReviewRating(star)} style={{
                    background: T.surface2, padding: "6px 12px", borderRadius: 8,
                    fontSize: 36, cursor: "pointer",
                    color: star <= reviewRating ? "#f59e0b" : T.border,
                    transition: "all 0.15s",
                    transform: star <= reviewRating ? "scale(1.2)" : "scale(1)",
                    display: "inline-block",
                  }}>★</span>
                ))}
              </div>
              {reviewRating > 0 && (
                <p style={{ fontSize: 14, color: T.muted, marginTop: 12 }}>
                  {["", "😞 Poor", "😐 Fair", "😊 Good", "😃 Very Good", "🤩 Excellent!"][reviewRating]}
                </p>
              )}
            </FormField>
            <FormField label="Review Title">
              <Input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Summarize your experience..." />
            </FormField>
            <FormField label="Your Review">
              <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)}
                placeholder="Share your experience with this product..." rows={4}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </FormField>
            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.muted }}>
              💡 Only verified buyers can review. Your review helps other customers.
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  WISHLIST SECTIONs
// ═══════════════════════════════════════════════════════════
function WishlistSection() {
  const { state } = useApp();
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();
  const T = getT(state.theme);
  const cartIds = useMemo(() => new Set(state.cart.map(c => (c.id || c._id)?.toString())), [state.cart]);

  const wishItems = state.products.filter(p => state.wishlist.includes((p._id || p.id)?.toString()));

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: T.text }}>❤️ Wishlist</h2>
      {wishItems.length === 0
        ? <EmptyState emoji="🤍" title="Wishlist is empty" subtitle="Add products you love to your wishlist!" />
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {wishItems.map(p => (
            <ProductCard
              key={p._id || p.id}
              product={{ ...p, id: p._id || p.id }}
              inCart={cartIds.has((p._id || p.id)?.toString())}
              inWishlist={true}
              onAddToCart={() => addToCart((p._id || p.id).toString())}
              onToggleWish={() => toggleWishlist((p._id || p.id).toString())}
            />
          ))}
        </div>
      }
    </div>
  );
}

function SavedAddressPicker({ onSelect }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    addresses.list().then(setList).catch(() => { });
  }, []);

  if (list.length === 0) return null;

  const labelIcon = { Home: "🏠", Work: "💼", Other: "📍" };

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", padding: "10px 14px", borderRadius: 10,
        border: `1px solid ${T.accentBorder}`, background: T.accentBg,
        color: T.accent, fontSize: 13, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span>📍 Use a Saved Address</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, marginTop: 8, overflow: "hidden" }}>
          {list.map((addr, i) => (
            <div
              key={addr._id}
              onClick={() => { onSelect(addr); setExpanded(false); }}
              style={{
                padding: "12px 14px", cursor: "pointer",
                borderBottom: i < list.length - 1 ? `1px solid ${T.border}` : "none",
                background: T.surface, transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.surface2}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span>{labelIcon[addr.label] || "📍"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{addr.label}</span>
                {addr.isDefault && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: T.accentBg, padding: "1px 6px", borderRadius: 8 }}>DEFAULT</span>
                )}
              </div>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                {addr.name} · {addr.line1}, {addr.city} - {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


 function CheckoutSection({ onNavigate }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
    const total = useCartTotal(state.cart)
  const T     = getT(state.theme);
  const s     = baseStyles(state.theme);

  // Step: 1=summary, 2=address, 3=payment, 4=success
const [step, setStep] = useState(1); // 1=address, 2=payment, 3=processing, 4=success
  const [address, setAddress] = useState({ name: state.currentUser?.name || "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [walletBalance, setWalletBalance] = useState(0);


  const subtotal   = state.cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - discount);

   useEffect(() => {
    addresses.list().then(list => {
      const def = list.find(a => a.isDefault) || list[0];
      if (def) {
        setAddress({
          name: def.name,
          phone: def.phone,
          line1: def.line1,
          city: def.city,
          state: def.state,
          pincode: def.pincode,
        });
      }
    }).catch(() => { });
  }, []);

  // Load Razorpay script on mount
  useEffect(() => {
    const existing = document.getElementById("razorpay-script");
    if (!existing) {
      const script    = document.createElement("script");
      script.id       = "razorpay-script";
      script.src      = "https://checkout.razorpay.com/v1/checkout.js";
      script.async    = true;
      document.body.appendChild(script);
    }
  }, []);

  // Load wallet balance
  useEffect(() => {
    walletApi.get()
      .then(d => setWalletBalance(d.balance || 0))
      .catch(() => {});
  }, []);

  const setAddr = (field) => (e) => {
    const value = ["phone", "pincode"].includes(field)
      ? e.target.value.replace(/\D/g, "").slice(0, field === "phone" ? 10 : 6)
      : e.target.value;
    setAddress(p => ({ ...p, [field]: value }));
  };

  // ── Validate address ─────────────────────────────────────────
  const validateAddress = () => {
    if (!address.name.trim())       { toast("Full name is required.",         "error"); return false; }
    if (address.phone.length !== 10){ toast("Phone must be 10 digits.",        "error"); return false; }
    if (!address.line1.trim())      { toast("Address is required.",            "error"); return false; }
    if (!address.city.trim())       { toast("City is required.",               "error"); return false; }
    if (!address.state.trim())      { toast("State is required.",              "error"); return false; }
    if (address.pincode.length !== 6){ toast("Pincode must be 6 digits.",      "error"); return false; }
    return true;
  };

  // ── Apply coupon ─────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast("Enter a coupon code.", "error"); return; }
    try {
      const res = await couponsApi.validate(couponCode.trim().toUpperCase(), subtotal);
      // backend now returns { discount }
      const d = res.discount ?? res.discountAmount ?? 0;
      setDiscount(d);
      setCouponMsg(`✅ ${couponCode.toUpperCase()} applied — You save ₹${d}!`);
      toast(`Coupon applied! Save ₹${d}`, "success");
    } catch (err) {
      setDiscount(0);
      setCouponMsg(`❌ ${err.message}`);
      toast(err.message, "error");
    }
  };


  // ── RAZORPAY PAYMENT ──────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast("Payment gateway loading... Please wait 3 seconds and try again.", "error");
      return;
    }

    setLoading(true);

    try {
      // Re-validate coupon before creating backend order to avoid server 400
      if (couponCode.trim()) {
        try {
          const chk = await couponsApi.validate(couponCode.trim().toUpperCase(), subtotal);
          setDiscount(chk.discount ?? chk.discountAmount ?? 0);
        } catch (err) {
          setDiscount(0);
          setCouponMsg(`❌ ${err.message}`);
          toast(`Coupon invalid: ${err.message}`, "error");
          setLoading(false);
          return;
        }
      }

      // Step 1: Create Razorpay order on backend
      const orderData = await paymentsApi.createOrder({
        address,
        couponCode: couponCode.trim().toUpperCase() || "",
        items: state.cart.map(i => ({ product: i._id || i.id, qty: i.qty }))
      });

      // Step 2: Open Razorpay checkout popup
      const options = {
        key:          orderData.keyId,
        amount:       orderData.amount,       // in paise
        currency:     "INR",
        name:         "BharatCart",
        description:  `Order of ${orderData.items.length} item(s)`,
        // image:        "/icons/icon-192.png",
        image:        "https://img.icons8.com/emoji/96/shopping-bags.png",
        order_id:     orderData.razorpayOrderId,

        // Prefill customer details
        prefill: {
          name:    orderData.userName,
          email:   orderData.userEmail,
          contact: orderData.userPhone || address.phone,
        },

        // Restrict to Indian methods
        // config: {
        //   display: {
        //     blocks: {
        //       banks: { name: "Pay via UPI or Card", instruments: [
        //         { method: "upi"  },
        //         { method: "card" },
        //         { method: "netbanking" },
        //         { method: "wallet" },
        //       ]},
        //     },
        //     sequence: ["block.banks"],
        //     preferences: { show_default_blocks: true },
        //   },
        // },

        theme:   { color: "#c9a84c" },

        modal: {
          confirm_close: true,
          ondismiss: () => {
            setLoading(false);
            toast("Payment cancelled.", "info");
          },
        },

        // Step 3: On successful payment — verify on backend
        handler: async (response) => {
          try {
            toast("Verifying payment...", "info");

            const result = await paymentsApi.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              address,
              items:          orderData.items,
              subtotal:       orderData.subtotal,
              discount:       orderData.discount,
              total:          orderData.total,
              couponCode:     orderData.couponCode,
            });

            // Update app state
            dispatch({ type: "SET_CART",  payload: [] });
            dispatch({ type: "ADD_ORDER", payload: result.order });

            setPlacedOrder(result.order);
            setStep(4);
            toast("🎉 Payment successful! Order confirmed.", "success");
          } catch (err) {
            toast(`Order creation failed: ${err.message}. Contact support with Payment ID: ${response.razorpay_payment_id}`, "error");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on("payment.failed", (response) => {
        setLoading(false);
        toast(`Payment failed: ${response.error.description}`, "error");
        console.error("Razorpay payment failed:", response.error);
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      toast(err.message, "error");
    }
  };

  // ── COD PAYMENT ───────────────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    try {
      // Re-validate coupon before placing order
      if (couponCode.trim()) {
        try {
          const chk = await couponsApi.validate(couponCode.trim().toUpperCase(), subtotal);
          setDiscount(chk.discount ?? chk.discountAmount ?? 0);
        } catch (err) {
          setDiscount(0);
          setCouponMsg(`❌ ${err.message}`);
          toast(`Coupon invalid: ${err.message}`, "error");
          setLoading(false);
          return;
        }
      }

      const result = await paymentsApi.cod({
        address,
        couponCode: couponCode.trim().toUpperCase() || "",
        items: state.cart.map(i => ({ product: i._id || i.id, qty: i.qty }))
      });

      dispatch({ type: "SET_CART",  payload: [] });
      dispatch({ type: "ADD_ORDER", payload: result.order });

      setPlacedOrder(result.order);
      setStep(4);
      toast("🎉 Order placed! Pay on delivery.", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── WALLET PAYMENT ────────────────────────────────────────
  const handleWalletPayment = async () => {
    if (walletBalance < finalTotal) {
      toast(`Insufficient wallet balance. Available: ₹${walletBalance}, Required: ₹${finalTotal}`, "error");
      return;
    }

    setLoading(true);
    try {
      // Re-validate coupon before charging wallet
      if (couponCode.trim()) {
        try {
          const chk = await couponsApi.validate(couponCode.trim().toUpperCase(), subtotal);
          setDiscount(chk.discount ?? chk.discountAmount ?? 0);
        } catch (err) {
          setDiscount(0);
          setCouponMsg(`❌ ${err.message}`);
          toast(`Coupon invalid: ${err.message}`, "error");
          setLoading(false);
          return;
        }
      }

      const result = await paymentsApi.wallet({
        address,
        couponCode: couponCode.trim().toUpperCase() || "",
        amount: finalTotal,
        items: state.cart.map(i => ({ product: i._id || i.id, qty: i.qty })),
      });

      dispatch({ type: "SET_CART",  payload: [] });
      dispatch({ type: "ADD_ORDER", payload: result.order });
      setWalletBalance(result.newBalance || 0);

      setPlacedOrder(result.order);
      setStep(4);
      toast("🎉 Order placed! Paid from wallet.", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") handleCOD();
    else if (paymentMethod === "wallet") handleWalletPayment();
    else handleRazorpayPayment();
  };

  const stepLabels = ["Summary", "Address", "Payment", "Done"];

  // Empty cart guard
  if (state.cart.length === 0 && step !== 4) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>🛒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>Cart is empty</h2>
        <p style={{ color: T.muted, marginBottom: 20 }}>Add products to your cart first.</p>
        <Btn onClick={() => onNavigate("shop")}>Browse Products →</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem" }}>

      {/* Page title */}
      <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
        <span style={{
          background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Checkout</span>
      </h2>

      {/* Step progress bar */}
      <div style={{ display: "flex", marginBottom: "1.5rem", background: T.surface, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}` }}>
        {stepLabels.map((label, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", padding: "11px 8px",
            fontSize: 12, fontWeight: 600,
            background: i + 1 === step ? T.accentBg   : "transparent",
            color:      i + 1 < step   ? T.success    : i + 1 === step ? T.accent : T.muted,
            borderRight: i < stepLabels.length - 1 ? `1px solid ${T.border}` : "none",
            transition: "all 0.2s",
          }}>
            {i + 1 < step ? "✓ " : `${i + 1}. `}{label}
          </div>
        ))}
      </div>

      {/* ────────────── STEP 1: ORDER SUMMARY ────────────── */}
      {step === 1 && (
        <div>
          <div style={{ ...s.card, padding: "1.5rem", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: "1rem" }}>
               # Order Summary
            </h3>

            {state.cart.map(item => {
              const p = state.products?.find(x =>
                (x._id || x.id)?.toString() === (item.id || item.product)?.toString()
              );
              if (!p) return null;
              return (
                <div key={item.id || item.product} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid ${T.border}`, gap: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{p.emoji}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
                        Qty: {item.qty} × {fmt.currency(p.price)}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: T.accent }}>
                    {fmt.currency(p.price * item.qty)}
                  </span>
                </div>
              );
            })}

            {/* Coupon input */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                  style={{
                    flex: 1, padding: "9px 14px", borderRadius: 10,
                    border: `1px solid ${T.border}`, background: T.surface2,
                    color: T.text, fontSize: 13, fontFamily: "inherit",
                    outline: "none", letterSpacing: 2, fontWeight: 700,
                  }}
                />
                <button onClick={handleApplyCoupon} style={{
                  ...s.btn("ghost"), padding: "9px 18px", fontSize: 12, flexShrink: 0, background: T.accent, color: "#fff", fontWeight: 700,
                }}>Apply</button>
              </div>
              {couponMsg && (
                <p style={{ fontSize: 12, fontWeight: 600, color: discount > 0 ? T.success : T.danger }}>
                  {couponMsg}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.muted, marginBottom: 6 }}>
                <span>Subtotal ({state.cart.length} item{state.cart.length !== 1 ? "s" : ""})</span>
                <span style={{ fontWeight: 600 }}>{fmt.currency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.success, fontWeight: 600, marginBottom: 6 }}>
                  <span>Coupon ({couponCode})</span>
                  <span>-{fmt.currency(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.muted, marginBottom: 12 }}>
                <span>Delivery</span>
                <span style={{ color: subtotal > 999 ? T.success : T.text, fontWeight: 600 }}>
                  {subtotal > 999 ? "FREE 🎉" : fmt.currency(49)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20 }}>
                <span style={{ color: T.text }}>Total</span>
                <span style={{ color: T.accent }}>{fmt.currency(finalTotal)}</span>
              </div>
            </div>
          </div>

          <Btn style={{ width: "100%", padding: 14, fontSize: 14, justifyContent: "center" }}
            onClick={() => setStep(2)}>
            Continue → Delivery Address
          </Btn>
        </div>
      )}

      {/* ────────────── STEP 2: DELIVERY ADDRESS ────────────── */}
      {step === 2 && (
        <div>
          <div style={{ ...s.card, padding: "1.5rem", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: "1rem" }}>
              📍 Delivery Address
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Full Name *">
                <Input value={address.name} onChange={setAddr("name")} placeholder="John Doe" />
              </FormField>
              <FormField label="Phone Number *">
                <Input
                  type="tel" value={address.phone}
                  onChange={setAddr("phone")} placeholder="10 digit number" maxLength={10}
                />
                {address.phone.length > 0 && address.phone.length < 10 && (
                  <p style={{ color: T.danger, fontSize: 11, marginTop: 3 }}>
                    ⚠ {address.phone.length}/10 digits
                  </p>
                )}
              </FormField>
            </div>

            <FormField label="House No, Street, Area *">
              <Input value={address.line1} onChange={setAddr("line1")} placeholder="123, Main Street, Andheri West" />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <FormField label="City *">
                <Input value={address.city} onChange={setAddr("city")} placeholder="Mumbai" />
              </FormField>
              <FormField label="State *">
                <Input value={address.state} onChange={setAddr("state")} placeholder="Maharashtra" />
              </FormField>
              <FormField label="Pincode *">
                <Input
                  type="tel" value={address.pincode}
                  onChange={setAddr("pincode")} placeholder="400001" maxLength={6}
                />
                {address.pincode.length > 0 && address.pincode.length < 6 && (
                  <p style={{ color: T.danger, fontSize: 11, marginTop: 3 }}>
                    ⚠ {address.pincode.length}/6 digits
                  </p>
                )}
              </FormField>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(1)} style={{ padding: "13px 20px" }}>← Back</Btn>
            <Btn
              style={{ flex: 1, padding: 13, fontSize: 14, justifyContent: "center" }}
              onClick={() => { if (validateAddress()) setStep(3); }}
            >
              Continue → Payment
            </Btn>
          </div>
        </div>
      )}

      {/* ────────────── STEP 3: PAYMENT ────────────── */}
      {step === 3 && (
        <div>
          <div style={{ ...s.card, padding: "1.5rem", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: "1rem" }}>
              💳 Select Payment Method
            </h3>

            {/* Online payment via Razorpay */}
            <label style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px", borderRadius: 12, cursor: "pointer", marginBottom: 10,
              border: `2px solid ${paymentMethod === "razorpay" ? T.accent : T.border}`,
              background: paymentMethod === "razorpay" ? T.accentBg : T.surface2,
              transition: "all 0.2s",
            }}>
              <input type="radio" value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                style={{ accentColor: T.accent, width: 18, height: 18, flexShrink: 0 }}
              />
              <span style={{ fontSize: 26 }}>⚡</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                  Pay Online
                </p>
                <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
                  UPI (GPay, PhonePe, Paytm) · Debit/Credit Card · NetBanking · Wallet
                </p>
              </div>
              {/* Payment logos */}
              <div style={{ display: "flex", gap: 4 }}>
                {["📱", "💳", "🏦", "👛"].map((icon, i) => (
                  <div key={i} style={{
                    width: 30, height: 24, borderRadius: 6, background: T.surface,
                    border: `1px solid ${T.border}`, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{icon}</div>
                ))}
              </div>
            </label>

            {/* Wallet */}
            <label style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px", borderRadius: 12, cursor: "pointer", marginBottom: 10,
              border: `2px solid ${paymentMethod === "wallet" ? T.accent : walletBalance < finalTotal ? T.border : T.border}`,
              background: paymentMethod === "wallet" ? T.accentBg : walletBalance < finalTotal ? "rgba(224,92,92,0.05)" : T.surface2,
              opacity: walletBalance < finalTotal ? 0.6 : 1,
              transition: "all 0.2s",
            }}>
              <input type="radio" value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={() => setPaymentMethod("wallet")}
                disabled={walletBalance < finalTotal}
                style={{ accentColor: T.accent, width: 18, height: 18, flexShrink: 0 }}
              />
              <span style={{ fontSize: 26 }}>💰</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Pay from Wallet</p>
                <p style={{ fontSize: 12, color: walletBalance < finalTotal ? T.danger : T.success, margin: "2px 0 0" }}>
                  {walletBalance < finalTotal
                    ? `Insufficient balance (₹${walletBalance.toLocaleString("en-IN")})`
                    : `Available: ₹${walletBalance.toLocaleString("en-IN")}`
                  }
                </p>
              </div>
            </label>

            {/* COD */}
            <label style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px", borderRadius: 12, cursor: "pointer",
              border: `2px solid ${paymentMethod === "cod" ? T.accent : T.border}`,
              background: paymentMethod === "cod" ? T.accentBg : T.surface2,
              transition: "all 0.2s",
            }}>
              <input type="radio" value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                style={{ accentColor: T.accent, width: 18, height: 18, flexShrink: 0 }}
              />
              <span style={{ fontSize: 26 }}>💵</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Cash on Delivery</p>
                <p style={{ fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
                  Pay ₹{finalTotal.toLocaleString("en-IN")} when your order arrives
                </p>
              </div>
            </label>

            {/* Order total */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.success, fontWeight: 600, marginBottom: 4 }}>
                  <span>Coupon savings</span>
                  <span>-{fmt.currency(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20 }}>
                <span style={{ color: T.text }}>
                  {paymentMethod === "cod" ? "Pay on Delivery" : "Pay Now"}
                </span>
                <span style={{ color: T.accent }}>{fmt.currency(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Address summary */}
          <div style={{ ...s.card, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, fontWeight: 700, margin: 0 }}>
                Delivering to
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: "3px 0 1px" }}>
                {address.name} · 📱 {address.phone}
              </p>
              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                {address.line1}, {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
            <button onClick={() => setStep(2)} style={{ ...s.btn("ghost"), fontSize: 11, padding: "5px 12px", flexShrink: 0 }}>
              ✏️ Edit
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(2)} style={{ padding: "13px 20px" }}>
              ← Back
            </Btn>
            <button
              onClick={handlePlaceOrder}
              disabled={loading || (paymentMethod === "wallet" && walletBalance < finalTotal)}
              style={{
                flex: 1, padding: "14px 0", borderRadius: 12, border: "none",
                cursor: loading || (paymentMethod === "wallet" && walletBalance < finalTotal) ? "not-allowed" : "pointer",
                fontSize: 15, fontWeight: 800, fontFamily: "inherit",
                background: T.accent, color:   loading ? T.muted : "#fff",
                opacity: loading || (paymentMethod === "wallet" && walletBalance < finalTotal) ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading
                ? "⏳ Processing..."
                : paymentMethod === "cod"
                  ? `✅ Place Order — ${fmt.currency(finalTotal)}`
                  : paymentMethod === "wallet"
                    ? `💰 Pay from Wallet — ${fmt.currency(finalTotal)}`
                    : `⚡ Pay ${fmt.currency(finalTotal)}`
              }
            </button>
          </div>

          <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
            {paymentMethod === "wallet"
              ? "🔒 Wallet payment — Secure & instant"
              : paymentMethod === "cod"
                ? "✓ Cash on Delivery — No charges"
                : "🔒 Secured by Razorpay — 100% safe & encrypted"
            }
          </p>
        </div>
      )}

      {/* ────────────── STEP 4: SUCCESS ────────────── */}
      {step === 4 && placedOrder && (
        <div style={{ ...s.card, padding: "3rem 2rem", textAlign: "center" }}>
          <style>{`
            @keyframes popIn {
              0%   { transform: scale(0.5); opacity: 0; }
              70%  { transform: scale(1.2); }
              100% { transform: scale(1);   opacity: 1; }
            }
          `}</style>

          <div style={{ fontSize: 72, marginBottom: 16, display: "inline-block", animation: "popIn 0.5s ease" }}>
            🎉
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: T.success, marginBottom: 8, letterSpacing: "-0.03em" }}>
            {placedOrder.paymentMethod === "cod" ? "Order Placed!" : "Payment Successful!"}
          </h2>

          <p style={{ fontSize: 14, color: T.muted, marginBottom: 6 }}>
            Order ID: <strong style={{ color: T.accent, fontFamily: "monospace" }}>
              #{placedOrder._id?.toString().slice(-8).toUpperCase()}
            </strong>
          </p>

          <p style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 6 }}>
            {fmt.currency(placedOrder.total)}
          </p>

          <p style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>
            {placedOrder.paymentMethod === "cod"
              ? "💵 Pay on Delivery"
              : `⚡ Paid via Razorpay`
            }
          </p>

          {placedOrder.paymentId && placedOrder.paymentId !== "COD" && (
            <p style={{ fontSize: 14, color: T.muted, fontFamily: "monospace", marginBottom: 4 }}>
             Payment ID:<b> {placedOrder.paymentId}</b>
            </p>
          )}

          <p style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>
            📧 Confirmation sent to <strong style={{ color: T.text }}>{state.currentUser?.email}</strong>
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => onNavigate("orders")} style={{ padding: "11px 28px" }}>
              📦 Track My Order →
            </Btn>
            <Btn variant="ghost" onClick={() => { onNavigate("shop"); }} style={{ padding: "11px 24px" }}>
              Continue Shopping
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const toast = useToast();

  const [form, setForm] = useState(initial || {
    label: "Home", name: "", phone: "", line1: "", city: "", state: "", pincode: "", isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast("Please fill all fields.", "error"); return;
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      toast("Phone must be 10 digits.", "error"); return;
    }
    if (form.pincode.replace(/\D/g, "").length !== 6) {
      toast("Pincode must be 6 digits.", "error"); return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: T.surface2, borderRadius: 14,
      padding: "1.5rem", border: `1px solid ${T.accentBorder}`,
      marginBottom: 16,
    }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: "1rem" }}>
        {initial ? "Edit Address" : "Add New Address"}
      </h4>

      {/* Label */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["Home", "Work", "Other"].map(l => (
          <button key={l} onClick={() => setForm(p => ({ ...p, label: l }))} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            background: form.label === l ? T.accent : T.surface,
            color: form.label === l ? "#fff" : T.muted,
            transition: "all 0.15s",
          }}>
            {l === "Home" ? "🏠" : l === "Work" ? "💼" : "📍"} {l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Full Name *">
          <Input value={form.name} onChange={set("name")} placeholder="Enter your full name" />
        </FormField>
        <FormField label="Phone *">
          <Input
            type="tel" value={form.phone}
            onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 10) setForm(p => ({ ...p, phone: v })); }}
            placeholder="Enter phone number" maxLength={10}
          />
        </FormField>
        <FormField label="Address *" style={{ gridColumn: "1/-1" }}>
          <Input value={form.line1} onChange={set("line1")} placeholder="House No, Street, Area" />
        </FormField>
        <FormField label="City *">
          <Input value={form.city} onChange={set("city")} placeholder="Enter city" />
        </FormField>
        <FormField label="State *">
          <Input value={form.state} onChange={set("state")} placeholder="Enter state" />
        </FormField>
        <FormField label="Pincode *">
          <Input
            type="tel" value={form.pincode}
            onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setForm(p => ({ ...p, pincode: v })); }}
            placeholder="Enter pincode" maxLength={6}
          />
        </FormField>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <button
          onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
          style={{
            width: 20, height: 20, borderRadius: 5, border: `2px solid ${form.isDefault ? T.accent : T.border}`,
            background: form.isDefault ? T.accent : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#fff",
          }}
        >{form.isDefault ? "✓" : ""}</button>
        <span style={{ fontSize: 13, color: T.muted }}>Set as default address</span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
          {saving ? "Saving..." : "💾 Save Address"}
        </Btn>
        <Btn variant="ghost" onClick={onCancel} style={{ padding: "8px 20px" }}>Cancel</Btn>
      </div>
    </div>
  );
}


function WalletSection() {
  const { state } = useApp();
  const toast = useToast();
  const T     = getT(state.theme);
  const s     = baseStyles(state.theme);
 
  const [balance,      setBalance]      = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [topupAmount,  setTopupAmount]  = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [activeTab,    setActiveTab]    = useState("overview");
 
  // Quick topup presets
  const PRESETS = [100, 250, 500, 1000, 2000, 5000];
 
  // Load Razorpay script
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script  = document.createElement("script");
      script.id     = "razorpay-script";
      script.src    = "https://checkout.razorpay.com/v1/checkout.js";
      script.async  = true;
      document.body.appendChild(script);
    }
  }, []);
 
  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await walletApi.get();
      setBalance(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { loadWallet(); }, []);
 
  // ── Handle Razorpay Topup ──────────────────────────────────
  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 10) {
      toast("Minimum top-up amount is ₹10.", "error"); return;
    }
    if (amount > 50000) {
      toast("Maximum top-up amount is ₹50,000.", "error"); return;
    }
    if (!window.Razorpay) {
      toast("Payment gateway loading... Try again.", "error"); return;
    }
 
    setTopupLoading(true);
    try {
      const orderData = await walletApi.topupCreate(amount);
 
      const options = {
        key:          orderData.keyId,
        amount:       orderData.amount,
        currency:     "INR",
        name:         "BharatCart Wallet",
        description:  `Add ₹${amount.toLocaleString("en-IN")} to wallet`,
        image:        "https://img.icons8.com/emoji/96/money-bag.png",
        order_id:     orderData.razorpayOrderId,
        prefill: {
          name:    orderData.userName,
          email:   orderData.userEmail,
          contact: orderData.userPhone,
        },
        theme: { color: "#c9a84c" },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setTopupLoading(false);
            toast("Top-up cancelled.", "info");
          },
        },
        handler: async (response) => {
          try {
            const result = await walletApi.topupVerify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              amount,
            });
            setBalance(result.balance);
            await loadWallet();
            setTopupAmount("");
            toast(`✅ ₹${amount.toLocaleString("en-IN")} added to wallet!`, "success");
          } catch (err) {
            toast(err.message, "error");
          } finally {
            setTopupLoading(false);
          }
        },
      };
 
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setTopupLoading(false);
        toast("Payment failed. Please try again.", "error");
      });
      rzp.open();
    } catch (err) {
      setTopupLoading(false);
      toast(err.message, "error");
    }
  };
 
  const typeConfig = {
    credit:   { color: "#2a9d6e", icon: "⬆️", label: "Added",    sign: "+" },
    debit:    { color: "#e05c5c", icon: "⬇️", label: "Paid",     sign: "-" },
    refund:   { color: "#608cdc", icon: "↩️", label: "Refund",   sign: "+" },
    cashback: { color: "#f59e0b", icon: "🎁", label: "Cashback", sign: "+" },
  };
 
  const totalCredited  = transactions.filter(t => ["credit","refund","cashback"].includes(t.type)).reduce((s, t) => s + t.amount, 0);
  const totalSpent     = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
 
  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
      Loading wallet...
    </div>
  );
 
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
        <span style={{
          background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>My Wallet</span>
      </h2>
 
      {/* ── Balance Card ── */}
      <div style={{
        background:   "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
        borderRadius: 20,
        padding:      "2rem",
        marginBottom: "1.5rem",
        position:     "relative",
        overflow:     "hidden",
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(201,168,76,0.08)" }} />
        <div style={{ position: "absolute", right: 20, bottom: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,168,76,0.05)" }} />
 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              💰 BharatCart Wallet
            </p>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 4 }}>
              ₹{balance.toLocaleString("en-IN")}
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              Available Balance
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Member</p>
            <p style={{ color: "#d4a843", fontWeight: 700, fontSize: 13 }}>{state.currentUser?.name}</p>
          </div>
        </div>
 
        {/* Mini stats */}
        <div style={{ display: "flex", gap: 16, marginTop: "1.5rem", paddingTop: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Added</p>
            <p style={{ color: "#2a9d6e", fontWeight: 800, fontSize: 16 }}>+₹{totalCredited.toLocaleString("en-IN")}</p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Spent</p>
            <p style={{ color: "#e05c5c", fontWeight: 800, fontSize: 16 }}>-₹{totalSpent.toLocaleString("en-IN")}</p>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Transactions</p>
            <p style={{ color: "#d4a843", fontWeight: 800, fontSize: 16 }}>{transactions.length}</p>
          </div>
        </div>
      </div>
 
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: T.surface2, borderRadius: 12, padding: 4, marginBottom: "1.5rem" }}>
        {[["overview", "💰 Add Money"], ["history", "📋 History"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
            cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            background: activeTab === id ? T.accent : "transparent",
            color:      activeTab === id ? "#fff"   : T.muted,
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>
 
      {/* ── ADD MONEY TAB ── */}
      {activeTab === "overview" && (
        <div>
          <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1rem" }}>
              ⚡ Add Money to Wallet
            </h3>
 
            {/* Quick presets */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 10 }}>
              Quick Add
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setTopupAmount(preset.toString())}
                  style={{
                    padding:    "8px 16px",
                    borderRadius: 10,
                    border:     `1px solid ${topupAmount === preset.toString() ? T.accent : T.border}`,
                    background: topupAmount === preset.toString() ? T.accentBg : T.surface2,
                    color:      topupAmount === preset.toString() ? T.accent   : T.text,
                    fontSize:   13,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor:     "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  ₹{preset.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
 
            {/* Custom amount */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
              Enter Amount
            </p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{
                  position:  "absolute",
                  left:      14,
                  top:       "50%",
                  transform: "translateY(-50%)",
                  fontSize:  16,
                  fontWeight: 700,
                  color:     T.accent,
                }}>₹</span>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder="Enter amount (min ₹10)"
                  min={10}
                  max={50000}
                  onKeyDown={e => e.key === "Enter" && handleTopup()}
                  style={{
                    width:        "100%",
                    padding:      "12px 14px 12px 34px",
                    borderRadius: 12,
                    border:       `1px solid ${T.border}`,
                    background:   T.surface2,
                    color:        T.text,
                    fontSize:     16,
                    fontFamily:   "inherit",
                    fontWeight:   700,
                    outline:      "none",
                    boxSizing:    "border-box",
                    transition:   "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
              <button
                onClick={handleTopup}
                disabled={topupLoading || !topupAmount}
                style={{
                  padding:      "12px 24px",
                  borderRadius: 12,
                  border:       "none",
                  cursor:       topupLoading || !topupAmount ? "not-allowed" : "pointer",
                  fontSize:     14,
                  fontWeight:   800,
                  fontFamily:   "inherit",
                  background:   topupLoading || !topupAmount
                    ? T.surface2
                    : `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
                  color:        topupLoading || !topupAmount ? T.muted : "#ffffff",
                  transition:   "all 0.2s",
                  whiteSpace:   "nowrap",
                }}
              >
                {topupLoading ? "⏳ Processing..." : "➕ Add Money"}
              </button>
            </div>
 
            {/* Payment methods info */}
            <div style={{ background: T.surface2, borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                💳 Accepted Payment Methods
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { icon: "📱", label: "UPI",           sub: "GPay, PhonePe, Paytm"   },
                  { icon: "💳", label: "Debit Card",    sub: "Visa, Mastercard, RuPay" },
                  { icon: "💳", label: "Credit Card",   sub: "All major cards"          },
                  { icon: "🏦", label: "Net Banking",   sub: "All major banks"          },
                ].map(method => (
                  <div key={method.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{method.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{method.label}</p>
                      <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>{method.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 12 }}>
              🔒 Secured by Razorpay · Instant credit · No charges
            </p>
          </div>
 
          {/* How wallet works */}
          <div style={{ ...s.card, padding: "1.25rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: "1rem" }}>
              💡 How BharatCart Wallet Works
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "💰", title: "Add Money",    desc: "Top up using UPI, Card or Net Banking instantly" },
                { icon: "🛍", title: "Pay at Checkout", desc: "Use wallet balance to pay for orders — faster checkout" },
                { icon: "↩️", title: "Easy Refunds",  desc: "Returns are refunded directly to your wallet" },
                { icon: "🎁", title: "Cashback",      desc: "Earn cashback on special offers credited to wallet" },
              ].map(item => (
                <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: T.accentBg, border: `1px solid ${T.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: "0 0 2px" }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* ── TRANSACTION HISTORY TAB ── */}
      {activeTab === "history" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Transaction History</h3>
            <button onClick={loadWallet} style={{ ...s.btn("ghost"), fontSize: 12, padding: "6px 12px" }}>
              ↻ Refresh
            </button>
          </div>
 
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: T.surface, borderRadius: 16, border: `1px dashed ${T.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📋</div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>No transactions yet</p>
              <p style={{ fontSize: 13, color: T.muted }}>Add money to your wallet to get started.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {transactions.map(tx => {
                const cfg = typeConfig[tx.type] || typeConfig.credit;
                return (
                  <div key={tx._id} style={{
                    ...s.card,
                    padding:    "14px 16px",
                    display:    "flex",
                    alignItems: "center",
                    gap:        12,
                  }}>
                    {/* Icon */}
                    <div style={{
                      width:          40,
                      height:         40,
                      borderRadius:   "50%",
                      background:     `${cfg.color}15`,
                      border:         `1px solid ${cfg.color}30`,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       16,
                      flexShrink:     0,
                    }}>
                      {cfg.icon}
                    </div>
 
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: "0 0 3px" }}>
                        {tx.description || cfg.label}
                      </p>
                      <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                        {tx.paymentId && ` · ID: ${tx.paymentId.slice(0, 16)}...`}
                      </p>
                    </div>
 
                    {/* Amount */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontSize:   16,
                        fontWeight: 900,
                        color:      cfg.color,
                        margin:     "0 0 2px",
                      }}>
                        {cfg.sign}₹{tx.amount.toLocaleString("en-IN")}
                      </p>
                      <p style={{ fontSize: 10, color: T.muted, margin: 0 }}>
                        Bal: ₹{tx.balance.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BankDetailsSection() {
  const { state } = useApp();
  const T   = getT(state.theme);
  const s   = baseStyles(state.theme);
  const toast = useToast();
 
  const [banks,       setBanks]       = useState([]);
  const [myRefunds,   setMyRefunds]   = useState([]);
  const [walletBal,   setWalletBal]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("banks");
  const [showForm,    setShowForm]    = useState(false);
  const [editBank,    setEditBank]    = useState(null);
  const [refundModal, setRefundModal] = useState(false);
  const [saving,      setSaving]      = useState(false);
 
  const emptyForm = {
    accountName:"", accountNumber:"", ifscCode:"",
    bankName:"", branchName:"", accountType:"savings",
    upiId:"", isPrimary:false,
  };
  const [form, setForm] = useState(emptyForm);
  const [refundForm, setRefundForm] = useState({
    amount:"", reason:"", method:"bank", bankId:"", upiId:"",
  });
 
  const setF  = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const setRF = f => e => setRefundForm(p => ({ ...p, [f]: e.target.value }));
 
  const load = async () => {
    setLoading(true);
    try {
      const [b, r, w] = await Promise.all([
        bankApi.list(),
        bankApi.myRefunds(),
        walletApi.get(),
      ]);
      setBanks(Array.isArray(b) ? b : []);
      setMyRefunds(Array.isArray(r) ? r : []);
      setWalletBal(w?.balance || 0);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
 
  const verifiedBanks = banks.filter(b => b.verified && !b.rejected);
 
  const verificationBadge = (bank) => {
    if (bank.verified)  return { label:"✅ Verified",       color:"success" };
    if (bank.rejected)  return { label:"❌ Rejected",       color:"danger"  };
    return                     { label:"⏳ Pending Review", color:"warning" };
  };
 
  const statusColor = { Pending:"warning", Processing:"info", Completed:"success", Rejected:"danger" };
  const statusIcon  = { Pending:"⏳", Processing:"🔄", Completed:"✅", Rejected:"❌" };
 
  // ── Bank CRUD ─────────────────────────────────────────────
  const openAdd = () => {
    setEditBank(null);
    setForm({ ...emptyForm, accountName: state.currentUser?.name||"", isPrimary: banks.length===0 });
    setShowForm(true);
  };
  const openEdit = (bank) => { setEditBank(bank); setForm({ ...bank }); setShowForm(true); };
 
  const handleSave = async () => {
    if (!form.accountName||!form.accountNumber||!form.ifscCode||!form.bankName) {
      toast("Please fill all required fields.", "error"); return;
    }
    if (!/^\d{9,18}$/.test(form.accountNumber)) {
      toast("Account number must be 9–18 digits.", "error"); return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      toast("Invalid IFSC format (e.g. SBIN0001234).", "error"); return;
    }
    setSaving(true);
    try {
      if (editBank) {
        const updated = await bankApi.update(editBank._id, form);
        setBanks(prev => prev.map(b => b._id===updated._id ? updated : b));
        toast("Bank details updated!", "success");
      } else {
        const created = await bankApi.add(form);
        setBanks(prev => [...prev, created]);
        toast("Bank account saved! Pending admin verification.", "success");
      }
      setShowForm(false); setEditBank(null);
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };
 
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bank account?")) return;
    try {
      await bankApi.remove(id);
      setBanks(prev => prev.filter(b => b._id!==id));
      toast("Bank account removed.", "success");
    } catch (err) { toast(err.message, "error"); }
  };
 
  const handleSetPrimary = async (id) => {
    try {
      await bankApi.update(id, { isPrimary:true });
      setBanks(prev => prev.map(b => ({ ...b, isPrimary: b._id===id })));
      toast("Primary account updated!", "success");
    } catch (err) { toast(err.message, "error"); }
  };
 
  // ── Wallet Refund Request ─────────────────────────────────
  const openRefundModal = () => {
    const primary = verifiedBanks.find(b=>b.isPrimary) || verifiedBanks[0];
    setRefundForm({
      amount:"", reason:"", method:"bank",
      bankId: primary?._id||"", upiId: primary?.upiId||"",
    });
    setRefundModal(true);
  };
 
  const handleRefundRequest = async () => {
    const amt = parseFloat(refundForm.amount);
    if (!amt || amt < 1)          { toast("Enter a valid amount.", "error"); return; }
    if (amt > walletBal)          { toast(`Insufficient wallet balance. Available: ₹${walletBal.toLocaleString("en-IN")}`, "error"); return; }
    if (!refundForm.reason.trim()){ toast("Please provide a reason.", "error"); return; }
    if (refundForm.method==="bank" && !refundForm.bankId) { toast("Please select a verified bank account.", "error"); return; }
    if (refundForm.method==="upi"  && !refundForm.upiId.trim()) { toast("Please enter your UPI ID.", "error"); return; }
 
    const selectedBank = banks.find(b=>b._id===refundForm.bankId);
    setSaving(true);
    try {
      await bankApi.requestRefund({
        type: "wallet",
        amount: amt,
        reason: refundForm.reason,
        bankDetails: refundForm.method==="bank"
          ? { method:"bank", accountName:selectedBank?.accountName, accountNumber:selectedBank?.accountNumber, ifscCode:selectedBank?.ifscCode, bankName:selectedBank?.bankName }
          : { method:"upi", upiId:refundForm.upiId },
      });
      toast("Refund request submitted! Admin will transfer within 3–5 business days.", "success");
      setRefundModal(false);
      load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };
 
  if (loading) return <div style={{ textAlign:"center", padding:"3rem", color:T.muted }}>Loading bank details...</div>;
 
  return (
    <div>
      {/* Sub-tabs */}
      {/* <div style={{ display:"flex", gap:4, background:T.surface2, borderRadius:10, padding:4, marginBottom:"1.25rem" }}>
        {[["banks","🏦 Bank Accounts"]].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{
            flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:600, fontFamily:"inherit",
            background: activeTab===id ? T.accent : "transparent",
            color:      activeTab===id ? "#fff"   : T.muted,
            transition:"all 0.2s",
          }}>{label}</button>
        ))}
      </div> */}
 
      {/* ══ BANK ACCOUNTS ══ */}
      {activeTab==="banks" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <div>
              <h4 style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:2 }}>Saved Bank Accounts</h4>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {/* {verifiedBanks.length>0 && walletBal>0 && (
                <button onClick={openRefundModal} style={{ ...s.btn("success"), padding:"6px 14px", fontSize:12 }}>
                  💰 Withdraw to Bank
                </button>
              )} */}
              {!showForm && (
                <button onClick={openAdd} style={{ ...s.btn("primary"), padding:"9px 16px", fontSize:12 }}>
                  + Add Account
                </button>
              )}
            </div>
          </div>
 
          {/* Pending banner */}
          {banks.length>0 && verifiedBanks.length===0 && (
            <div style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"10px 14px", fontSize:12, color:T.muted, marginBottom:14 }}>
              ℹ️ Your bank account is pending admin verification. Once verified you can return refund to your bank.
            </div>
          )}
 
          {/* Add / Edit Form */}
          {showForm && (
            <div style={{ ...s.card, padding:"1.5rem", marginBottom:"1rem", border:`1px solid ${T.accentBorder}` }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:"1rem" }}>
                {editBank ? "✏️ Edit Bank Account" : "🏦 Add Bank Account"}
              </h4>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <FormField label="Account Holder Name *">
                  <Input value={form.accountName} onChange={setF("accountName")} placeholder="As per bank records" />
                </FormField>
                <FormField label="Account Number *">
                  <Input type="text" value={form.accountNumber}
                    onChange={e=>setForm(p=>({...p,accountNumber:e.target.value.replace(/\D/g,"")}))}
                    placeholder="9–18 digit account number" />
                  {form.accountNumber && !/^\d{9,18}$/.test(form.accountNumber) && (
                    <p style={{ color:T.danger, fontSize:11, marginTop:3 }}>⚠ 9–18 digits required</p>
                  )}
                </FormField>
                <FormField label="IFSC Code *">
                  <Input value={form.ifscCode}
                    onChange={e=>setForm(p=>({...p,ifscCode:e.target.value.toUpperCase()}))}
                    placeholder="Enter IFSC Code" maxLength={11} />
                  {form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode) && (
                    <p style={{ color:T.danger, fontSize:11, marginTop:3 }}>⚠ Format: AAAA0XXXXXX</p>
                  )}
                </FormField>
                <FormField label="Bank Name *">
                  <Input value={form.bankName} onChange={setF("bankName")} placeholder="Enter your bank name" />
                </FormField>
                <FormField label="Branch Name">
                  <Input value={form.branchName} onChange={setF("branchName")} placeholder="Enter your Branch name" />
                </FormField>
                <FormField label="Account Type">
                  <Select value={form.accountType} onChange={setF("accountType")}>
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                  </Select>
                </FormField>
                <FormField label="UPI ID (Optional)" style={{ gridColumn:"1/-1" }}>
                  <Input value={form.upiId} onChange={setF("upiId")} placeholder="Enter UPI ID" />
                </FormField>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:10, margin:"12px 0", cursor:"pointer" }}>
                <div onClick={()=>setForm(p=>({...p,isPrimary:!p.isPrimary}))} style={{
                  width:18, height:18, borderRadius:4,
                  border:`2px solid ${form.isPrimary?T.accent:T.border}`,
                  background:form.isPrimary?T.accent:"transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", fontSize:11, color:"#fff",
                }}>{form.isPrimary?"✓":""}</div>
                <span style={{ fontSize:13, color:T.muted }}>Set as primary account for refunds</span>
              </label>
              <div style={{ display:"flex", gap:10 }}>
                <Btn onClick={handleSave} disabled={saving} style={{ flex:1, justifyContent:"center" }}>
                  {saving?"Saving...":"💾 Save Account"}
                </Btn>
                <Btn variant="ghost" onClick={()=>{setShowForm(false);setEditBank(null);}} style={{ padding:"8px 20px" }}>Cancel</Btn>
              </div>
            </div>
          )}
 
          {/* Bank list */}
          {banks.length===0 && !showForm ? (
            <div style={{ textAlign:"center", padding:"2.5rem", background:T.surface, borderRadius:14, border:`1px dashed ${T.border}` }}>
              <div style={{ fontSize:40, marginBottom:10, opacity:0.4 }}>🏦</div>
              <p style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>No bank accounts saved</p>
              <p style={{ fontSize:12, color:T.muted, marginBottom:16 }}>
                Add your bank account. Once admin verifies it, you can return refund bank, wallet directly.
              </p>
              <Btn onClick={openAdd}>+ Add Bank Account</Btn>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {banks.map(bank=>{
                const badge = verificationBadge(bank);
                return (
                  <div key={bank._id} style={{
                    ...s.card, padding:"1.25rem",
                    borderLeft:`4px solid ${bank.verified?T.success:bank.rejected?T.danger:T.warning}`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <span style={{ fontSize:20 }}>🏦</span>
                          <span style={{ fontWeight:800, fontSize:14, color:T.text }}>{bank.bankName}</span>
                          {bank.isPrimary && (
                            <span style={{ fontSize:10, fontWeight:700, color:T.accent, background:T.accentBg, padding:"2px 8px", borderRadius:10 }}>PRIMARY</span>
                          )}
                          <Badge color={badge.color}>{badge.label}</Badge>
                        </div>
                        <p style={{ fontWeight:700, fontSize:14, color:T.text, margin:"0 0 3px" }}>{bank.accountName}</p>
                        <p style={{ fontSize:13, color:T.muted, margin:"0 0 2px" }}>Account: ••••{bank.accountNumber?.slice(-4)}</p>
                        <p style={{ fontSize:12, color:T.muted, margin:"0 0 2px" }}>IFSC: <strong style={{ color:T.text }}>{bank.ifscCode}</strong>{bank.branchName&&` · ${bank.branchName}`}</p>
                        {bank.upiId && <p style={{ fontSize:12, color:T.muted, margin:0 }}>UPI: <strong style={{ color:T.text }}>{bank.upiId}</strong></p>}
                        {bank.adminNote && (
                          <p style={{ fontSize:11, color:bank.rejected?T.danger:T.muted, marginTop:6, fontStyle:"italic" }}>
                            📝 Admin: {bank.adminNote}
                          </p>
                        )}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                        {!bank.isPrimary && bank.verified && (
                          <button onClick={()=>handleSetPrimary(bank._id)} style={{ ...s.btn("ghost"), padding:"4px 10px", fontSize:11 }}>⭐ Primary</button>
                        )}
                        <button onClick={()=>openEdit(bank)} style={{ ...s.btn("ghost"), padding:"4px 10px", fontSize:11 }}>✏️ Edit</button>
                        <button onClick={()=>handleDelete(bank._id)} style={{ ...s.btn("danger"), padding:"4px 10px", fontSize:11 }}>🗑 Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
 
      {/* ══ REFUND REQUESTS ══ */}
      {/* {activeTab==="refunds" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <h4 style={{ fontSize:14, fontWeight:700, color:T.text }}>My Wallet Withdrawal Requests</h4>
            {verifiedBanks.length>0 && walletBal>0 && (
              <button onClick={openRefundModal} style={{ ...s.btn("success"), padding:"6px 14px", fontSize:12 }}>
                + New Request
              </button>
            )}
          </div>
 
          {verifiedBanks.length===0 && (
            <div style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"12px 14px", fontSize:12, color:T.muted, marginBottom:14 }}>
              ℹ️ You need a verified bank account to withdraw wallet balance.
              <button onClick={()=>setActiveTab("banks")} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"inherit", marginLeft:6 }}>
                Go to Bank Accounts →
              </button>
            </div>
          )}
 
          {walletBal===0 && verifiedBanks.length>0 && (
            <div style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px", fontSize:12, color:T.muted, marginBottom:14 }}>
              💰 Your wallet balance is ₹0. Add money to your wallet first to request a withdrawal.
            </div>
          )}
 
          {myRefunds.length===0 ? (
            <div style={{ textAlign:"center", padding:"2.5rem", background:T.surface, borderRadius:14, border:`1px dashed ${T.border}` }}>
              <div style={{ fontSize:40, marginBottom:10, opacity:0.4 }}>💰</div>
              <p style={{ fontWeight:700, marginBottom:6 }}>No withdrawal requests yet</p>
              <p style={{ fontSize:12, color:T.muted }}>Request a withdrawal of your wallet balance to your bank account.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {myRefunds.map(r=>(
                <div key={r._id} style={{
                  ...s.card, padding:"1.25rem",
                  borderLeft:`4px solid ${
                    r.status==="Completed" ?T.success:
                    r.status==="Rejected"  ?T.danger :
                    r.status==="Processing"?"#608cdc":T.warning
                  }`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:18 }}>{statusIcon[r.status]||"⏳"}</span>
                    <span style={{ fontWeight:700, fontSize:14, color:T.text }}>
                      {r.type==="wallet" ? "Wallet Withdrawal" : "Order Return Refund"}
                    </span>
                    <Badge color={statusColor[r.status]||"default"}>{r.status}</Badge>
                  </div>
                  <p style={{ fontSize:22, fontWeight:900, color:T.accent, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
                    ₹{r.amount?.toLocaleString("en-IN")}
                  </p>
                  <p style={{ fontSize:12, color:T.muted, margin:"0 0 2px" }}>Reason: {r.reason}</p>
                  <p style={{ fontSize:12, color:T.muted, margin:"0 0 2px" }}>
                    {r.bankDetails?.method==="upi"
                      ? `📱 UPI: ${r.bankDetails.upiId}`
                      : `🏦 Bank: ••••${r.bankDetails?.accountNumber?.slice(-4)} · ${r.bankDetails?.bankName}`}
                  </p>
                  <p style={{ fontSize:11, color:T.muted }}>
                    📅 {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                  </p>
                  {r.transactionRef && (
                    <p style={{ fontSize:12, color:T.success, fontWeight:700, marginTop:4 }}>✅ UTR/Ref: {r.transactionRef}</p>
                  )}
                  {r.adminNote && (
                    <p style={{ fontSize:12, color:T.muted, marginTop:4, fontStyle:"italic" }}>📝 {r.adminNote}</p>
                  )}
                  {r.status==="Completed" && (
                    <div style={{ marginTop:8, background:"rgba(42,157,110,0.1)", border:"1px solid rgba(42,157,110,0.3)", borderRadius:8, padding:"8px 12px", fontSize:12, color:T.success, fontWeight:600 }}>
                      ✅ ₹{r.amount?.toLocaleString("en-IN")} has been transferred to your bank account.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )} */}
 
      {/* ══ WITHDRAWAL MODAL ══ */}
      {/* <Modal> */}
        {/* Wallet balance display */}
        {/* <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius:12, padding:"14px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Available Wallet Balance</p>
            <p style={{ fontSize:22, fontWeight:900, color:"#fff", margin:0 }}>₹{walletBal.toLocaleString("en-IN")}</p>
          </div>
          <span style={{ fontSize:30 }}>💰</span>
        </div> */}
 
        {/* <FormField label="Withdrawal Amount (₹) *">
          <div style={{ position:"relative" }}>
            <Input type="number" value={refundForm.amount} onChange={setRF("amount")}
              placeholder={`Max ₹${walletBal.toLocaleString("en-IN")}`} min={1} max={walletBal} />
            {refundForm.amount && parseFloat(refundForm.amount)>walletBal && (
              <p style={{ color:T.danger, fontSize:11, marginTop:3 }}>⚠ Exceeds wallet balance</p>
            )}
          </div>
        </FormField> */}
{/*  
        <FormField label="Reason *">
          <Input value={refundForm.reason} onChange={setRF("reason")} placeholder="e.g. Personal withdrawal, Unused balance..." />
        </FormField>
 
        <FormField label="Transfer To">
          <div style={{ display:"flex", gap:8 }}>
            {[["bank","🏦 Bank Transfer"],["upi","📱 UPI Transfer"]].map(([m,label])=>(
              <button key={m} onClick={()=>setRefundForm(p=>({...p,method:m}))} style={{
                flex:1, padding:"9px 0", borderRadius:10, border:"none", cursor:"pointer",
                fontSize:13, fontWeight:600, fontFamily:"inherit",
                background: refundForm.method===m ? T.accent : T.surface2,
                color:      refundForm.method===m ? "#fff"   : T.muted,
                transition:"all 0.2s",
              }}>{label}</button>
            ))}
          </div>
        </FormField> */}
{/*  
        {refundForm.method==="bank" && (
          <FormField label="Select Bank Account *">
            {verifiedBanks.length===0 ? (
              <p style={{ fontSize:12, color:T.danger }}>No verified bank accounts. Please add and get one verified first.</p>
            ) : (
              <Select value={refundForm.bankId} onChange={setRF("bankId")}>
                <option value="">Select account…</option>
                {verifiedBanks.map(b=>(
                  <option key={b._id} value={b._id}>
                    {b.bankName} — ••••{b.accountNumber?.slice(-4)}{b.isPrimary?" (Primary)":""}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        )} */}
 
        {/* {refundForm.method==="upi" && (
          <FormField label="UPI ID *">
            <Input value={refundForm.upiId} onChange={setRF("upiId")} placeholder="yourname@upi" />
          </FormField>
        )} */}
 
        {/* <div style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:10, padding:"10px 14px", fontSize:12, color:T.muted }}>
          ⚠️ Your wallet balance will be <strong>deducted after admin approves</strong> and marks the transfer as Completed. Processing takes 3–5 business days.
        </div> */}
      {/* </Modal> */}
    </div>
  );
}


function ProfileSection() {
  const { state, dispatch } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();
 
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState({
    name: state.currentUser?.name || "",
    email: state.currentUser?.email || "",
    phone: state.currentUser?.phone || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
 
  // Address book states
  const [addressList, setAddressList] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
 
  const setP = f => e => {
    if (f === "phone") {
      const v = e.target.value.replace(/\D/g, "");
      if (v.length <= 10) setProfile(p => ({ ...p, phone: v }));
    } else {
      setProfile(p => ({ ...p, [f]: e.target.value }));
    }
  };
  const setPwdF = f => e => setPwd(p => ({ ...p, [f]: e.target.value }));
 
  // Load addresses when tab is opened
  useEffect(() => {
    if (activeTab === "addresses") loadAddresses();
  }, [activeTab]);
 
  const loadAddresses = async () => {
    setAddrLoading(true);
    try {
      const data = await addresses.list();
      setAddressList(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setAddrLoading(false);
    }
  };
 
  const handleAddAddress = async (form) => {
    try {
      const newAddr = await addresses.add(form);
      setAddressList(prev => {
        const updated = form.isDefault
          ? prev.map(a => ({ ...a, isDefault: false }))
          : prev;
        return [newAddr, ...updated];
      });
      setShowAddForm(false);
      toast("Address added!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
 
  const handleUpdateAddress = async (form) => {
    try {
      const updated = await addresses.update(editingAddr._id, form);
      setAddressList(prev => {
        let list = prev.map(a =>
          form.isDefault ? { ...a, isDefault: a._id === updated._id } : a
        );
        return list.map(a => a._id === updated._id ? updated : a);
      });
      setEditingAddr(null);
      toast("Address updated!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
 
  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addresses.remove(id);
      setAddressList(prev => prev.filter(a => a._id !== id));
      toast("Address deleted.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
 
  const handleSetDefault = async (id) => {
    try {
      await addresses.setDefault(id);
      setAddressList(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
      toast("Default address updated!", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };
 
  const handleProfileSave = async () => {
    if (!profile.name || !profile.email) { toast("Name and email are required.", "error"); return; }
    if (profile.phone && profile.phone.length !== 10) { toast("Phone must be 10 digits.", "error"); return; }
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile(profile);
      dispatch({ type: "LOGIN", payload: { user: res.user, isAdmin: state.isAdmin } });
      toast("Profile updated!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };
 
  const handlePasswordChange = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) { toast("Fill all fields.", "error"); return; }
    if (pwd.newPassword !== pwd.confirmPassword) { toast("Passwords don't match.", "error"); return; }
    if (pwd.newPassword.length < 6) { toast("Min 6 characters.", "error"); return; }
    setPwdLoading(true);
    try {
      await authApi.changePassword(pwd.currentPassword, pwd.newPassword);
      toast("Password updated!", "success");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPwdLoading(false);
    }
  };
 
  const labelIcon = { Home: "🏠", Work: "💼", Other: "📍" };
 
  // ── TABS — 4 items, "bank" duplicate removed ──────────────
  const TABS = [
    ["info",      "✏️ Edit Profile"],
    ["addresses", "📍 Address Book"],
    ["banks",     "🏦 Bank & Refunds"],   // single, combined tab
    ["password",  "🔒 Change Password"],
  ];
 
  return (
    <div style={{ padding: "2rem", maxWidth: 620, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: T.text }}>👤 Profile</h2>
 
      {/* Avatar card */}
      <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
          background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 800, color: "#fff",
        }}>
          {state.currentUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 18, color: T.text }}>{state.currentUser?.name}</p>
          <p style={{ fontSize: 13, color: T.muted }}>{state.currentUser?.email}</p>
          {state.currentUser?.phone && (
            <p style={{ fontSize: 13, color: T.muted }}>📱 {state.currentUser.phone}</p>
          )}
        </div>
      </div>
 
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 6, background: T.surface2, borderRadius: 12,
        padding: "6px", marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
            cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            background: activeTab === id ? T.accent : "transparent",
            color: activeTab === id ? "#fff" : T.muted,
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{label}</button>
        ))}
      </div>
 
      {/* ── Edit Profile ── */}
      {activeTab === "info" && (
        <div style={{ ...s.card, padding: "1.5rem" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: "1.25rem", color: T.text }}>✏️ Edit Profile</h3>
          <FormField label="Full Name *">
            <Input value={profile.name} onChange={setP("name")} placeholder="Enter your full name" />
          </FormField>
          <FormField label="Email Address *">
            <Input type="email" value={profile.email} onChange={setP("email")} placeholder="you@example.com" />
          </FormField>
          <FormField label="Phone Number">
            <Input
              type="tel" value={profile.phone} onChange={setP("phone")}
              placeholder="10 digit mobile" maxLength={10}
            />
            {profile.phone && profile.phone.length < 10 && (
              <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>⚠ {profile.phone.length}/10 digits</p>
            )}
            {profile.phone && profile.phone.length === 10 && (
              <p style={{ color: T.success, fontSize: 11, marginTop: 4 }}>✓ Valid</p>
            )}
          </FormField>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={handleProfileSave} disabled={profileLoading} style={{ flex: 1, justifyContent: "center" }}>
              {profileLoading ? "Saving..." : "💾 Save Changes"}
            </Btn>
            <Btn variant="ghost" onClick={() => setProfile({
              name: state.currentUser?.name || "",
              email: state.currentUser?.email || "",
              phone: state.currentUser?.phone || "",
            })} style={{ padding: "8px 16px" }}>
              Reset
            </Btn>
          </div>
        </div>
      )}
 
      {/* ── Address Book ── */}
      {activeTab === "addresses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>📍 Saved Addresses</h3>
            {!showAddForm && !editingAddr && (
              <button onClick={() => setShowAddForm(true)} style={{
                ...s.btn("primary"), padding: "10px 16px", fontSize: 13,
              }}>+ Add Address</button>
            )}
          </div>
 
          {/* Add form */}
          {showAddForm && (
            <AddressForm
              onSave={handleAddAddress}
              onCancel={() => setShowAddForm(false)}
            />
          )}
 
          {addrLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: T.muted }}>Loading...</div>
          ) : addressList.length === 0 && !showAddForm ? (
            <div style={{ textAlign: "center", padding: "3rem", background: T.surface, borderRadius: 14, border: `1px dashed ${T.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📍</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No saved addresses</p>
              <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Add your delivery addresses for faster checkout.</p>
              <Btn onClick={() => setShowAddForm(true)}>+ Add First Address</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {addressList.map(addr => (
                <div key={addr._id}>
                  {editingAddr?._id === addr._id ? (
                    <AddressForm
                      initial={editingAddr}
                      onSave={handleUpdateAddress}
                      onCancel={() => setEditingAddr(null)}
                    />
                  ) : (
                    <div style={{
                      ...s.card, padding: "1.25rem",
                      borderLeft: `4px solid ${addr.isDefault ? T.accent : T.border}`,
                      position: "relative",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 16 }}>{labelIcon[addr.label] || "📍"}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{addr.label}</span>
                            {addr.isDefault && (
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                background: T.accentBg, color: T.accent,
                                border: `1px solid ${T.accentBorder}`,
                                padding: "2px 8px", borderRadius: 10,
                              }}>DEFAULT</span>
                            )}
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{addr.name}</p>
                          <p style={{ fontSize: 13, color: T.muted, marginBottom: 2 }}>📱 {addr.phone}</p>
                          <p style={{ fontSize: 13, color: T.muted }}>
                            {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)} style={{
                              ...s.btn("ghost"), padding: "5px 12px", fontSize: 11,
                            }}>⭐ Set Default</button>
                          )}
                          <button onClick={() => setEditingAddr(addr)} style={{
                            ...s.btn("ghost"), padding: "5px 12px", fontSize: 11,
                          }}>✏️ Edit</button>
                          <button onClick={() => handleDeleteAddress(addr._id)} style={{
                            ...s.btn("danger"), padding: "5px 12px", fontSize: 11,
                          }}>🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
 
      {/* ── Bank & Refunds (single combined tab via BankDetailsSection) ── */}
      {activeTab === "banks" && <BankDetailsSection />}
 
      {/* ── Change Password ── */}
      {activeTab === "password" && (
        <div style={{ ...s.card, padding: "1.5rem" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: "1.25rem", color: T.text }}>🔒 Change Password</h3>
          <FormField label="Current Password">
            <Input type="password" value={pwd.currentPassword} onChange={setPwdF("currentPassword")} placeholder="Enter current password" />
          </FormField>
          <FormField label="New Password">
            <Input type="password" value={pwd.newPassword} onChange={setPwdF("newPassword")} placeholder="Enter new password" />
            {pwd.newPassword && pwd.newPassword.length < 6 && (
              <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>⚠ Minimum 6 characters</p>
            )}
          </FormField>
          <FormField label="Confirm New Password">
            <Input type="password" value={pwd.confirmPassword} onChange={setPwdF("confirmPassword")} placeholder="Enter new password again" />
            {pwd.confirmPassword && pwd.newPassword !== pwd.confirmPassword && (
              <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>⚠ Passwords do not match</p>
            )}
            {pwd.confirmPassword && pwd.newPassword === pwd.confirmPassword && pwd.confirmPassword.length >= 6 && (
              <p style={{ color: T.success, fontSize: 11, marginTop: 4 }}>✓ Passwords match</p>
            )}
          </FormField>
          <Btn onClick={handlePasswordChange} disabled={pwdLoading} style={{ width: "100%", justifyContent: "center" }}>
            {pwdLoading ? "Updating..." : "🔒 Update Password"}
          </Btn>
        </div>
      )}
    </div>
  );
}


function AdminDashboard() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, delivered: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Already fetched in useEffect — memoize displayed stats
  const displayStats = useMemo(() => ({
    revenueFormatted: fmt.currency(stats.revenue),
    ordersLabel: `${stats.orders} total`,
    usersLabel: `${stats.users} registered`,
    deliveredLabel: `${stats.delivered} delivered`,
  }), [stats]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Fetch all orders + all users in parallel from backend
        const [allOrders, allUsers] = await Promise.all([
          orders.all(),
          admin.users(),
        ]);

        const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
        const delivered = allOrders.filter(o => o.status === "Delivered").length;

        setStats({
          revenue,
          orders: allOrders.length,
          users: allUsers.length,
          delivered,
        });

        // Recent 8 orders newest first
        setRecent([...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8));
      } catch (err) {
        toast("Failed to load dashboard: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusColor = {
    Processing: "info",
    Shipped: "warning",
    "Out for Delivery": "warning",
    Delivered: "success",
    Cancelled: "danger",
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
      Loading dashboard...
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
        <span style={{
          background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Dashboard Overview</span>
      </h2>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon="💰" value={fmt.currency(stats.revenue)} label="Total Revenue" color={T.accent} />
        <StatCard icon="📦" value={stats.orders} label="Total Orders" color={T.rose} />
        <StatCard icon="👥" value={stats.users} label="Registered Users" color="#608cdc" />
        <StatCard icon="✅" value={stats.delivered} label="Delivered" color={T.success} />
      </div>

      {/* Recent orders table */}
      <div style={{ ...s.card, padding: "1.5rem" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: T.text }}>🕐 Recent Orders</h3>
        {recent.length === 0
          ? <p style={{ color: T.muted, textAlign: "center", padding: "2rem" }}>No orders yet</p>
          : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Order ID", "Customer", "Amount", "Payment", "Status", "Date"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "8px 12px",
                        fontSize: 11, color: T.muted,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        borderBottom: `1px solid ${T.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o._id} style={{ borderBottom: `1px solid ${T.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: "monospace" }}>
                        #{o._id?.toString().slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>
                        {o.user?.name || o.userName || "—"}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: T.success, fontWeight: 700 }}>
                        {fmt.currency(o.total)}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: T.muted }}>
                        {(o.paymentMethod || "—").toUpperCase()}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge color={statusColor[o.status] || "default"}>{o.status}</Badge>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: T.muted }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}

function AdminProducts() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [listingImages, setListingImages] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const EMPTY = { name: "", price: "", stock: "", category: "Electronics", description: "", emoji: "📦", rating: "4.5" };
  const [form, setForm] = useState(EMPTY);
  const setF = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const categories = [...new Set((state.products || []).map(product => product.category).filter(Boolean))].sort();
  const filteredProducts = (state.products || []).filter(product => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [product.name, product.category, product.description]
      .some(value => (value || "").toLowerCase().includes(query));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" ||
      (stockFilter === "out" && Number(product.stock) <= 0) ||
      (stockFilter === "low" && Number(product.stock) > 0 && Number(product.stock) < 10) ||
      (stockFilter === "available" && Number(product.stock) >= 10);
    return matchesSearch && matchesCategory && matchesStock;
  });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const lowStockCount = (state.products || []).filter(product => Number(product.stock) > 0 && Number(product.stock) < 10).length;
  const outOfStockCount = (state.products || []).filter(product => Number(product.stock) <= 0).length;
  const clearLocalImages = images => images.forEach(image => {
    if (image.file) URL.revokeObjectURL(image.preview);
  });
  const closeListingModal = () => {
    clearLocalImages(listingImages);
    setListingImages([]);
    setOpen(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setListingImages([]);
    setOpen(true);
  };

  const openEdit = p => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, description: p.description, emoji: p.emoji, rating: p.rating });
    clearLocalImages(listingImages);
    setListingImages([...new Set([...(p.images || []), p.image].filter(Boolean))].slice(0, 8).map(url => ({ url, preview: url, file: null })));
    setOpen(true);
  };

  const handleImageChange = e => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const availableSlots = Math.max(0, 8 - listingImages.length);
    if (files.length > availableSlots) {
      toast(`You can add up to 8 product images. ${availableSlots} slot${availableSlots === 1 ? "" : "s"} remaining.`, "error");
    }
    const accepted = files.slice(0, availableSlots).filter(file => {
      if (!file.type.startsWith("image/")) {
        toast(`${file.name} is not an image.`, "error");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast(`${file.name} is over the 5MB limit.`, "error");
        return false;
      }
      return true;
    }).map(file => ({ file, preview: URL.createObjectURL(file), url: "" }));
    setListingImages(current => [...current, ...accepted]);
  };

  const removeListingImage = index => {
    const image = listingImages[index];
    if (image?.file) URL.revokeObjectURL(image.preview);
    setListingImages(current => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const setPrimaryImage = index => {
    if (index === 0) return;
    setListingImages(current => {
      const reordered = [...current];
      reordered.unshift(...reordered.splice(index, 1));
      return reordered;
    });
  };

  const save = async () => {
    if (!form.name || !form.price || !form.stock) { toast("Name, price and stock are required.", "error"); return; }
    if (listingImages.length > 8) { toast("A product can have up to 8 images.", "error"); return; }
    setSaving(true);
    try {
      const newImageFiles = listingImages.filter(image => image.file).map(image => image.file);
      const listingData = {
        ...form,
        images: listingImages.map(image => image.file
          ? `upload:${newImageFiles.indexOf(image.file)}`
          : image.url),
      };
      if (editing) {
        const updated = await productsApi.update(editing._id, listingData, newImageFiles);
        dispatch({ type: "UPDATE_PRODUCT", payload: updated });
        toast("Product updated!", "success");
      } else {
        const created = await productsApi.create(listingData, newImageFiles);
        dispatch({ type: "ADD_PRODUCT", payload: created });
        toast("Product added!", "success");
      }
      clearLocalImages(listingImages);
      setListingImages([]);
      setOpen(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productsApi.delete(id);
      dispatch({ type: "DELETE_PRODUCT", payload: id });
      toast("Product deleted", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 850, color: T.text, marginBottom: 4 }}>Product catalog</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Manage listings, pricing and inventory in one place.</p>
        </div>
        <Btn onClick={openAdd}>＋ Add product</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, fontWeight: "bold", marginBottom: 16 }}>
        {[
          { label: "Total listings", value: state.products.length, icon: "▦", color: T.accent },
          { label: "Low stock", value: lowStockCount, icon: "⚠", color: T.warning },
          { label: "Out of stock", value: outOfStockCount, icon: "○", color: T.danger },
        ].map(stat => (
          <div key={stat.label} style={{ ...s.card, padding: "1rem 1.15rem", borderTop: `3px solid ${stat.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 650 }}>{stat.label}</span>
              <span style={{ color: stat.color, fontSize: 18 }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: 25, fontWeight: 850, color: T.text, marginTop: 5 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.card, padding: 14, marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Input
          aria-label="Search products"
          placeholder="Search products, categories..."
          value={search}
          onChange={event => { setSearch(event.target.value); setPage(1); }}
          style={{ flex: "1 1 240px" }}
        />
        <Select aria-label="Filter by category" value={categoryFilter} onChange={event => { setCategoryFilter(event.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="all">All categories</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </Select>
        <Select aria-label="Filter by inventory" value={stockFilter} onChange={event => { setStockFilter(event.target.value); setPage(1); }} style={{ width: 180 }}>
          <option value="all">All inventory</option>
          <option value="available">In stock (10+)</option>
          <option value="low">Low stock (&lt;10)</option>
          <option value="out">Out of stock</option>
        </Select>
        <span style={{ fontSize: 12, color: T.muted, marginLeft: "auto" }}>{filteredProducts.length} listings</span>
      </div>

      <div style={{ ...s.card, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 1200, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "13%" }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.surface2 }}>
              {["Product", "Category", "Price", "Inventory", "Rating", "Actions"].map(h => (
                <th key={h} style={{ padding: "13px 14px", textAlign: "left", color: T.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map(p => (
              <tr key={p._id || p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 14px", minWidth: 250 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {(p.images?.[0] || p.image)
                    ? <img src={p.images?.[0] || p.image} alt="" style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 10, objectFit: "cover", border: `1px solid ${T.border}` }} />
                    : <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 10, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25 }}>{p.emoji}</div>
                  }
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: T.text, fontWeight: 700, lineHeight: 1.35 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
                        SKU · {(p._id || p.id || "").toString().slice(-8).toUpperCase()}
                        {p.images?.length > 1 && <span> · {p.images.length} images</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}><Badge color="accent">{p.category}</Badge></td>
                <td style={{ padding: "12px 14px", fontWeight: 750, color: T.text, whiteSpace: "nowrap" }}>{fmt.currency(p.price)}</td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                    <strong style={{ color: T.text }}>{p.stock} units</strong>
                    <Badge color={p.stock <= 0 ? "danger" : p.stock < 10 ? "warning" : "success"}>
                      {p.stock <= 0 ? "Out of stock" : p.stock < 10 ? "Low stock" : "In stock"}
                    </Badge>
                  </div>
                </td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <span style={{ color: "#f59e0b" }}>★</span> {Number(p.rating || 0).toFixed(1)}
                </td>
                <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", gap: 7, flexWrap: "nowrap" }}>
                    <Btn variant="ghost" style={{ padding: "6px 11px", fontSize: 12, flexShrink: 0, whiteSpace: "nowrap" }} onClick={() => openEdit(p)}>Edit</Btn>
                    <Btn variant="danger" style={{ padding: "6px 10px", fontSize: 12, flexShrink: 0, whiteSpace: "nowrap" }} onClick={() => del(p._id || p.id)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: T.muted }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⌕</div>
            <p style={{ color: T.text, fontWeight: 700, marginBottom: 4 }}>No matching products</p>
            <p style={{ fontSize: 12 }}>Try changing the search term or filters.</p>
          </div>
        )}
        </div>
        {filteredProducts.length > pageSize && (
          <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 12, color: T.muted }}>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" disabled={page === 1} onClick={() => setPage(current => Math.max(1, current - 1))} style={{ padding: "6px 11px", fontSize: 12 }}>Previous</Btn>
              <Btn variant="ghost" disabled={page >= totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} style={{ padding: "6px 11px", fontSize: 12 }}>Next</Btn>
            </div>
          </div>
        )}
      </div>

      <Modal open={open} onClose={closeListingModal} title={editing ? "✏ Edit Product" : "＋ Add Product"}
        footer={[
      <Btn key="cancel" variant="ghost" onClick={closeListingModal}>Cancel</Btn>,
          <Btn key="save" onClick={save} disabled={saving}>{saving ? "Uploading…" : "💾 Save"}</Btn>,
        ]}>

        {/* PRODUCT IMAGE GALLERY */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
            Product images · {listingImages.length}/8
          </label>

          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(112px, 1fr))",
            gap:10, marginBottom:10,
          }}>
            {listingImages.map((image, index) => (
              <div key={image.url || image.preview} style={{
                position:"relative", aspectRatio:"1", overflow:"hidden", borderRadius:10,
                border:`2px solid ${index === 0 ? T.accent : T.border}`, background:T.surface2,
              }}>
                <img src={image.preview} alt={`Product view ${index + 1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                {index === 0 && (
                  <span style={{ position:"absolute", left:5, bottom:5, borderRadius:5, padding:"3px 6px", background:"rgba(0,0,0,.72)", color:"#fff", fontSize:9, fontWeight:800 }}>MAIN IMAGE</span>
                )}
                <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => removeListingImage(index)} style={{
                  position:"absolute", top:5, right:5, width:24, height:24, border:0, borderRadius:"50%",
                  background:"rgba(0,0,0,.72)", color:"#fff", cursor:"pointer", fontSize:16, lineHeight:1,
                }}>×</button>
                {index > 0 && (
                  <button type="button" onClick={() => setPrimaryImage(index)} style={{
                    position:"absolute", left:4, right:4, top:5, border:0, borderRadius:5, padding:"4px 3px",
                    background:"rgba(0,0,0,.72)", color:"#fff", cursor:"pointer", fontSize:9, fontWeight:700,
                  }}>Set as main</button>
                )}
              </div>
            ))}
            {listingImages.length < 8 && (
              <label style={{
                aspectRatio:"1", borderRadius:10, border:`2px dashed ${T.border}`, background:T.surface2,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:5, cursor:"pointer", color:T.muted, textAlign:"center", padding:8,
              }}>
                <span style={{ fontSize:24, color:T.accent }}>＋</span>
                <span style={{ fontSize:11, fontWeight:700 }}>Add images</span>
                <span style={{ fontSize:9 }}>Up to 8 · 5MB each</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display:"none" }}
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <p style={{ fontSize:11, color:T.muted, margin:0 }}>Add multiple product angles. The first image is shown as the main listing photo.</p>
        </div>

        <Divider />

        {/* PRODUCT FIELDS */}
        <FormField label="Product Name *"><Input value={form.name} onChange={setF("name")} placeholder="Enter product name" /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Price (₹) *"><Input type="number" value={form.price} onChange={setF("price")} placeholder="Enter price" /></FormField>
          <FormField label="Stock *"><Input type="number" value={form.stock} onChange={setF("stock")} placeholder="Enter stock" /></FormField>
          <FormField label="Emoji"><Input value={form.emoji} onChange={setF("emoji")} placeholder="📱" /></FormField>
          <FormField label="Rating"><Input type="number" step="0.1" max="5" value={form.rating} onChange={setF("rating")} placeholder="Enter rating" /></FormField>
        </div>
        <FormField label="Category">
          <Select value={form.category} onChange={setF("category")}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <FormField label="Description"><Input value={form.description} onChange={setF("description")} placeholder="Short description…" /></FormField>
      </Modal>
    </div>
  );
}

function ShippingLabelButton({ orderId }) {
  const { state } = useApp();
  const T     = getT(state.theme);
  const s     = baseStyles(state.theme);
  const toast = useToast();
 
  const [loading, setLoading] = useState(false);
 
  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await label.download(orderId);
      toast("📦 Shipping label downloaded!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download Shipping Label"
      style={{
        marginLeft:  "auto",
        display:    "flex",
        alignItems: "center",
        gap:        5,
        padding:    "6px 14px",
        borderRadius: 8,
        background:  "#111844",
        color:      "white",
        fontSize:   14, 
        fontWeight: 700,
        fontFamily: "inherit",
        cursor:     loading ? "not-allowed" : "pointer",
        opacity:    loading ? 0.7 : 1,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "⏳" : "📦"} {loading ? "Generating..." : "Download Label"}
    </button>
  );
}
 

// ═══════════════════════════════════════════════════════════
//  ADMIN — ORDERS
// ═══════════════════════════════════════════════════════════
function AdminOrders() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [updating, setUpdating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusMessages = {
    "Processing": "Your order has been confirmed and is being processed.",
    "Shipped": "Your order has been shipped and is on its way.",
    "Out for Delivery": "Your order is out for delivery. Expect it today!",
    "Delivered": "Your order has been delivered. Thank you for shopping!",
    "Cancelled": "Your order has been cancelled.",
  };

  // Fetch all orders directly from API every time this section mounts
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await ordersApi.all();
        setAllOrders(data);
        dispatch({ type: "SET_ORDERS", payload: data });
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const handleStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const message = statusMessages[status] || "";
      const updatedOrder = await ordersApi.status(orderId, status, message);
      setAllOrders(prev => prev.map(order => order._id === orderId ? updatedOrder : order));
      dispatch({ type: "UPDATE_ORDER_STATUS", payload: { id: orderId, status } });
      toast(status === "Shipped" && updatedOrder.shipment?.trackingNumber
        ? `Shipped with ${updatedOrder.shipment.provider}. Tracking ${updatedOrder.shipment.trackingNumber}`
        : "Status updated!", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  const statusColor = { Processing: "info", Shipped: "warning", "Out for Delivery": "warning", Delivered: "success", Cancelled: "danger" };
  const filteredOrders = allOrders.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    const query = search.trim().toLowerCase();
    return !query || [
      order._id, order.user?.name, order.user?.email,
      ...(order.items || []).map(item => item.name),
    ].some(value => (value || "").toString().toLowerCase().includes(query));
  });
  const orderCounts = {
    all: allOrders.length,
    Processing: allOrders.filter(order => order.status === "Processing").length,
    Shipped: allOrders.filter(order => order.status === "Shipped").length,
    Delivered: allOrders.filter(order => order.status === "Delivered").length,
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: getT(state.theme).muted }}>
      Loading orders…
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:"1.25rem" }}>
        <div>
          <h2 style={{ fontSize:24, fontWeight:850, marginBottom:4, color:getT(state.theme).text }}>Order management</h2>
          <p style={{ fontSize:13, color:getT(state.theme).muted, margin:0 }}>Track fulfilment, customers and payment status.</p>
        </div>
        <span style={{ ...s.card, padding:"8px 12px", color:T.muted, fontSize:12 }}>{filteredOrders.length} orders shown</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10, marginBottom:14 }}>
        {[
          ["All orders", orderCounts.all, "all", T.accent],
          ["To process", orderCounts.Processing, "Processing", T.info],
          ["In transit", orderCounts.Shipped, "Shipped", T.warning],
          ["Delivered", orderCounts.Delivered, "Delivered", T.success],
        ].map(([label, count, filter, color]) => (
          <button key={filter} onClick={() => setStatusFilter(filter)} style={{
            ...s.card, textAlign:"left", padding:"12px 14px", cursor:"pointer",
            borderColor:statusFilter===filter ? color : T.border,
            borderTop:`3px solid ${color}`,
          }}>
            <span style={{ display:"block", fontSize:11, color:T.muted, fontWeight:650 }}>{label}</span>
            <strong style={{ display:"block", fontSize:23, color:T.text, marginTop:4 }}>{count}</strong>
          </button>
        ))}
      </div>
      <div style={{ ...s.card, padding:12, marginBottom:14, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Input aria-label="Search orders" placeholder="Search order ID, customer or product..." value={search} onChange={event=>setSearch(event.target.value)} style={{ flex:"1 1 280px" }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {ORDER_STATUSES.map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} style={{
              ...s.btn(statusFilter===status ? "primary" : "ghost"),
              padding:"7px 10px", fontSize:11,
            }}>{status}</button>
          ))}
        </div>
      </div>
      {allOrders.length === 0
        ? <EmptyState emoji="📭" title="No orders yet" subtitle="Orders will appear here once customers place them." />
        : filteredOrders.length === 0
          ? <EmptyState emoji="⌕" title="No matching orders" subtitle="Try a different search or order status." />
          : filteredOrders.map(order => {
          const T = getT(state.theme);
          return (
            <div key={order._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem", marginBottom: 12, boxShadow:"0 8px 26px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>#{order._id?.toString().slice(-8).toUpperCase()}</p>
                  <p style={{ fontSize: 11, color: T.muted }}>{order.user?.name || "Customer"} · {order.user?.email || "No email"} · {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge color={statusColor[order.status] || "default"}>{order.status}</Badge>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.accent }}>{fmt.currency(order.total)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {order.items?.map((item, i) => (
                  <div key={i} style={{ background: T.surface2, borderRadius: 8, padding: "4px 10px", fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
                    <span>{item.emoji}</span><span>{item.name}</span><span style={{ color: T.muted }}>×{item.qty}</span>
                  </div>
                ))}
              </div>
              {order.shipment?.trackingNumber && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10, padding: "9px 11px", borderRadius: 9, background: T.accentBg, border: `1px solid ${T.accentBorder}`, fontSize: 11 }}>
                  <span aria-hidden="true">🚚</span>
                  <strong style={{ color: T.text }}>{order.shipment.provider}</strong>
                  <span style={{ color: T.muted }}>Demo tracking:</span>
                  <code style={{ color: T.accent, fontWeight: 800 }}>{order.shipment.trackingNumber}</code>
                  {order.shipment.estimatedDelivery && <span style={{ color: T.muted }}>· ETA {new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems:"center" }}>
                {ORDER_STATUSES.map(st => (
                  <button key={st} disabled={order.status === st || updating === order._id}
                    onClick={() => handleStatus(order._id, st)} style={{
                      padding: "4px 10px", borderRadius: 8, border: `1px solid ${T.border}`,
                      cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600,
                      background: order.status === st ? T.accent : "transparent",
                      color: order.status === st ? "#fff" : T.muted,
                      opacity: updating === order._id ? 0.5 : 1,
                    }}>{st}</button>
                ))}
                <ShippingLabelButton orderId={order._id} />
              </div>
            </div>
          );
        })
      }
    </div>
  );
}


function AdminUsers() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionModal, setActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(""); // "suspend" | "spam" | "activate" | "delete"
  const [statusNote, setStatusNote] = useState("");
  const [messageModal, setMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("Message from BharatCart");
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Load users from backend
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await admin.users();
      setUsers(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => !u.accountStatus || u.accountStatus === "active").length,
    suspended: users.filter(u => u.accountStatus === "suspended").length,
    spam: users.filter(u => u.accountStatus === "spam").length,
  };

  // Filter
  const filtered = users.filter(u => {
    const matchStatus =
      filterStatus === "all" ? true :
        filterStatus === "active" ? (!u.accountStatus || u.accountStatus === "active") :
          u.accountStatus === filterStatus;

    const q = search.toLowerCase();
    const matchSearch = !search ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const statusColor = {
    active: "success",
    suspended: "warning",
    spam: "danger",
  };

  const statusIcon = {
    active: "✅",
    suspended: "⏸",
    spam: "🚫",
  };

  // Open action modal
  const openAction = (user, action) => {
    setOpenUserMenu(null);
    setSelectedUser(user);
    setActionType(action);
    setStatusNote("");
    setActionModal(true);
  };

  const openMessage = (user) => {
    setOpenUserMenu(null);
    setSelectedUser(user);
    setMessageTitle("Message from BharatCart");
    setMessageText("");
    setMessageModal(true);
  };

  const sendMessage = async () => {
    if (!selectedUser || !messageTitle.trim() || !messageText.trim()) {
      toast("Title and message are required.", "error");
      return;
    }
    setSendingMessage(true);
    try {
      await notifications.send({
        userId: selectedUser._id,
        title: messageTitle.trim(),
        message: messageText.trim(),
        type: "message",
        icon: "📢",
        link: "contact",
      });
      toast(`Message sent to ${selectedUser.name}.`, "success");
      setMessageModal(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSendingMessage(false);
    }
  };

  // Confirm action
  const handleConfirm = async () => {
    if (!selectedUser) return;
    setUpdating(selectedUser._id);

    try {
      if (actionType === "delete") {
        await admin.deleteUser(selectedUser._id);
        setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
        toast(`${selectedUser.name} has been deleted.`, "success");

      } else {
        const newStatus =
          actionType === "suspend" ? "suspended" :
            actionType === "spam" ? "spam" : "active";

        const updated = await admin.updateUserStatus(selectedUser._id, newStatus, statusNote);
        setUsers(prev => prev.map(u => u._id === updated._id ? { ...u, ...updated } : u));

        toast(
          actionType === "activate"
            ? `${selectedUser.name}'s account has been activated.`
            : `${selectedUser.name}'s account has been ${newStatus} and logged out.`,
          "success"
        );
      }
      setActionModal(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdating(null);
    }
  };


  const getActionConfig = () => {
    switch (actionType) {
      case "suspend": return { title: "⏸ Suspend Account", color: T.warning, btn: "Suspend User", desc: "The user will not be able to login while suspended." };
      case "spam": return { title: "🚫 Mark as Spam", color: T.danger, btn: "Mark as Spam", desc: "This user will be flagged as spam and blocked from login." };
      case "activate": return { title: "✅ Activate Account", color: T.success, btn: "Activate", desc: "Restore full access to this user's account." };
      case "delete": return { title: "🗑 Delete Account", color: T.danger, btn: "Delete Forever", desc: "This will permanently delete the user and all their data. This cannot be undone." };
      default: return {};
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
      Loading users...
    </div>
  );

  const actionConfig = getActionConfig();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>👥 User Management</h2>
        <button onClick={loadUsers} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { icon: "👥", label: "Total Users", value: stats.total, color: T.text, key: "all" },
          { icon: "✅", label: "Active", value: stats.active, color: T.success, key: "active" },
          { icon: "⏸", label: "Suspended", value: stats.suspended, color: T.warning, key: "suspended" },
          { icon: "🚫", label: "Spam", value: stats.spam, color: T.danger, key: "spam" },
        ].map(stat => (
          <div
            key={stat.key}
            onClick={() => setFilterStatus(stat.key)}
            style={{
              background: filterStatus === stat.key ? T.accentBg : T.surface,
              border: `1px solid ${filterStatus === stat.key ? T.accentBorder : T.border}`,
              borderRadius: 14, padding: "1.1rem",
              borderTop: `3px solid ${stat.color}`,
              textAlign: "center", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 Search name, email, phone..."
          style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 180, fontSize: 12 }}>
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="spam">Spam</option>
        </Select>
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <EmptyState emoji="👥" title="No users found" subtitle="No users match your search or filter." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(user => {
            const status = user.accountStatus || "active";
            const isSuspended = status === "suspended";
            const isSpam = status === "spam";
            const isActive = status === "active";

            return (
              <div key={user._id} style={{
                background: T.surface,
                border: `1px solid ${isSuspended ? "rgba(245,158,11,0.3)" : isSpam ? "rgba(224,92,92,0.3)" : T.border}`,
                borderRadius: 14, padding: "1.25rem",
                borderLeft: `4px solid ${isSuspended ? T.warning : isSpam ? T.danger : T.success}`,
                opacity: isSuspended || isSpam ? 0.9 : 1,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>

                  {/* Left: user info */}
                  <div style={{ display: "flex", gap: 14, flex: 1, minWidth: 240 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: isSuspended ? T.warning : isSpam ? T.danger : T.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 900,
                      color: isSuspended || isSpam ? "#fff" : "#0a0908",
                    }}>
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ fontWeight: 800, fontSize: 15, color: T.text, margin: 0 }}>{user.name}</p>
                        <Badge color={statusColor[status] || "default"}>
                          {statusIcon[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>📧 {user.email}</p>
                      {user.phone && <p style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>📱 {user.phone}</p>}

                      {/* Stats row */}
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          📦 <strong style={{ color: T.text }}>{user.orderCount || 0}</strong> orders
                        </div>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          💰 <strong style={{ color: T.accent }}>{fmt.currency(user.totalSpent || 0)}</strong> spent
                        </div>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          📅 Joined {user.joined || new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>

                      {/* Status note */}
                      {user.statusNote && (
                        <p style={{ fontSize: 11, color: T.muted, marginTop: 6, fontStyle: "italic" }}>
                          📝 Note: {user.statusNote}
                        </p>
                      )}
                      {user.statusUpdatedAt && !isActive && (
                        <p style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>
                          Status updated: {new Date(user.statusUpdatedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: compact action menu */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      onClick={() => setOpenUserMenu(openUserMenu === user._id ? null : user._id)}
                      disabled={updating === user._id}
                      aria-label={`Actions for ${user.name}`}
                      title="User actions"
                      style={{
                        width: 36, height: 36, padding: 0, borderRadius: 10,
                        border: `1px solid ${openUserMenu === user._id ? T.accent : T.border}`,
                        background: openUserMenu === user._id ? T.accentBg : T.surface2,
                        color: T.text, cursor: "pointer", fontSize: 20,
                        lineHeight: 1, fontFamily: "inherit",
                      }}
                    >
                      ⋮
                    </button>

                    {openUserMenu === user._id && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 6px)", right: 0,
                        zIndex: 20, minWidth: 150, padding: 5,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 10, boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                      }}>
                        <button onClick={() => openMessage(user)} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12 }}>📢 Message</button>
                        {!isActive && <button onClick={() => openAction(user, "activate")} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.success }}>✅ Activate</button>}
                        {!isSuspended && <button onClick={() => openAction(user, "suspend")} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.warning }}>⏸ Suspend</button>}
                        {!isSpam && <button onClick={() => openAction(user, "spam")} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.danger }}>🚫 Spam</button>}
                        <button onClick={() => openAction(user, "delete")} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.danger }}>🗑 Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ACTION CONFIRMATION MODAL ── */}
      <Modal
        open={actionModal}
        onClose={() => setActionModal(false)}
        title={actionConfig.title || "Confirm Action"}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setActionModal(false)}>Cancel</Btn>,
          <Btn
            key="confirm"
            onClick={handleConfirm}
            disabled={!!updating}
            style={{
              background: actionType === "activate"
                ? T.success
                : actionType === "suspend"
                  ? T.warning
                  : T.danger,
              color: "#fff", border: "none",
            }}
          >
            {updating ? "Processing..." : actionConfig.btn}
          </Btn>,
        ]}
      >
        {selectedUser && (
          <>
            {/* User info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.surface2, borderRadius: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: T.gradient, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#0a0908",
              }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: T.text, margin: 0 }}>{selectedUser.name}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{selectedUser.email}</p>
              </div>
            </div>

            {/* Warning message */}
            <div style={{
              background: actionType === "activate"
                ? "rgba(58,184,122,0.08)"
                : actionType === "suspend"
                  ? "rgba(245,158,11,0.08)"
                  : "rgba(224,92,92,0.08)",
              border: `1px solid ${actionType === "activate"
                ? "rgba(58,184,122,0.25)"
                : actionType === "suspend"
                  ? "rgba(245,158,11,0.25)"
                  : "rgba(224,92,92,0.25)"
                }`,
              borderRadius: 10, padding: "12px 14px", marginBottom: 16,
              fontSize: 13, color: T.muted, lineHeight: 1.6,
            }}>
              {actionConfig.desc}
            </div>

            {/* Note field (not for delete) */}
            {actionType !== "delete" && (
              <FormField label="Reason / Note (optional — shown to user)">
                <Input
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder={
                    actionType === "suspend" ? "e.g. Suspicious activity detected..."
                      : actionType === "spam" ? "e.g. Multiple fraudulent orders..."
                        : "e.g. Account review completed..."
                  }
                />
              </FormField>
            )}

            {actionType === "delete" && (
              <div style={{ background: "rgba(224,92,92,0.08)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: T.danger, fontWeight: 700 }}>
                ⚠️ This action is permanent and cannot be undone!
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={messageModal}
        onClose={() => setMessageModal(false)}
        title={`📢 Message ${selectedUser?.name || "User"}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setMessageModal(false)}>Cancel</Btn>,
          <Btn key="send" onClick={sendMessage} disabled={sendingMessage || !messageText.trim()}>
            {sendingMessage ? "Sending..." : "📤 Send Message"}
          </Btn>,
        ]}
      >
        {selectedUser && (
          <>
            <div style={{ background: T.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontWeight: 800, fontSize: 14, color: T.text, margin: 0 }}>{selectedUser.name}</p>
              <p style={{ fontSize: 12, color: T.muted, margin: "4px 0 0" }}>{selectedUser.email}</p>
            </div>
            <FormField label="Notification Title *">
              <Input value={messageTitle} onChange={e => setMessageTitle(e.target.value)} placeholder="Message from BharatCart" />
            </FormField>
            <FormField label="Instruction / Message *">
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="e.g. Please verify your address before placing your next order."
                rows={6}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </FormField>
            <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>The user will see this in the notification bell.</p>
          </>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ADMIN — COUPONS
// ═══════════════════════════════════════════════════════════
function AdminCoupons() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [open, setOpen] = useState(false);
  const EMPTY = { code: "", discount: "", minOrder: "", expiry: "", active: true };
  const [form, setForm] = useState(EMPTY);
  const setF = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  useMemo(() => {
    couponsApi.list().then(cs => dispatch({ type: "SET_COUPONS", payload: cs })).catch(() => { });
  }, []);

  const save = async () => {
    if (!form.code || !form.discount || !form.expiry) { toast("Fill required fields.", "error"); return; }
    try {
      const c = await couponsApi.create({ ...form, discount: +form.discount, minOrder: +form.minOrder || 0 });
      dispatch({ type: "ADD_COUPON", payload: c });
      toast("Coupon created!", "success");
      setOpen(false);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const toggle = async (coupon) => {
    try {
      const updated = await couponsApi.update(coupon._id, { active: !coupon.active });
      dispatch({ type: "UPDATE_COUPON", payload: updated });
      toast(updated.active ? "Coupon activated" : "Coupon deactivated", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const del = async (coupon) => {
    if (!confirm("Delete coupon?")) return;
    try {
      await couponsApi.delete(coupon._id);
      dispatch({ type: "DELETE_COUPON", payload: coupon._id });
      toast("Coupon deleted", "info");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>🎟 Coupons</h2>
        <Btn onClick={() => { setForm(EMPTY); setOpen(true); }}>＋ Add Coupon</Btn>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Code", "Discount", "Min Order", "Expiry", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: T.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(state.coupons || []).map(c => (
              <tr key={c._id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, fontFamily: "monospace" }}>{c.code}</td>
                <td style={{ padding: "10px 12px" }}>{c.discount}%</td>
                <td style={{ padding: "10px 12px" }}>{fmt.currency(c.minOrder)}</td>
                <td style={{ padding: "10px 12px" }}>{c.expiry}</td>
                <td style={{ padding: "10px 12px" }}><Badge color={c.active ? "success" : "danger"}>{c.active ? "Active" : "Inactive"}</Badge></td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => toggle(c)}>{c.active ? "Deactivate" : "Activate"}</Btn>
                    <Btn variant="danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => del(c)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="🎟 Add New Coupon"
        footer={[<Btn key="c" variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>, <Btn key="s" onClick={save}>💾 Save</Btn>]}>
        <FormField label="Coupon Code *"><Input value={form.code} onChange={setF("code")} placeholder="SAVE20" style={{ textTransform: "uppercase" }} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Discount %"><Input type="number" value={form.discount} onChange={setF("discount")} placeholder="20" /></FormField>
          <FormField label="Min Order (₹)"><Input type="number" value={form.minOrder} onChange={setF("minOrder")} placeholder="500" /></FormField>
        </div>
        <FormField label="Expiry Date"><Input type="date" value={form.expiry} onChange={setF("expiry")} /></FormField>
      </Modal>
    </div>
  );
}

function AdminAds() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
 
  const ads = state.ads || [];
 
  const [showForm, setShowForm] = useState(false);
  const [editAd,   setEditAd]   = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    adsApi.adminList()
      .then(list => dispatch({ type: "SET_ADS", payload: list }))
      .catch(err => toast(`Failed to load advertisements: ${err.message}`, "error"));
  }, []);
 
  const EMPTY = {
    title:       "",
    subtitle:    "",
    badgeText:   "🔥 HOT DEAL",
    bgColor:     "#7c6fff",
    bgColor2:    "#e05c8a",
    emoji:       "🎯",
    link:        "",          // category or product id to filter
    linkLabel:   "Shop Now",
    active:      true,
    priority:    1,           // 1=highest shown first
    type:        "banner",    // "banner" | "card" | "strip"
    position:    "top",       // "top" | "middle" | "bottom" (in shop grid)
  };
 
  const [form, setForm] = useState(EMPTY);
  const setF = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const setFB = f => v => setForm(p => ({ ...p, [f]: v }));
 
  const openAdd = () => { setEditAd(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (ad) => { setEditAd(ad); setForm({ ...EMPTY, ...ad }); setShowForm(true); };
 
  const handleSave = async () => {
    if (!form.title.trim()) { toast("Ad title is required.", "error"); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      const saved = editAd
        ? await adsApi.update(editAd._id || editAd.id, payload)
        : await adsApi.create(payload);
      dispatch({ type: editAd ? "UPDATE_AD" : "ADD_AD", payload: saved });
      toast(editAd ? "Advertisement updated!" : "Advertisement created!", "success");
      setShowForm(false);
      setEditAd(null);
    } catch (err) {
      toast(`Could not save advertisement: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };
 
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      await adsApi.remove(id);
      dispatch({ type: "DELETE_AD", payload: id });
      toast("Advertisement deleted.", "info");
    } catch (err) {
      toast(`Could not delete advertisement: ${err.message}`, "error");
    }
  };
 
  const handleToggle = async (ad) => {
    try {
      const payload = { ...ad, active: !ad.active };
      delete payload.id;
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      const updated = await adsApi.update(ad._id || ad.id, payload);
      dispatch({ type: "UPDATE_AD", payload: updated });
      toast(ad.active ? "Ad paused." : "Ad activated!", "success");
    } catch (err) {
      toast(`Could not update advertisement: ${err.message}`, "error");
    }
  };
 
  const CATEGORIES_LIST = ["Electronics", "Fashion", "Sports", "Books", "Home", "Beauty"];
 
  // Live preview
  const Preview = () => (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      background: `linear-gradient(135deg, ${form.bgColor}, ${form.bgColor2})`,
      padding: form.type === "strip" ? "12px 20px" : "1.5rem",
      display: "flex",
      alignItems: form.type === "strip" ? "center" : "flex-start",
      justifyContent: "space-between", gap: 12,
      flexDirection: form.type === "strip" ? "row" : "column",
    }}>
      {form.type !== "strip" && (
        <div style={{ fontSize: form.type === "card" ? 44 : 36 }}>{form.emoji}</div>
      )}
      <div style={{ flex: 1 }}>
        {form.badgeText && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: "#fff",
            background: "rgba(0,0,0,0.25)", borderRadius: 20,
            padding: "3px 10px", display: "inline-block", marginBottom: 6,
            letterSpacing: "0.06em",
          }}>{form.badgeText}</span>
        )}
        <p style={{ fontSize: form.type === "strip" ? 14 : 18, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          {form.title || "Ad Title"}
        </p>
        {form.subtitle && form.type !== "strip" && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
            {form.subtitle}
          </p>
        )}
      </div>
      <div style={{
        background: "#fff", color: form.bgColor,
        borderRadius: 10, padding: form.type === "strip" ? "6px 14px" : "8px 18px",
        fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0,
        whiteSpace: "nowrap",
      }}>
        {form.linkLabel || "Shop Now"}
      </div>
    </div>
  );
 
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>📢 Advertisements</h2>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            Create banners & promotions shown to users on the shop page.
          </p>
        </div>
        <button onClick={openAdd} style={{ ...s.btn("primary"), padding: "10px 20px", fontSize: 13 }}>
          + Create Ad
        </button>
      </div>
 
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { icon: "📢", label: "Total Ads",   value: ads.length,                                  color: T.text   },
          { icon: "✅", label: "Active",       value: ads.filter(a => a.active).length,             color: T.success},
          { icon: "⏸", label: "Paused",       value: ads.filter(a => !a.active).length,            color: T.muted  },
        ].map(stat => (
          <div key={stat.label} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "1.1rem 1.25rem",
            borderTop: `3px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
 
      {/* ── CREATE / EDIT FORM ── */}
      {showForm && (
        <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem", border: `2px solid ${T.accentBorder}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.5rem" }}>
            {editAd ? "✏️ Edit Advertisement" : "➕ Create New Advertisement"}
          </h3>
 
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
 
            {/* Left: form fields */}
            <div>
              <FormField label="Ad Title *">
                <Input value={form.title} onChange={setF("title")} placeholder="e.g. Mega Sale — Up to 50% Off" />
              </FormField>
              <FormField label="Subtitle">
                <Input value={form.subtitle} onChange={setF("subtitle")} placeholder="e.g. Limited time offer on all electronics" />
              </FormField>
              <FormField label="Badge Text">
                <Input value={form.badgeText} onChange={setF("badgeText")} placeholder="e.g. 🔥 HOT DEAL" />
              </FormField>
              <FormField label="Button Label">
                <Input value={form.linkLabel} onChange={setF("linkLabel")} placeholder="e.g. Shop Now" />
              </FormField>
              <FormField label="Emoji / Icon">
                <Input value={form.emoji} onChange={setF("emoji")} placeholder="🎯" />
              </FormField>
 
              {/* Link target */}
              <FormField label="Link To (click opens this category)">
                <select
                  value={form.link}
                  onChange={setF("link")}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                >
                  <option value="">All Products</option>
                  {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
 
              {/* Type */}
              <FormField label="Ad Type">
                <div style={{ display: "flex", gap: 8 }}>
                  {[["banner", "🖼 Banner"], ["card", "🃏 Card"], ["strip", "📏 Strip"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFB("type")(v)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                      cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                      background: form.type === v ? T.accent : T.surface2,
                      color:      form.type === v ? "#fff"   : T.muted,
                    }}>{l}</button>
                  ))}
                </div>
              </FormField>
 
              {/* Position in grid */}
              <FormField label="Position in Shop">
                <div style={{ display: "flex", gap: 8 }}>
                  {[["top", "⬆ Top"], ["middle", "↔ Middle"], ["bottom", "⬇ Bottom"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFB("position")(v)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                      cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                      background: form.position === v ? T.accent : T.surface2,
                      color:      form.position === v ? "#fff"   : T.muted,
                    }}>{l}</button>
                  ))}
                </div>
              </FormField>
 
              {/* Priority */}
              <FormField label={`Priority: ${form.priority} (1 = highest)`}>
                <input
                  type="range" min={1} max={10} value={form.priority}
                  onChange={e => setFB("priority")(Number(e.target.value))}
                  style={{ width: "100%", accentColor: T.accent }}
                />
              </FormField>
            </div>
 
            {/* Right: colors + preview */}
            <div>
              {/* Colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
                <FormField label="Background Color 1">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.bgColor}
                      onChange={e => setFB("bgColor")(e.target.value)}
                      style={{ width: 44, height: 38, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
                    />
                    <Input value={form.bgColor} onChange={setF("bgColor")} style={{ flex: 1 }} />
                  </div>
                </FormField>
                <FormField label="Background Color 2">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.bgColor2}
                      onChange={e => setFB("bgColor2")(e.target.value)}
                      style={{ width: 44, height: 38, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
                    />
                    <Input value={form.bgColor2} onChange={setF("bgColor2")} style={{ flex: 1 }} />
                  </div>
                </FormField>
              </div>
 
              {/* Color presets */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted, marginBottom: 8 }}>
                Quick Color Themes
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
                {[
                  ["#7c6fff", "#e05c8a", "Purple Rose"],
                  ["#e05c5c", "#d4a843", "Fire Gold"],
                  ["#0f3460", "#16213e", "Navy Dark"],
                  ["#2a9d6e", "#1a6b4a", "Forest"],
                  ["#f59e0b", "#ef4444", "Sunset"],
                  ["#3b82f6", "#8b5cf6", "Ocean"],
                ].map(([c1, c2, label]) => (
                  <button key={label} onClick={() => { setFB("bgColor")(c1); setFB("bgColor2")(c2); }} style={{
                    width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    boxShadow: form.bgColor === c1 ? `0 0 0 3px ${T.accent}` : "none",
                    transition: "box-shadow 0.2s",
                  }} title={label} />
                ))}
              </div>
 
              {/* Live preview */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted, marginBottom: 8 }}>
                Live Preview
              </p>
              <Preview />
 
              {/* Active toggle */}
              <div
                onClick={() => setFB("active")(!form.active)}
                style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1.25rem", cursor: "pointer" }}
              >
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: form.active ? T.success : T.border,
                  position: "relative", transition: "background 0.2s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 2,
                    left: form.active ? 22 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </div>
                <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
                  {form.active ? "Active — users will see this ad" : "Paused — hidden from users"}
                </span>
              </div>
            </div>
          </div>
 
          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}` }}>
            <Btn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
              {saving ? "Saving..." : editAd ? "💾 Update Advertisement" : "📢 Publish Advertisement"}
            </Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditAd(null); }} style={{ padding: "8px 24px" }}>
              Cancel
            </Btn>
          </div>
        </div>
      )}
 
      {/* ── ADS LIST ── */}
      {ads.length === 0 && !showForm ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: T.surface, borderRadius: 16, border: `2px dashed ${T.border}`,
        }}>
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.3 }}>📢</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No advertisements yet</p>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Create your first ad to promote products on the shop page.</p>
          <Btn onClick={openAdd} style={{ padding: "10px 28px" }}>+ Create First Ad</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[...ads].sort((a, b) => (a.priority || 5) - (b.priority || 5)).map(ad => (
            <div key={ad._id || ad.id} style={{
              ...s.card, padding: "1.25rem",
              borderLeft: `4px solid ${ad.active ? T.success : T.border}`,
              opacity: ad.active ? 1 : 0.7,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
 
                {/* Ad preview (small) */}
                <div style={{ flex: "0 0 260px", minWidth: 200 }}>
                  <div style={{
                    borderRadius: 12, overflow: "hidden",
                    background: `linear-gradient(135deg, ${ad.bgColor}, ${ad.bgColor2})`,
                    padding: ad.type === "strip" ? "10px 16px" : "1rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  }}>
                    {ad.type !== "strip" && <span style={{ fontSize: 28 }}>{ad.emoji}</span>}
                    <div style={{ flex: 1 }}>
                      {ad.badgeText && <p style={{ fontSize: 9, color: "#fff", background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "2px 8px", display: "inline-block", marginBottom: 4, letterSpacing: "0.05em", fontWeight: 700 }}>{ad.badgeText}</p>}
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: 0 }}>{ad.title}</p>
                      {ad.subtitle && ad.type !== "strip" && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", margin: "3px 0 0" }}>{ad.subtitle}</p>}
                    </div>
                    <div style={{ background: "#fff", color: ad.bgColor, borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                      {ad.linkLabel}
                    </div>
                  </div>
                </div>
 
                {/* Ad info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{ad.title}</span>
                    <Badge color={ad.active ? "success" : "default"}>{ad.active ? "✅ Active" : "⏸ Paused"}</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: T.muted }}>
                    <span>🃏 Type: <strong style={{ color: T.text }}>{ad.type}</strong></span>
                    <span>📍 Position: <strong style={{ color: T.text }}>{ad.position}</strong></span>
                    <span>⚡ Priority: <strong style={{ color: T.accent }}>{ad.priority}</strong></span>
                    <span>🔗 Links to: <strong style={{ color: T.text }}>{ad.link || "All Products"}</strong></span>
                  </div>
                  {ad.createdAt && (
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                      📅 Created {new Date(ad.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
 
                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleToggle(ad)} style={{ ...s.btn(ad.active ? "ghost" : "success"), padding: "6px 14px", fontSize: 12 }}>
                    {ad.active ? "⏸ Pause" : "▶ Activate"}
                  </button>
                  <button onClick={() => openEdit(ad)} style={{ ...s.btn("ghost"), padding: "6px 14px", fontSize: 12 }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(ad._id || ad.id)} style={{ ...s.btn("danger"), padding: "6px 14px", fontSize: 12 }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ onLogout }) {
  const [activeSection, setActiveSection] = useState(() => readPageFromUrl("dash", ADMIN_PAGE_IDS));
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const sectionMap = {
    dash: <AdminDashboard />,
    products: <AdminProducts />,
    orders: <AdminOrders />,
    returns: <AdminReturns />,
    payments: <AdminPayments />,
    users: <AdminUsers />,
    analytics: <AdminAnalytics />,
    coupons: <AdminCoupons />,
    contacts: <AdminContacts />,
    reviews: <AdminReviews />,
    sales: <AdminSales />,
    wallet: <AdminWallets />,
    ads: <AdminAds />,
     //bankRefunds: <AdminRefunds />,
    bankVerify: <AdminBankVerification />,
    //refunds:     <AdminRefunds />,
  };
  const handleNavigate = (section) => {
    if (!sectionMap[section]) return;
    setActiveSection(section);
    writePageToUrl(section);
  };

  useEffect(() => {
    const handlePopState = () => setActiveSection(readPageFromUrl("dash", ADMIN_PAGE_IDS));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar isAdmin={true} user={state.currentUser} cartCount={0} activeSection="" onNavigate={() => { }} onCartOpen={() => { }} onLogout={onLogout} />
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: 220, background: T.surface, borderRight: `1px solid ${T.border}`, padding: "1.5rem 1rem", flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", padding: "0 8px" }}>Navigation</p>
          {ADMIN_SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => handleNavigate(sec.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
              cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 500, marginBottom: 2, textAlign: "left",
              background: activeSection === sec.id ? "rgba(124,111,255,0.12)" : "transparent",
              color: activeSection === sec.id ? T.accent : T.muted, transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 16 }}>{sec.icon}</span> {sec.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto", overflowX: "hidden" }}>
          {sectionMap[activeSection] || sectionMap.dash}
        </div>
      </div>
    </div>
  );
}


function AdminAnalytics() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [activeChart, setActiveChart] = useState("revenue");

  const load = async () => {
    setLoading(true);
    try {
      const [ov, rev, cat, top, cust, status] = await Promise.all([
        analytics.overview(),
        analytics.revenueChart(period),
        analytics.categoryChart(),
        analytics.topProducts(),
        analytics.customerChart(),
        analytics.orderStatus(),
      ]);
      setOverview(ov);
      setRevenueData(rev);
      setCategoryData(cat);
      setTopProducts(top);
      setCustomerData(cust);
      setOrderStatus(status);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
      Loading analytics...
    </div>
  );

  if (!overview) return null;

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const maxOrders = Math.max(...revenueData.map(d => d.orders), 1);
  const maxCat = Math.max(...categoryData.map(d => d.revenue), 1);
  const maxCust = Math.max(...customerData.map(d => d.newUsers), 1);
  const totalOrds = orderStatus.reduce((s, o) => s + o.count, 0);

  const statusColors = {
    Processing: "#608cdc",
    Shipped: "#f59e0b",
    "Out for Delivery": "#f59e0b",
    Delivered: T.success,
    Cancelled: T.danger,
  };

  const GrowthBadge = ({ value }) => (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      color: value >= 0 ? T.success : T.danger,
      background: value >= 0 ? "rgba(42,157,110,0.12)" : "rgba(224,92,92,0.12)",
      padding: "2px 8px",
      borderRadius: 10,
      marginLeft: 6,
    }}>
      {value >= 0 ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>📊 Analytics Dashboard</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        {[
          {
            icon: "💰", label: "Total Revenue", value: fmt.currency(overview.revenue),
            sub: `This month: ${fmt.currency(overview.thisMonthRevenue)}`,
            growth: overview.revenueGrowth, color: T.accent,
          },
          {
            icon: "📦", label: "Total Orders", value: overview.totalOrders,
            sub: `This month: ${overview.thisMonthOrders}`,
            color: "#608cdc",
          },
          {
            icon: "👥", label: "Customers", value: overview.totalUsers,
            sub: `New this month: ${overview.newUsersThisMonth}`,
            growth: overview.userGrowth, color: T.success,
          },
          {
            icon: "📊", label: "Avg Order", value: fmt.currency(Math.round(overview.avgOrderValue)),
            sub: `Delivered: ${overview.deliveredCount}`,
            color: T.warning,
          },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "1.25rem",
            borderTop: `3px solid ${kpi.color}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: kpi.color, letterSpacing: "-0.02em", marginBottom: 4 }}>
              {kpi.value}
              {kpi.growth !== undefined && <GrowthBadge value={kpi.growth} />}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: T.muted }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { icon: "📦", label: "Products", value: overview.totalProducts, color: T.text },
          { icon: "⚠️", label: "Low Stock", value: overview.lowStockCount, color: T.warning },
          { icon: "❌", label: "Out of Stock", value: overview.outOfStock, color: T.danger },
          { icon: "↩️", label: "Pending Returns", value: overview.pendingReturns, color: T.rose },
        ].map(item => (
          <div key={item.label} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "1rem", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { id: "revenue", label: "📈 Revenue" },
          { id: "orders", label: "📦 Orders" },
          { id: "customers", label: "👥 Customers" },
          { id: "category", label: "🥧 Categories" },
          { id: "status", label: "🎯 Order Status" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveChart(tab.id)} style={{
            padding: "7px 16px",
            borderRadius: 20,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
            background: activeChart === tab.id ? T.accent : T.surface2,
            color: activeChart === tab.id ? "#fff" : T.muted,
            transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}

        {/* Period selector for revenue/orders */}
        {(activeChart === "revenue" || activeChart === "orders") && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)} style={{
                padding: "7px 12px",
                borderRadius: 20,
                border: `1px solid ${T.border}`,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "inherit",
                background: period === d ? T.surface2 : "transparent",
                color: period === d ? T.text : T.muted,
              }}>{d}d</button>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Revenue Chart */}
        {activeChart === "revenue" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>📈 Revenue Trend — Last {period} Days</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>
                Total: {fmt.currency(revenueData.reduce((s, d) => s + d.revenue, 0))}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 180, overflowX: "auto" }}>
              {revenueData.map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    borderRadius: "4px 4px 0 0",
                    background: d.revenue > 0
                      ? `linear-gradient(180deg, ${T.accent}, ${T.rose})`
                      : T.surface2,
                    height: `${Math.max(4, (d.revenue / maxRevenue) * 160)}px`,
                    minHeight: 4,
                    transition: "height 0.5s ease",
                    cursor: "pointer",
                  }}
                    title={`${d.date}: ${fmt.currency(d.revenue)}`}
                  />
                  {revenueData.length <= 14 && (
                    <div style={{ fontSize: 8, color: T.muted, textAlign: "center", transform: "rotate(-45deg)" }}>
                      {d.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Orders Chart */}
        {activeChart === "orders" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>📦 Orders — Last {period} Days</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#608cdc" }}>
                Total: {revenueData.reduce((s, d) => s + d.orders, 0)} orders
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 180, overflowX: "auto" }}>
              {revenueData.map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    borderRadius: "4px 4px 0 0",
                    background: d.orders > 0 ? "#608cdc" : T.surface2,
                    height: `${Math.max(4, (d.orders / maxOrders) * 160)}px`,
                    minHeight: 4,
                    transition: "height 0.5s ease",
                  }}
                    title={`${d.date}: ${d.orders} orders`}
                  />
                  {revenueData.length <= 14 && (
                    <div style={{ fontSize: 8, color: T.muted, transform: "rotate(-45deg)" }}>{d.date}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Customer Chart */}
        {activeChart === "customers" && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.25rem" }}>
              👥 New Customers — Last 6 Months
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {customerData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 12, color: T.muted, width: 80, flexShrink: 0 }}>{d.month}</div>
                  <div style={{ flex: 1, height: 28, background: T.surface2, borderRadius: 8, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      height: "100%",
                      width: `${maxCust > 0 ? (d.newUsers / maxCust) * 100 : 0}%`,
                      background: `linear-gradient(90deg, ${T.success}, #60d394)`,
                      borderRadius: 8,
                      transition: "width 0.5s ease",
                      minWidth: d.newUsers > 0 ? 4 : 0,
                    }} />
                    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.muted, fontWeight: 600 }}>
                      {d.newUsers} users
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, width: 80, textAlign: "right" }}>
                    {fmt.currency(d.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Category Chart */}
        {activeChart === "category" && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.25rem" }}>
              🥧 Revenue by Category
            </h3>
            {categoryData.length === 0 ? (
              <p style={{ color: T.muted, textAlign: "center", padding: "2rem" }}>No data yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {categoryData.map((cat, i) => {
                  const pct = maxCat > 0 ? Math.round((cat.revenue / maxCat) * 100) : 0;
                  const total = categoryData.reduce((s, c) => s + c.revenue, 0);
                  const share = total > 0 ? Math.round((cat.revenue / total) * 100) : 0;
                  const colors = [T.accent, "#608cdc", T.success, T.warning, T.danger, T.rose];
                  const color = colors[i % colors.length];

                  return (
                    <div key={cat.category}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cat.category}</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{fmt.currency(cat.revenue)}</span>
                          <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{share}% · {cat.units} units</span>
                        </div>
                      </div>
                      <div style={{ height: 8, background: T.surface2, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: color,
                          borderRadius: 4,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Order Status Chart */}
        {activeChart === "status" && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.25rem" }}>
              🎯 Order Status Breakdown
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
              {/* Donut-style visual */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orderStatus.map(item => {
                  const pct = totalOrds > 0 ? Math.round((item.count / totalOrds) * 100) : 0;
                  const color = statusColors[item.status] || T.muted;
                  return (
                    <div key={item.status}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{item.status}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{item.count}</span>
                          <span style={{ fontSize: 11, color: T.muted, marginLeft: 6 }}>({pct}%)</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: T.surface2, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: color,
                          borderRadius: 3,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div style={{ background: T.surface2, borderRadius: 16, padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: T.accent, letterSpacing: "-0.04em" }}>
                  {totalOrds}
                </div>
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Total Orders</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.success }}>
                  {overview.deliveredCount}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Delivered</div>
                <div style={{ fontSize: 15, color: T.danger, fontWeight: 700 }}>
                  {overview.cancelledCount} Cancelled
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Top Products Table */}
      <div style={{ ...s.card, padding: "1.5rem" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.25rem" }}>
          🏆 Top 10 Selling Products
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["#", "Product", "Sales", "Revenue", "Rating", "Stock"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    color: T.muted, fontWeight: 600, fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: i < 3 ? T.accent : T.muted }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{p.emoji}</span>
                      <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: T.text }}>{p.sales}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: T.accent }}>{fmt.currency(p.revenue)}</td>
                  <td style={{ padding: "10px 12px", color: "#f59e0b", fontWeight: 700 }}>★ {p.rating}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      color: p.stock === 0 ? T.danger : p.stock < 10 ? T.warning : T.success,
                      fontWeight: 700,
                    }}>
                      {p.stock === 0 ? "Out" : p.stock < 10 ? `⚠ ${p.stock}` : p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// function AdminReturns() {
//   const { state } = useApp();
//   const toast = useToast();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);
//   const [allReturns, setAllReturns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(null);
//   const [noteModal, setNoteModal] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [adminNote, setAdminNote] = useState("");
//   const [newStatus, setNewStatus] = useState("");
//   const [refundMethod, setRefundMethod] = useState("wallet");

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await returns_api.all();
//         setAllReturns(data);
//       } catch (err) {
//         toast(err.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const openUpdate = (ret, status) => {
//     setSelected(ret);
//     setNewStatus(status);
//     setAdminNote(ret.adminNote || "");
//     setRefundMethod("wallet");
//     setNoteModal(true);
//   };

//   const handleUpdate = async () => {
//     setUpdating(selected._id);
//     try {
//       const updateData = { status: newStatus, adminNote };
//       if (newStatus === "Refunded") {
//         updateData.refundMethod = refundMethod;
//       }
//       const updated = await returns_api.update(selected._id, updateData);
//       setAllReturns(prev => prev.map(r => r._id === updated._id ? updated : r));
//       toast(`Return ${newStatus}! Refund will be processed to ${refundMethod}${refundMethod === "bank" ? " (within 3-5 days)" : ""}`, "success");
//       setNoteModal(false);
//     } catch (err) {
//       toast(err.message, "error");
//     } finally {
//       setUpdating(null);
//     }
//   };

//   const statusColor = { Pending: "warning", Approved: "success", Rejected: "danger", Refunded: "success" };
//   const RETURN_STATUSES = ["Pending", "Approved", "Rejected", "Refunded"];

//   if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: getT(state.theme).muted }}>Loading returns…</div>;

//   return (
//     <div>
//       <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: T.text }}>
//         ↩️ Return Requests ({allReturns.length})
//       </h2>

//       {allReturns.length === 0
//         ? <EmptyState emoji="↩️" title="No return requests" subtitle="Customer return requests will appear here." />
//         : allReturns.map(r => (
//           <div key={r._id} style={{ ...s.card, padding: "1.25rem", marginBottom: 12 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
//               <div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
//                   <span style={{ fontSize: 24 }}>{r.product?.emoji}</span>
//                   <div>
//                     <p style={{ fontWeight: 700, fontSize: 14 }}>{r.product?.name}</p>
//                     <p style={{ fontSize: 12, color: T.muted }}>
//                       Qty: {r.product?.qty} · Refund: <strong style={{ color: T.accent }}>{fmt.currency(r.refundAmount)}</strong>
//                     </p>
//                   </div>
//                 </div>
//                 <p style={{ fontSize: 12, color: T.muted }}>
//                   👤 {r.user?.name} ({r.user?.email})
//                 </p>
//                 <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
//                   📅 {new Date(r.createdAt).toLocaleDateString("en-IN")}
//                 </p>
//                 <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
//                   Reason: <strong>{r.reason}</strong>
//                 </p>
//                 {r.description && (
//                   <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Note: {r.description}</p>
//                 )}
//               </div>
//               <Badge color={statusColor[r.status] || "default"}>{r.status}</Badge>
//             </div>

//             {r.adminNote && (
//               <div style={{ background: T.surface2, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: T.muted, marginBottom: 10 }}>
//                 <span style={{ fontWeight: 700 }}>Your note: </span>{r.adminNote}
//               </div>
//             )}

//             {/* Status buttons */}
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//               {RETURN_STATUSES.map(st => (
//                 <button key={st}
//                   disabled={r.status === st || updating === r._id}
//                   onClick={() => openUpdate(r, st)}
//                   style={{
//                     padding: "5px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
//                     cursor: r.status === st ? "default" : "pointer",
//                     fontSize: 12, fontFamily: "inherit", fontWeight: 600,
//                     background: r.status === st ? T.accent : "transparent",
//                     color: r.status === st ? "#fff" : T.muted,
//                     opacity: updating === r._id ? 0.5 : 1,
//                   }}>{st}</button>
//               ))}
//             </div>
//           </div>
//         ))
//       }

//       {/* Admin note modal */}
//       <Modal open={noteModal} onClose={() => setNoteModal(false)} title={`Set Status: ${newStatus}`}
//         footer={[
//           <Btn key="cancel" variant="ghost" onClick={() => setNoteModal(false)}>Cancel</Btn>,
//           <Btn key="save" onClick={handleUpdate} disabled={!!updating}>
//             {updating ? "Updating…" : `Confirm ${newStatus}`}
//           </Btn>,
//         ]}>
//         {newStatus === "Refunded" && (
//           <div style={{ marginBottom: 16 }}>
//             <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: T.muted }}>
//               💰 Refund Method
//             </p>
//             <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//               <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
//                 <input
//                   type="radio"
//                   name="refund-method"
//                   value="wallet"
//                   checked={refundMethod === "wallet"}
//                   onChange={e => setRefundMethod(e.target.value)}
//                   style={{ cursor: "pointer" }}
//                 />
//                 <span style={{ fontSize: 13 , color: T.muted }}>
//                   <strong>Wallet</strong> - Instant credit
//                 </span>
//               </label>
//               <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
//                 <input
//                   type="radio"
//                   name="refund-method"
//                   value="bank"
//                   checked={refundMethod === "bank"}
//                   onChange={e => setRefundMethod(e.target.value)}
//                   style={{ cursor: "pointer" }}
//                 />
//                 <span style={{ fontSize: 13 , color: T.muted }}>
//                   <strong>Bank</strong> - 3-5 business days
//                 </span>
//               </label>
//             </div>
//             {refundMethod === "bank" && (
//               <p style={{ fontSize: 12, color: T.muted, marginTop: 8, padding: "8px 12px", background: T.surface2, borderRadius: 6 }}>
//                 ℹ️ User must have bank details saved. Refund will be marked as pending.
//               </p>
//             )}
//           </div>
//         )}
//         <FormField label="Admin Note (shown to customer)">
//           <textarea
//             value={adminNote}
//             onChange={e => setAdminNote(e.target.value)}
//             placeholder={
//               newStatus === "Approved" ? "Your return has been approved. Please ship the item back..." :
//                 newStatus === "Rejected" ? "We cannot process this return because..." :
//                   newStatus === "Refunded" ? `Your refund has been processed to your ${refundMethod === "wallet" ? "wallet" : "bank account"}...` :
//                     "Add a note for the customer..."
//             }
//             rows={4}
//             style={{
//               width: "100%", padding: "10px 14px", borderRadius: 10,
//               border: `1px solid ${T.border}`, background: T.surface2,
//               color: T.text, fontSize: 13, fontFamily: "inherit",
//               resize: "vertical", outline: "none", boxSizing: "border-box",
//             }}
//           />
//         </FormField>
//       </Modal>
//     </div>
//   );
// }

function AdminReturns() {
  const { state } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
 
  const [allReturns, setAllReturns] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [noteModal,  setNoteModal]  = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [adminNote,  setAdminNote]  = useState("");
  const [newStatus,  setNewStatus]  = useState("");
  const [viewMode, setViewMode] = useState("returns");
  const [returnFilter, setReturnFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [bankRefunds, setBankRefunds] = useState([]);
  const [bankRefundStatus, setBankRefundStatus] = useState("Pending");
  const [refundAction, setRefundAction] = useState(null);
  const [refundActionStatus, setRefundActionStatus] = useState("Processing");
  const [refundTransactionId, setRefundTransactionId] = useState("");
  const [refundAdminNote, setRefundAdminNote] = useState("");
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [updatingRefund, setUpdatingRefund] = useState(false);
 
  // Refund method states
  const [refundMethod,  setRefundMethod]  = useState("wallet");
  const [userBanks,     setUserBanks]     = useState([]);
  const [selectedBankId,setSelectedBankId]= useState("");
  const [loadingBanks,  setLoadingBanks]  = useState(false);
 
  useEffect(() => {
    (async()=>{
      try {
        const data = await returns_api.all();
        setAllReturns(data);
      } catch(err) { toast(err.message,"error"); }
      finally { setLoading(false); }
    })();
  },[]);

  const loadBankRefunds = async () => {
    setLoadingRefunds(true);
    try {
      const result = await walletApi.getBankRefunds(bankRefundStatus);
      setBankRefunds(result.refunds || []);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoadingRefunds(false);
    }
  };

  useEffect(() => {
    if (viewMode === "payouts") loadBankRefunds();
  }, [viewMode, bankRefundStatus]);

  const matchingReturns = allReturns.filter(ret => {
    const statusMatch = returnFilter === "all" || ret.status === returnFilter;
    const query = search.trim().toLowerCase();
    const queryMatch = !query || [
      ret.product?.name, ret.user?.name, ret.user?.email, ret.reason,
      ret.order?.toString?.(), ret._id,
    ].some(value => (value || "").toString().toLowerCase().includes(query));
    return statusMatch && queryMatch;
  });
  const returnCounts = {
    all: allReturns.length,
    Pending: allReturns.filter(ret => ret.status === "Pending").length,
    Approved: allReturns.filter(ret => ret.status === "Approved").length,
    Rejected: allReturns.filter(ret => ret.status === "Rejected").length,
    Refunded: allReturns.filter(ret => ret.status === "Refunded").length,
  };
 
  const openUpdate = async (ret, status) => {
    setSelected(ret);
    setNewStatus(status);
    setAdminNote(ret.adminNote||"");
    setRefundMethod("wallet");
    setSelectedBankId("");
    setUserBanks([]);
 
    // If setting to Refunded, load user's verified bank accounts
    if (status==="Refunded") {
      setLoadingBanks(true);
      try {
        // fetch ALL verified bank accounts (across all users) from the
        // BankAccount collection — NOT the old admin.getBankDetails API
        const res = await bankApi.adminAllAccounts("verified");
        const banks = Array.isArray(res) ? res : (res?.accounts || []);
 
        const uid = (ret.user?._id || ret.user)?.toString();
        const userVerifiedBanks = banks.filter(b => {
          const bUid = (b.user?._id || b.user)?.toString();
          return bUid === uid;
        });
 
        setUserBanks(userVerifiedBanks);
        const primary = userVerifiedBanks.find(b=>b.isPrimary) || userVerifiedBanks[0];
        if (primary) setSelectedBankId(primary._id);
 
        if (userVerifiedBanks.length === 0) {
          // Default to wallet if no verified bank found — avoids the
          // "User bank details not found" 400 error from the old API
          setRefundMethod("wallet");
        }
      } catch(err) {
        console.error("Failed to load user banks:", err.message);
        toast("Could not load bank accounts — defaulting to wallet refund.", "info");
        setRefundMethod("wallet");
      } finally {
        setLoadingBanks(false);
      }
    }
 
    setNoteModal(true);
  };
 
  const handleUpdate = async () => {
    setUpdating(selected._id);
    try {
      const updateData = { status: newStatus, adminNote };
 
      if (newStatus==="Refunded") {
        updateData.refundMethod = refundMethod;
 
        if (refundMethod==="bank") {
          const bank = userBanks.find(b=>b._id===selectedBankId);
          if (!bank) { toast("Select a verified bank account or choose wallet refund.", "error"); setUpdating(null); return; }
          updateData.bankAccountId = selectedBankId;
          updateData.bankDetails = bank ? {
            method:"bank",
            accountName:   bank.accountName,
            accountNumber: bank.accountNumber,
            ifscCode:      bank.ifscCode,
            bankName:      bank.bankName,
          } : null;
        }
 
      }
 
      const updated = await returns_api.update(selected._id, updateData);
      setAllReturns(prev => prev.map(r => r._id===updated._id ? updated : r));
      toast(
        newStatus==="Refunded"
          ? refundMethod==="wallet"
            ? "✅ Refund credited to user's wallet instantly!"
            : `✅ Bank payout queued for processing.`
          : `Return status updated to ${newStatus}!`,
        "success"
      );
      setNoteModal(false);
    } catch(err) { toast(err.message,"error"); }
    finally { setUpdating(null); }
  };
 
  const statusColor = { Pending:"warning", Approved:"success", Rejected:"danger", Refunded:"success" };
  const RETURN_STATUSES = ["Pending","Approved","Rejected","Refunded"];

  const openRefundAction = (refund, status) => {
    setRefundAction(refund);
    setRefundActionStatus(status);
    setRefundTransactionId(refund.bankDetails?.transactionId || "");
    setRefundAdminNote(refund.adminNote || "");
  };

  const saveRefundAction = async () => {
    if (!refundAction) return;
    if (refundActionStatus === "Completed" && !refundTransactionId.trim()) {
      toast("Enter the bank transaction reference before completing this payout.", "error");
      return;
    }
    setUpdatingRefund(true);
    try {
      await walletApi.updateBankRefund(
        refundAction._id,
        refundActionStatus,
        refundTransactionId.trim(),
        refundAdminNote.trim()
      );
      toast(`Bank payout marked ${refundActionStatus.toLowerCase()}.`, "success");
      setRefundAction(null);
      await loadBankRefunds();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdatingRefund(false);
    }
  };
 
  if (loading) return <div style={{ textAlign:"center", padding:"4rem", color:T.muted }}>Loading returns…</div>;
 
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:"1.25rem" }}>
        <div>
          <h2 style={{ fontSize:24, fontWeight:850, marginBottom:4, color:T.text }}>
            Returns &amp; refunds
          </h2>
          <p style={{ fontSize:13, color:T.muted, margin:0 }}>Review customer requests and track outgoing bank payouts.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["returns", "Return requests"], ["payouts", "Bank payouts"]].map(([mode, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              ...s.btn(viewMode === mode ? "primary" : "ghost"),
              padding:"9px 14px", fontSize:12,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {viewMode === "returns" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(135px, 1fr))", gap:10, marginBottom:14 }}>
            {[
              ["All requests", returnCounts.all, "all", T.accent],
              ["Needs review", returnCounts.Pending, "Pending", T.warning],
              ["Approved", returnCounts.Approved, "Approved", T.info],
              ["Refund initiated", returnCounts.Refunded, "Refunded", T.success],
            ].map(([label, value, key, color]) => (
              <button key={key} onClick={() => setReturnFilter(key)} style={{
                ...s.card, textAlign:"left", padding:"12px 14px", cursor:"pointer",
                borderColor:returnFilter===key ? color : T.border,
                borderTop:`3px solid ${color}`,
              }}>
                <span style={{ display:"block", fontSize:11, color:T.muted, fontWeight:650 }}>{label}</span>
                <strong style={{ display:"block", fontSize:23, color:T.text, marginTop:4 }}>{value}</strong>
              </button>
            ))}
          </div>
          <div style={{ ...s.card, padding:12, marginBottom:14, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <Input aria-label="Search return requests" placeholder="Search customer, product, order or reason..." value={search} onChange={event=>setSearch(event.target.value)} style={{ flex:"1 1 260px" }} />
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {RETURN_STATUSES.map(status => (
                <button key={status} onClick={() => setReturnFilter(status)} style={{
                  ...s.btn(returnFilter===status ? "primary" : "ghost"),
                  padding:"7px 10px", fontSize:11,
                }}>{status} · {returnCounts[status]}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === "returns" && (allReturns.length===0
        ? <EmptyState emoji="↩️" title="No return requests" subtitle="Customer return requests will appear here." />
        : matchingReturns.length === 0
          ? <EmptyState emoji="⌕" title="No matching requests" subtitle="Try a different search or status filter." />
          : matchingReturns.map(r=>(
          <div key={r._id} style={{ ...s.card, padding:"1.25rem", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:12 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:24 }}>{r.product?.emoji}</span>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14 }}>{r.product?.name}</p>
                    <p style={{ fontSize:12, color:T.muted }}>
                      Qty: {r.product?.qty} · Refund: <strong style={{ color:T.accent }}>{fmt.currency(r.refundAmount)}</strong>
                    </p>
                  </div>
                </div>
                <p style={{ fontSize:12, color:T.muted }}>👤 {r.user?.name} ({r.user?.email})</p>
                <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>📅 {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>Reason: <strong>{r.reason}</strong></p>
                {r.description && <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>Note: {r.description}</p>}
                {r.refundMethod && r.status==="Refunded" && (
                  <p style={{ fontSize:12, color:T.success, fontWeight:600, marginTop:4 }}>
                    {r.refundMethod==="wallet" ? "💰 Refunded to Wallet" : r.refundMethod==="bank" ? "🏦 Bank payout initiated" : ""}
                    {r.transactionRef && ` · UTR: ${r.transactionRef}`}
                  </p>
                )}
              </div>
              <Badge color={statusColor[r.status]||"default"}>{r.status}</Badge>
            </div>
 
            {r.adminNote && (
              <div style={{ background:T.surface2, borderRadius:8, padding:"8px 12px", fontSize:12, color:T.muted, marginBottom:10 }}>
                <span style={{ fontWeight:700 }}>Note: </span>{r.adminNote}
              </div>
            )}
 
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(r.status === "Pending" ? ["Approved", "Rejected"] : r.status === "Approved" ? ["Refunded"] : []).map(st=>(
                <button key={st}
                  disabled={r.status===st || updating===r._id}
                  onClick={()=>openUpdate(r,st)}
                  style={{
                    padding:"5px 14px", borderRadius:8, border:`1px solid ${T.border}`,
                    cursor: r.status===st?"default":"pointer",
                    fontSize:12, fontFamily:"inherit", fontWeight:600,
                    background: r.status===st ? T.accent : "transparent",
                    color:      r.status===st ? "#fff"   : T.muted,
                    opacity: updating===r._id ? 0.5 : 1,
                  }}>{st}</button>
              ))}
            </div>
          </div>
        ))
      )}

      {viewMode === "payouts" && (
        <>
          <div style={{ ...s.card, padding:12, marginBottom:14, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            {["Pending", "Processing", "Completed", "Failed"].map(status => (
              <button key={status} onClick={() => setBankRefundStatus(status)} style={{
                ...s.btn(bankRefundStatus===status ? "primary" : "ghost"),
                padding:"7px 12px", fontSize:12,
              }}>{status}</button>
            ))}
            <Btn variant="ghost" onClick={loadBankRefunds} style={{ marginLeft:"auto", padding:"7px 12px", fontSize:12 }}>↻ Refresh</Btn>
          </div>
          {loadingRefunds ? (
            <div style={{ textAlign:"center", padding:"3rem", color:T.muted }}>Loading bank payouts...</div>
          ) : bankRefunds.length === 0 ? (
            <EmptyState emoji="🏦" title={`No ${bankRefundStatus.toLowerCase()} payouts`} subtitle="Bank refunds will appear here as soon as they are initiated." />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {bankRefunds.map(refund => (
                <div key={refund._id} style={{ ...s.card, padding:"1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
                  <div style={{ minWidth:240, flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:T.accentBg, display:"grid", placeItems:"center", color:T.accent, fontWeight:800 }}>
                        {(refund.user?.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ color:T.text, fontSize:14 }}>{refund.user?.name || "Customer"}</strong>
                        <div style={{ color:T.muted, fontSize:11 }}>{refund.user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:14, flexWrap:"wrap", color:T.muted, fontSize:12 }}>
                      <span>{refund.bankDetails?.bankName || "Bank transfer"} · account ending {refund.bankDetails?.accountNumber?.slice(-4) || "—"}</span>
                      <span>Order #{(refund.order || "").toString().slice(-8).toUpperCase()}</span>
                      <span>{new Date(refund.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    {refund.reason && <div style={{ color:T.muted, fontSize:12, marginTop:6 }}>{refund.reason}</div>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:19, fontWeight:850, color:T.text }}>{fmt.currency(refund.amount)}</div>
                      <Badge color={refund.status==="Completed" ? "success" : refund.status==="Failed" ? "danger" : "warning"}>{refund.status}</Badge>
                    </div>
                    {["Pending", "Processing"].includes(refund.status) && (
                      <>
                        <Btn onClick={() => openRefundAction(refund, refund.status==="Pending" ? "Processing" : "Completed")} style={{ padding:"8px 12px", fontSize:12 }}>
                          {refund.status==="Pending" ? "Start payout" : "Confirm paid"}
                        </Btn>
                        {refund.status === "Processing" && (
                          <Btn variant="danger" onClick={() => openRefundAction(refund, "Failed")} style={{ padding:"8px 12px", fontSize:12 }}>Mark failed</Btn>
                        )}
                      </>
                    )}
                    {refund.status === "Failed" && (
                      <Btn onClick={() => openRefundAction(refund, "Processing")} style={{ padding:"8px 12px", fontSize:12 }}>
                        Retry payout
                      </Btn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
 
      {/* ══ STATUS UPDATE MODAL ══ */}
      <Modal open={noteModal} onClose={()=>setNoteModal(false)}
        title={`${newStatus==="Refunded"?"💰 Process Refund":"📋 Update Status"} — ${newStatus}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={()=>setNoteModal(false)}>Cancel</Btn>,
          <Btn key="save" onClick={handleUpdate} disabled={!!updating}>
            {updating ? "Updating…" : `Confirm ${newStatus}`}
          </Btn>,
        ]}>
 
        {selected && (
          <>
            {/* Product summary */}
            <div style={{ background:getT(state.theme).surface2, borderRadius:10, padding:"12px 14px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:28 }}>{selected.product?.emoji}</span>
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:getT(state.theme).text, margin:0 }}>{selected.product?.name}</p>
                <p style={{ fontSize:12, color:getT(state.theme).muted, margin:0 }}>
                  Qty: {selected.product?.qty} · Refund Amount: <strong style={{ color:getT(state.theme).accent }}>{fmt.currency(selected.refundAmount)}</strong>
                </p>
                <p style={{ fontSize:12, color:getT(state.theme).muted, margin:0 }}>
                  Customer: {selected.user?.name} ({selected.user?.email})
                </p>
              </div>
            </div>
 
            {/* Refund method — only shown when status = Refunded */}
            {newStatus==="Refunded" && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:getT(state.theme).text, marginBottom:10 }}>
                  💰 Choose Refund Method
                </p>
 
                {/* Method selector */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {[
                    ["wallet", "💰 Wallet", "Instant credit"],
                    ["bank",   "🏦 Bank Transfer", "Manual payout"],
                  ].map(([m, label, sub])=>(
                    <button key={m} onClick={()=>setRefundMethod(m)} style={{
                      flex:1, padding:"10px 8px", borderRadius:10, border:"none", cursor:"pointer",
                      fontFamily:"inherit", textAlign:"center", transition:"all 0.2s",
                      background: refundMethod===m ? getT(state.theme).accent : getT(state.theme).surface2,
                      color:      refundMethod===m ? "#fff" : getT(state.theme).muted,
                      borderBottom: refundMethod===m ? `3px solid rgba(0,0,0,0.2)` : "3px solid transparent",
                    }}>
                      <div style={{ fontSize:16, marginBottom:2 }}>{label.split(" ")[0]}</div>
                      <div style={{ fontSize:11, fontWeight:700 }}>{label.split(" ").slice(1).join(" ")}</div>
                      <div style={{ fontSize:9, opacity:0.8 }}>{sub}</div>
                    </button>
                  ))}
                </div>
 
                {/* Wallet info */}
                {refundMethod==="wallet" && (
                  <div style={{ background:"rgba(42,157,110,0.08)", border:"1px solid rgba(42,157,110,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#065f46" }}>
                    ✅ <strong>₹{selected.refundAmount?.toLocaleString("en-IN")}</strong> will be credited to {selected.user?.name}'s wallet instantly when you confirm.
                  </div>
                )}
 
                {/* Bank transfer — show user's verified banks */}
                {refundMethod==="bank" && (
                  <div>
                    {loadingBanks ? (
                      <p style={{ fontSize:12, color:getT(state.theme).muted }}>Loading user's bank accounts...</p>
                    ) : userBanks.length===0 ? (
                      <div style={{ background:"rgba(224,92,92,0.08)", border:"1px solid rgba(224,92,92,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:getT(state.theme).danger }}>
                        ⚠️ This user has no verified bank accounts. Ask them to add and verify a bank account first, or use a wallet refund instead.
                      </div>
                    ) : (
                      <>
                        <FormField label="Select User's Bank Account">
                          <Select value={selectedBankId} onChange={e=>setSelectedBankId(e.target.value)}>
                            <option value="">Select account…</option>
                            {userBanks.map(b=>(
                              <option key={b._id} value={b._id}>
                                {b.bankName} — ••••{b.accountNumber?.slice(-4)} ({b.accountName}){b.isPrimary?" [Primary]":""}
                              </option>
                            ))}
                          </Select>
                        </FormField>
                        {selectedBankId && (()=>{
                          const bank = userBanks.find(b=>b._id===selectedBankId);
                          return bank ? (
                            <div style={{ background:getT(state.theme).surface2, borderRadius:8, padding:"10px 12px", fontSize:12, color:getT(state.theme).muted, marginBottom:12 }}>
                              <p style={{ margin:"0 0 3px", fontWeight:700, color:getT(state.theme).text }}>🏦 {bank.bankName}</p>
                              <p style={{ margin:"0 0 3px" }}>Name: {bank.accountName}</p>
                              <p style={{ margin:"0 0 3px" }}>A/C ending: <strong>••••{bank.accountNumber?.slice(-4)}</strong></p>
                              <p style={{ margin:0 }}>IFSC: <strong>{bank.ifscCode}</strong></p>
                            </div>
                          ) : null;
                        })()}
                        <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#92400e", marginBottom:4 }}>
                          ℹ️ Initiating this return queues a bank payout. Complete the transfer and add the UTR in the Bank payouts tab.
                        </div>
                      </>
                    )}
                  </div>
                )}
 
              </div>
            )}
 
            {/* Admin note */}
            <FormField label="Admin Note (shown to customer)">
              <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)}
                placeholder={
                  newStatus==="Approved"  ? "Your return has been approved. Please ship the item back..." :
                  newStatus==="Rejected"  ? "We cannot process this return because..." :
                  newStatus==="Refunded"  ? `Your refund of ₹${selected.refundAmount} has been processed...` :
                  "Add a note for the customer..."
                }
                rows={3}
                style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${getT(state.theme).border}`, background:getT(state.theme).surface2, color:getT(state.theme).text, fontSize:13, fontFamily:"inherit", resize:"vertical", outline:"none", boxSizing:"border-box" }}
              />
            </FormField>
          </>
        )}
      </Modal>

      <Modal
        open={!!refundAction}
        onClose={() => !updatingRefund && setRefundAction(null)}
        title={refundActionStatus === "Completed" ? "Confirm bank payout" : "Start bank payout"}
        footer={[
          <Btn key="cancel" variant="ghost" disabled={updatingRefund} onClick={() => setRefundAction(null)}>Cancel</Btn>,
          <Btn key="save" disabled={updatingRefund} onClick={saveRefundAction}>
            {updatingRefund ? "Saving..." : refundActionStatus === "Completed" ? "Confirm transfer" : "Mark processing"}
          </Btn>,
        ]}
      >
        {refundAction && (
          <>
            <div style={{ ...s.card, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>{refundAction.user?.name} · {refundAction.bankDetails?.bankName}</div>
              <div style={{ fontSize:22, fontWeight:850, color:T.text }}>{fmt.currency(refundAction.amount)}</div>
              <div style={{ fontSize:12, color:T.muted }}>Account ending {refundAction.bankDetails?.accountNumber?.slice(-4) || "—"}</div>
            </div>
            {refundActionStatus === "Completed" && (
              <FormField label="Bank transaction / UTR reference *">
                <Input value={refundTransactionId} onChange={event=>setRefundTransactionId(event.target.value)} placeholder="Enter the completed transfer reference" />
              </FormField>
            )}
            {refundActionStatus === "Failed" && (
              <p style={{ fontSize:12, color:T.danger, marginBottom:14 }}>
                This marks the bank transfer as failed. The customer can contact support to arrange another refund method.
              </p>
            )}
            <FormField label="Note for customer (optional)">
              <Input value={refundAdminNote} onChange={event=>setRefundAdminNote(event.target.value)} placeholder="A short update about this payout" />
            </FormField>
          </>
        )}
      </Modal>
    </div>
  );
}


function AdminContacts() {
  const { state, dispatch } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replyModal, setReplyModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("Replied");
  const [openContactMenu, setOpenContactMenu] = useState(null);
  const [updating, setUpdating] = useState(null);

  const STATUSES = ["Unread", "Read", "Replied", "Resolved", "Spam"];
  const statusColor = {
    Unread: "warning", Read: "info", Replied: "success", Resolved: "accent", Spam: "danger",
  };

  const defaultReply = (name) => `Hi ${name},\n\nThank you for contacting BharatCart...\n\nOur team will get back to you soon.\n\nBest regards,\nBharatCart Support Team`;

  // Load ALL contacts from MongoDB on mount
  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contacts.all();
      dispatch({ type: "SET_CONTACTS", payload: data });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  const allContacts = state.contacts || [];

  // Stats
  const stats = {
    total: allContacts.length,
    unread: allContacts.filter(c => c.status === "Unread").length,
    read: allContacts.filter(c => c.status === "Read").length,
    replied: allContacts.filter(c => c.status === "Replied").length,
    resolved: allContacts.filter(c => c.status === "Resolved").length,
    spam: allContacts.filter(c => c.status === "Spam").length,
  };

  // Client-side filter
  const filteredContacts = allContacts.filter(c => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.subject || "").toLowerCase().includes(q) ||
      (c.message || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Update contact via API + dispatch
  const handleUpdate = async (id, fields) => {
    setUpdating(id);
    try {
      const updated = await contacts.update(id, fields);
      dispatch({ type: "UPDATE_CONTACT", payload: updated });
      if (selected?._id === id) setSelected(updated);
      toast("Updated!", "success");
      setReplyModal(false);
      setReplyText(""); setAdminNote(""); setNewStatus("Replied");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  // Delete contact via API + dispatch
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      await contacts.remove(id);
      dispatch({ type: "DELETE_CONTACT", payload: id });
      if (selected?._id === id) { setSelected(null); setReplyModal(false); }
      toast("Deleted.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const openReply = async (msg) => {
    setSelected(msg);
    setReplyText(msg.adminReply || defaultReply(msg.name));
    setAdminNote(msg.adminNote || "");
    setNewStatus("Replied");
    setReplyModal(true);
    // Auto mark as Read when opened
    if (msg.status === "Unread") {
      try {
        const updated = await contacts.update(msg._id, { status: "Read" });
        dispatch({ type: "UPDATE_CONTACT", payload: updated });
      } catch { }
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
      Loading messages...
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>💬 Contact Messages</h2>
        <button onClick={loadContacts} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { icon: "📬", label: "Total", value: stats.total, key: "all", color: T.text },
          { icon: "🔴", label: "Unread", value: stats.unread, key: "Unread", color: T.warning },
          { icon: "👁", label: "Read", value: stats.read, key: "Read", color: "#608cdc" },
          { icon: "✅", label: "Replied", value: stats.replied, key: "Replied", color: T.success },
          { icon: "☑️", label: "Resolved", value: stats.resolved, key: "Resolved", color: T.accent },
          { icon: "🚫", label: "Spam", value: stats.spam, key: "Spam", color: T.danger },
        ].map(stat => (
          <div key={stat.label} onClick={() => setFilterStatus(stat.key)} style={{
            background: filterStatus === stat.key ? T.accentBg : T.surface,
            border: `1px solid ${filterStatus === stat.key ? T.accentBorder : T.border}`,
            borderRadius: 12, padding: "0.9rem 0.5rem",
            borderTop: `3px solid ${stat.color}`,
            textAlign: "center", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 Search name, email, subject, message..."
          style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160, fontSize: 12 }}>
          <option value="all">All Messages</option>
          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
        </Select>
      </div>

      {/* ── MESSAGE LIST ── */}
      {filteredContacts.length === 0 ? (
        <EmptyState
          emoji="📭"
          title={allContacts.length === 0 ? "No messages yet" : "No messages match filter"}
          subtitle={allContacts.length === 0 ? "When users send contact messages, they will appear here." : "Try a different filter or search term."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredContacts.map(msg => (
            <div key={msg._id} style={{
              background: T.surface,
              border: `1px solid ${msg.status === "Unread" ? T.accentBorder : T.border}`,
              borderRadius: 14, padding: "1.25rem",
              borderLeft: `4px solid ${msg.status === "Unread" ? T.warning :
                msg.status === "Replied" ? T.success :
                  msg.status === "Resolved" ? T.accent :
                    msg.status === "Spam" ? T.danger : T.border
                }`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>

                {/* Left */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#0a0908" }}>
                      {(msg.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, color: T.text, margin: 0 }}>{msg.name}</p>
                      <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{msg.email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>📋 {msg.subject}</p>
                  <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {msg.message}
                  </p>
                  <p style={{ fontSize: 11, color: T.muted }}>
                    📅 {new Date(msg.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {msg.adminReply && <p style={{ fontSize: 11, color: T.success, marginTop: 4, fontWeight: 700 }}>✅ Replied {msg.repliedAt ? `on ${new Date(msg.repliedAt).toLocaleDateString("en-IN")}` : ""}</p>}
                  {msg.adminNote && <p style={{ fontSize: 11, color: T.muted, marginTop: 3, fontStyle: "italic" }}>📝 {msg.adminNote}</p>}
                </div>

                {/* Right */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <Badge color={statusColor[msg.status] || "default"}>{msg.status}</Badge>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setOpenContactMenu(openContactMenu === msg._id ? null : msg._id)}
                      disabled={updating === msg._id}
                      aria-label={`Actions for ${msg.name}`}
                      title="Message actions"
                      style={{
                        width: 36, height: 36, padding: 0, borderRadius: 10,
                        border: `1px solid ${openContactMenu === msg._id ? T.accent : T.border}`,
                        background: openContactMenu === msg._id ? T.accentBg : T.surface2,
                        color: T.text, cursor: "pointer", fontSize: 20,
                        lineHeight: 1, fontFamily: "inherit",
                      }}
                    >
                      ⋮
                    </button>

                    {openContactMenu === msg._id && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 6px)", right: 0,
                        zIndex: 20, minWidth: 150, padding: 5,
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 10, boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                      }}>
                        {msg.status === "Unread" && <button onClick={() => { setOpenContactMenu(null); handleUpdate(msg._id, { status: "Read" }); }} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12 }}>👁 Mark Read</button>}
                        <button onClick={() => { setOpenContactMenu(null); openReply(msg); }} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12 }}>✉️ Reply</button>
                        {msg.status !== "Resolved" && <button onClick={() => { setOpenContactMenu(null); handleUpdate(msg._id, { status: "Resolved" }); }} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.success }}>✔ Resolve</button>}
                        {msg.status !== "Spam" && <button onClick={() => { setOpenContactMenu(null); handleUpdate(msg._id, { status: "Spam" }); }} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.danger }}>🚫 Spam</button>}
                        <button onClick={() => { setOpenContactMenu(null); handleDelete(msg._id); }} style={{ ...s.btn("ghost"), width: "100%", justifyContent: "flex-start", padding: "8px 10px", fontSize: 12, color: T.danger }}>🗑 Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REPLY MODAL ── */}
      <Modal open={replyModal} onClose={() => setReplyModal(false)} title={`✉️ Reply to ${selected?.name || ""}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setReplyModal(false)}>Cancel</Btn>,
          <Btn key="send" disabled={!replyText.trim() || !!updating}
            onClick={() => handleUpdate(selected._id, { adminReply: replyText, adminNote, status: newStatus })}>
            {updating ? "Sending..." : "Send Reply ✉️"}
          </Btn>,
        ]}
      >
        {selected && (
          <>
            {/* Original message */}
            <div style={{ background: T.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted, marginBottom: 6 }}>
                Original Message — {selected.subject}
              </p>
              <p style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{selected.message}</p>
              <p style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
                From: <strong>{selected.name}</strong> ({selected.email})
              </p>
            </div>

            <FormField label="Your Reply * (visible to user)">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                rows={6}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </FormField>

            <FormField label="Internal Note (admin only — not shown to user)">
              <Input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="e.g. Checked order #1234, escalated to tech team..." />
            </FormField>

            <FormField label="Set Status After Reply">
              <Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </Select>
            </FormField>

            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.muted }}>
              💡 Your reply will be visible to the user in their "My Messages" tab on the Contact Us page.
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function AdminReviews() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await reviews.adminAll();
      setAllReviews(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hide this review?")) return;
    try {
      await reviews.adminDelete(id);
      setAllReviews(prev => prev.filter(r => r._id !== id));
      toast("Review hidden.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const filtered = allReviews.filter(r => {
    const matchFilter = filter === "all" || r.rating === Number(filter);
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.body?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : 0;

  if (loading) return <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>Loading reviews...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: T.text }}>⭐ Product Reviews</h2>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { icon: "⭐", label: "Total Reviews", value: allReviews.length, color: T.accent },
          { icon: "📊", label: "Avg Rating", value: `${avgRating} / 5`, color: T.warning },
          { icon: "😍", label: "5 Star", value: allReviews.filter(r => r.rating === 5).length, color: T.success },
          { icon: "😞", label: "1-2 Star", value: allReviews.filter(r => r.rating <= 2).length, color: T.danger },
        ].map(stat => (
          <div key={stat.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1rem", borderTop: `3px solid ${stat.color}`, textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <input value={search} onChange={e => setSearchInput(e.target.value)}
          placeholder="🔍 Search by user, product, review text..."
          style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 150, fontSize: 12 }}>
          <option value="all">All Ratings</option>
          <option value="5">5 Star ⭐⭐⭐⭐⭐</option>
          <option value="4">4 Star ⭐⭐⭐⭐</option>
          <option value="3">3 Star ⭐⭐⭐</option>
          <option value="2">2 Star ⭐⭐</option>
          <option value="1">1 Star ⭐</option>
        </Select>
        <button onClick={load} style={{ ...s.btn("ghost"), padding: "9px 14px", fontSize: 12 }}>↻ Refresh</button>
      </div>

      {/* Reviews table */}
      {filtered.length === 0 ? (
        <EmptyState emoji="⭐" title="No reviews found" subtitle="Product reviews from customers will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(review => (
            <div key={review._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#0a0908", flexShrink: 0 }}>
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: T.text, margin: 0 }}>{review.user?.name}</p>
                      <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{review.user?.email}</p>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ color: s <= review.rating ? "#f59e0b" : T.border, fontSize: 14 }}>★</span>
                      ))}
                    </div>
                    {review.verified && <Badge color="success">✅ Verified</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>
                    📦 Product: <strong style={{ color: T.text }}>{review.product?.emoji} {review.product?.name}</strong>
                  </p>
                  {review.title && <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{review.title}</p>}
                  {review.body && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{review.body}</p>}
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                    📅 {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => handleDelete(review._id)} style={{ ...s.btn("danger"), padding: "5px 10px", fontSize: 11, flexShrink: 0 }}>
                  🗑 Hide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSales() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", discount: "",
    startTime: "", endTime: "", badge: "🔥 SALE",
    categories: [], isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const data = await sales.all(); setAllSales(data); }
    catch (err) { toast(err.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setF = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const openCreate = () => {
    setEditSale(null);
    setForm({ title: "", description: "", discount: "", startTime: "", endTime: "", badge: "🔥 SALE", categories: [], isActive: true });
    setShowForm(true);
  };

  const openEdit = (sale) => {
    setEditSale(sale);
    setForm({
      title: sale.title,
      description: sale.description || "",
      discount: sale.discount,
      startTime: new Date(sale.startTime).toISOString().slice(0, 16),
      endTime: new Date(sale.endTime).toISOString().slice(0, 16),
      badge: sale.badge || "🔥 SALE",
      categories: sale.categories || [],
      isActive: sale.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.discount || !form.startTime || !form.endTime) {
      toast("Please fill all required fields.", "error"); return;
    }
    if (Number(form.discount) < 1 || Number(form.discount) > 90) {
      toast("Discount must be between 1% and 90%.", "error"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, discount: Number(form.discount) };
      if (editSale) {
        const updated = await sales.update(editSale._id, payload);
        setAllSales(prev => prev.map(s => s._id === updated._id ? updated : s));
        toast("Sale updated!", "success");
      } else {
        const created = await sales.create(payload);
        setAllSales(prev => [created, ...prev]);
        toast("Sale created!", "success");
      }
      setShowForm(false);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await sales.remove(id);
      setAllSales(prev => prev.filter(s => s._id !== id));
      toast("Sale deleted.", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const handleToggle = async (sale) => {
    try {
      const updated = await sales.update(sale._id, { isActive: !sale.isActive });
      setAllSales(prev => prev.map(s => s._id === updated._id ? updated : s));
      toast(`Sale ${updated.isActive ? "activated" : "deactivated"}!`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const getSaleStatus = (sale) => {
    const now = Date.now();
    const start = new Date(sale.startTime).getTime();
    const end = new Date(sale.endTime).getTime();
    if (!sale.isActive) return { label: "Inactive", color: T.muted };
    if (now < start) return { label: "Upcoming", color: "#608cdc" };
    if (now > end) return { label: "Expired", color: T.danger };
    return { label: "🔥 Live", color: T.success };
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>Loading sales...</div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>⚡ Flash Sales & Deals</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
          <button onClick={openCreate} style={{ ...s.btn("primary"), fontSize: 12, padding: "10px 20px" }}>+ Create Sale</button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ ...s.card, padding: "1.5rem", marginBottom: "1.5rem", border: `1px solid ${T.accentBorder}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: "1.25rem" }}>
            {editSale ? "✏️ Edit Sale" : "➕ Create New Sale"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Sale Title *" style={{ gridColumn: "1/-1" }}>
              <Input value={form.title} onChange={setF("title")} placeholder="e.g. Mega Weekend Sale" />
            </FormField>
            <FormField label="Description">
              <Input value={form.description} onChange={setF("description")} placeholder="Optional description" />
            </FormField>
            <FormField label="Badge Text">
              <Input value={form.badge} onChange={setF("badge")} placeholder="🔥 SALE" />
            </FormField>
            <FormField label="Discount % *">
              <Input
                type="number" min="1" max="90"
                value={form.discount} onChange={setF("discount")}
                placeholder="e.g. 20"
              />
            </FormField>
            <div />
            <FormField label="Start Time *">
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={setF("startTime")}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${T.border}`, background: T.surface2,
                  color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </FormField>
            <FormField label="End Time *">
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={setF("endTime")}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${T.border}`, background: T.surface2,
                  color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </FormField>
          </div>

          {/* Category filter */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 8 }}>
              Apply to Categories (leave empty for ALL products)
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => {
                const selected = form.categories.includes(cat);
                return (
                  <button key={cat} onClick={() => setForm(p => ({
                    ...p,
                    categories: selected
                      ? p.categories.filter(c => c !== cat)
                      : [...p.categories, cat],
                  }))} style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    background: selected ? T.accent : T.surface2,
                    color: selected ? "#fff" : T.muted,
                    transition: "all 0.15s",
                  }}>{cat}</button>
                );
              })}
            </div>
            {form.categories.length === 0 && (
              <p style={{ fontSize: 11, color: T.success, marginTop: 6 }}>
                ✅ Sale applies to all products
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
              {saving ? "Saving..." : editSale ? "Update Sale" : "Create Sale ⚡"}
            </Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)} style={{ padding: "8px 20px" }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Sales list */}
      {allSales.length === 0 ? (
        <EmptyState emoji="⚡" title="No sales yet" subtitle="Create your first flash sale to boost conversions!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allSales.map(sale => {
            const status = getSaleStatus(sale);
            return (
              <div key={sale._id} style={{
                ...s.card, padding: "1.25rem",
                borderLeft: `4px solid ${status.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>⚡</span>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>
                        {sale.title}
                      </h3>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: status.color,
                        background: `${status.color}15`,
                        padding: "2px 10px",
                        borderRadius: 10,
                      }}>
                        {status.label}
                      </span>
                    </div>

                    {sale.description && (
                      <p style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>{sale.description}</p>
                    )}

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: T.muted }}>
                      <span>💰 <strong style={{ color: T.danger }}>{sale.discount}% OFF</strong></span>
                      <span>🏷 Badge: {sale.badge}</span>
                      <span>📅 {new Date(sale.startTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>⏰ Until {new Date(sale.endTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>📦 {sale.categories?.length > 0 ? sale.categories.join(", ") : "All products"}</span>
                    </div>

                    {/* Live countdown for active sales */}
                    {status.label === "🔥 Live" && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>⏱ Time remaining:</p>
                        <div style={{
                          background: "linear-gradient(135deg, #e05c5c, #d4a843)",
                          borderRadius: 10, padding: "8px 14px",
                          display: "inline-flex",
                        }}>
                          <CountdownTimer endTime={sale.endTime} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleToggle(sale)}
                      style={{
                        ...s.btn(sale.isActive ? "ghost" : "success"),
                        padding: "5px 12px", fontSize: 11,
                      }}
                    >
                      {sale.isActive ? "⏸ Deactivate" : "▶ Activate"}
                    </button>
                    <button onClick={() => openEdit(sale)} style={{ ...s.btn("ghost"), padding: "5px 12px", fontSize: 11 }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(sale._id)} style={{ ...s.btn("danger"), padding: "5px 10px", fontSize: 11 }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function AdminWallets() {
  const { state } = useApp();
  const T   = getT(state.theme);
  const s   = baseStyles(state.theme);
  const toast = useToast();
 
  const [data,          setData]          = useState({ wallets: [], totalBalance: 0 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [creditModal,   setCreditModal]   = useState(false);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [creditAmount,  setCreditAmount]  = useState("");
  const [creditNote,    setCreditNote]    = useState("");
  const [crediting,     setCrediting]     = useState(false);
 
  const load = async () => {
    setLoading(true);
    try {
      const res = await walletApi.adminAll();
      setData(res);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { load(); }, []);
 
  const filtered = data.wallets.filter(w => {
    const q = search.toLowerCase();
    return !search ||
      w.user?.name?.toLowerCase().includes(q) ||
      w.user?.email?.toLowerCase().includes(q);
  });
 
  const handleCredit = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      toast("Enter a valid amount.", "error"); return;
    }
    setCrediting(true);
    try {
      await walletApi.adminCredit(selectedUser._id, parseFloat(creditAmount), creditNote);
      toast(`₹${creditAmount} credited to ${selectedUser.name}!`, "success");
      setCreditModal(false);
      setCreditAmount("");
      setCreditNote("");
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setCrediting(false);
    }
  };
 
  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
      Loading wallets...
    </div>
  );
 
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text }}>💰 Wallet Management</h2>
        <button onClick={load} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
      </div>
 
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: "1.5rem" }}>
        {[
          { icon: "💰", label: "Total Wallets",        value: data.wallets.length,                                                color: T.text    },
          { icon: "💵", label: "Total Balance (All)",  value: fmt.currency(data.totalBalance || 0),                               color: T.accent  },
          { icon: "👤", label: "Avg Balance / User",   value: data.wallets.length > 0 ? fmt.currency(Math.round((data.totalBalance || 0) / data.wallets.length)) : "₹0", color: T.success },
        ].map(stat => (
          <div key={stat.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.25rem", borderTop: `3px solid ${stat.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, letterSpacing: "-0.02em" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>
 
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search by name or email..."
        style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: "1.25rem", boxSizing: "border-box" }}
      />
 
      {/* Wallet list */}
      {filtered.length === 0 ? (
        <EmptyState emoji="💰" title="No wallets found" subtitle="User wallets appear here once created." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(w => (
            <div key={w._id} style={{ ...s.card, padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#0a0908", flexShrink: 0 }}>
                  {w.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{w.user?.name}</p>
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{w.user?.email}</p>
                </div>
              </div>
 
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: w.balance > 0 ? T.success : T.muted, margin: 0, letterSpacing: "-0.03em" }}>
                    {fmt.currency(w.balance)}
                  </p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Current Balance</p>
                </div>
 
                <button
                  onClick={() => { setSelectedUser(w.user); setCreditModal(true); setCreditAmount(""); setCreditNote(""); }}
                  style={{ ...s.btn("success"), padding: "7px 16px", fontSize: 12  }}
                >
                  + Credit Cashback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {/* Credit Modal */}
      <Modal
        open={creditModal}
        onClose={() => setCreditModal(false)}
        title={`💰 Credit Wallet — ${selectedUser?.name}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setCreditModal(false)}>Cancel</Btn>,
          <Btn key="credit" onClick={handleCredit} disabled={crediting || !creditAmount}>
            {crediting ? "Crediting..." : "💰 Credit Wallet"}
          </Btn>,
        ]}
      >
        {selectedUser && (
          <>
            <div style={{ background: T.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#0a0908" }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{selectedUser.name}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{selectedUser.email}</p>
              </div>
            </div>
 
            <FormField label="Amount to Credit (₹) *">
              <Input
                type="number"
                value={creditAmount}
                onChange={e => setCreditAmount(e.target.value)}
                placeholder="e.g. 500"
                min={1}
              />
            </FormField>
 
            <FormField label="Reason / Note">
              <Input
                value={creditNote}
                onChange={e => setCreditNote(e.target.value)}
                placeholder="e.g. Cashback reward, Compensation, Referral bonus..."
              />
            </FormField>
 
            <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: T.muted }}>
              💡 This amount will be instantly credited to the user's wallet. They'll receive a notification.
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// function AdminRefunds() {
//   const { state } = useApp();
//   const T   = getT(state.theme);
//   const s   = baseStyles(state.theme);
//   const toast = useToast();
 
//   const [data,         setData]         = useState({ refunds:[], stats:{} });
//   const [loading,      setLoading]      = useState(true);
//   const [filter,       setFilter]       = useState("all");
//   const [processModal, setProcessModal] = useState(false);
//   const [selected,     setSelected]     = useState(null);
//   const [processForm,  setProcessForm]  = useState({ status:"Processing", adminNote:"", transactionRef:"" });
//   const [processing,   setProcessing]   = useState(false);
 
//   const STATUSES = ["Pending","Processing","Completed","Rejected"];
 
//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await bankApi.adminAllRefunds(filter);
//       setData(res || { refunds:[], stats:{} });
//     } catch(err) { toast(err.message,"error"); }
//     finally { setLoading(false); }
//   };
//   useEffect(()=>{ load(); },[filter]);
 
//   const openProcess = (refund) => {
//     setSelected(refund);
//     setProcessForm({
//       status:         refund.status==="Pending" ? "Processing" : refund.status,
//       adminNote:      refund.adminNote      || "",
//       transactionRef: refund.transactionRef || "",
//     });
//     setProcessModal(true);
//   };
 
//   const handleProcess = async () => {
//     if (processForm.status==="Completed" && !processForm.transactionRef.trim()) {
//       toast("Please enter the UTR/Transaction reference number.", "error"); return;
//     }
//     setProcessing(true);
//     try {
//       // Backend should: mark refund Completed + deduct wallet balance
//       await bankApi.adminProcessRefund(selected._id, processForm);
//       toast(
//         processForm.status==="Completed"
//           ? `✅ Transfer confirmed! ₹${selected.amount?.toLocaleString("en-IN")} deducted from user's wallet.`
//           : `Refund marked as ${processForm.status}!`,
//         "success"
//       );
//       setProcessModal(false);
//       load();
//     } catch(err) { toast(err.message,"error"); }
//     finally { setProcessing(false); }
//   };
 
//   const statusColor = { Pending:"warning", Processing:"info", Completed:"success", Rejected:"danger" };
//   const statusIcon  = { Pending:"⏳", Processing:"🔄", Completed:"✅", Rejected:"❌" };
 
//   if (loading) return (
//     <div style={{ textAlign:"center", padding:"4rem", color:T.muted }}>
//       <div style={{ fontSize:36, marginBottom:12 }}>💰</div>Loading withdrawal requests...
//     </div>
//   );
 
//   const { refunds, stats } = data;
 
//   return (
//     <div>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
//         <div>
//           <h2 style={{ fontSize:20, fontWeight:700, color:T.text }}>💰 Wallet Withdrawal Requests</h2>
//           <p style={{ fontSize:13, color:T.muted }}>Users requesting their wallet balance transferred to bank</p>
//         </div>
//         <button onClick={load} style={{ ...s.btn("ghost"), fontSize:12, padding:"7px 14px" }}>↻ Refresh</button>
//       </div>
 
//       {/* Stats */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:"1.5rem" }}>
//         {[
//           { icon:"📋", label:"Total",      value:stats.total      ||0, key:"all",        color:T.text    },
//           { icon:"⏳", label:"Pending",    value:stats.pending    ||0, key:"Pending",    color:T.warning },
//           { icon:"🔄", label:"Processing", value:stats.processing ||0, key:"Processing", color:"#608cdc" },
//           { icon:"✅", label:"Completed",  value:stats.completed  ||0, key:"Completed",  color:T.success },
//           { icon:"❌", label:"Rejected",   value:stats.rejected   ||0, key:"Rejected",   color:T.danger  },
//         ].map(stat=>(
//           <div key={stat.key} onClick={()=>setFilter(stat.key)} style={{
//             background:   filter===stat.key ? T.accentBg : T.surface,
//             border:       `1px solid ${filter===stat.key ? T.accentBorder : T.border}`,
//             borderRadius: 12, padding:"0.9rem 0.5rem",
//             borderTop:    `3px solid ${stat.color}`,
//             textAlign:    "center", cursor:"pointer", transition:"all 0.2s",
//           }}>
//             <div style={{ fontSize:18, marginBottom:4 }}>{stat.icon}</div>
//             <div style={{ fontSize:20, fontWeight:900, color:stat.color }}>{stat.value}</div>
//             <div style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>{stat.label}</div>
//           </div>
//         ))}
//       </div>
 
//       {(stats.totalAmount||0)>0 && (
//         <div style={{ background:T.accentBg, border:`1px solid ${T.accentBorder}`, borderRadius:12, padding:"12px 16px", marginBottom:"1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//           <span style={{ fontSize:13, color:T.muted }}>Total Transferred to Users</span>
//           <span style={{ fontSize:18, fontWeight:900, color:T.accent }}>₹{(stats.totalAmount||0).toLocaleString("en-IN")}</span>
//         </div>
//       )}
 
//       {(!refunds||refunds.length===0) ? (
//         <EmptyState emoji="💰" title="No withdrawal requests" subtitle="User wallet withdrawal requests will appear here." />
//       ) : (
//         <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
//           {refunds.map(r=>(
//             <div key={r._id} style={{
//               ...s.card, padding:"1.5rem",
//               borderLeft:`4px solid ${
//                 r.status==="Completed"  ?T.success:
//                 r.status==="Rejected"   ?T.danger :
//                 r.status==="Processing" ?"#608cdc":T.warning
//               }`,
//             }}>
//               <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
//                 <div style={{ flex:1, minWidth:260 }}>
//                   {/* User */}
//                   <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
//                     <div style={{ width:40,height:40,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${T.accent},${T.rose})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#0a0908" }}>
//                       {r.user?.name?.charAt(0).toUpperCase()}
//                     </div>
//                     <div style={{ flex:1 }}>
//                       <p style={{ fontWeight:800, fontSize:15, color:T.text, margin:0 }}>{r.user?.name}</p>
//                       <p style={{ fontSize:12, color:T.muted, margin:0 }}>{r.user?.email}</p>
//                     </div>
//                     <Badge color={statusColor[r.status]||"default"}>{statusIcon[r.status]} {r.status}</Badge>
//                   </div>
 
//                   {/* Amount */}
//                   <p style={{ fontSize:28, fontWeight:900, color:T.danger, margin:"0 0 6px", letterSpacing:"-0.02em" }}>
//                     ₹{r.amount?.toLocaleString("en-IN")}
//                   </p>
//                   <p style={{ fontSize:13, color:T.muted, marginBottom:8 }}>
//                     📋 Reason: <strong style={{ color:T.text }}>{r.reason}</strong>
//                   </p>
 
//                   {/* Bank / UPI */}
//                   <div style={{ background:T.surface2, borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
//                     <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:T.muted, marginBottom:8 }}>Transfer To</p>
//                     {r.bankDetails?.method==="upi" ? (
//                       <p style={{ fontSize:13, color:T.text, margin:0 }}>📱 UPI: <strong>{r.bankDetails.upiId}</strong></p>
//                     ) : (
//                       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px" }}>
//                         {[
//                           ["Account Holder", r.bankDetails?.accountName],
//                           ["Bank",           r.bankDetails?.bankName],
//                           ["Account No.",    r.bankDetails?.accountNumber],
//                           ["IFSC Code",      r.bankDetails?.ifscCode],
//                         ].map(([label,val])=>(
//                           <div key={label}>
//                             <p style={{ fontSize:10, color:T.muted, margin:"0 0 1px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
//                             <p style={{ fontSize:13, fontWeight:600, color:T.text, margin:0 }}>{val||"—"}</p>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
 
//                   <p style={{ fontSize:11, color:T.muted }}>
//                     📅 {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
//                     {r.processedAt && <span> · Processed: {new Date(r.processedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>}
//                   </p>
//                   {r.transactionRef && <p style={{ fontSize:13,color:T.success,fontWeight:700,marginTop:6 }}>✅ UTR/Ref: <strong>{r.transactionRef}</strong></p>}
//                   {r.adminNote      && <p style={{ fontSize:12,color:T.muted,fontStyle:"italic",marginTop:4 }}>📝 {r.adminNote}</p>}
 
//                   {r.status==="Completed" && (
//                     <div style={{ marginTop:8, background:"rgba(42,157,110,0.1)", border:"1px solid rgba(42,157,110,0.3)", borderRadius:8, padding:"8px 12px", fontSize:12, color:T.success, fontWeight:600 }}>
//                       ✅ ₹{r.amount?.toLocaleString("en-IN")} deducted from user's wallet and transferred.
//                     </div>
//                   )}
//                 </div>
 
//                 {/* Action */}
//                 <div style={{ flexShrink:0 }}>
//                   {r.status!=="Completed" && r.status!=="Rejected" && (
//                     <button onClick={()=>openProcess(r)} style={{ ...s.btn("primary"), padding:"9px 20px", fontSize:13 }}>
//                       ⚡ Process Transfer
//                     </button>
//                   )}
//                   {r.status==="Completed" && <span style={{ fontSize:13,color:T.success,fontWeight:700 }}>✅ Transferred</span>}
//                   {r.status==="Rejected"  && <span style={{ fontSize:13,color:T.danger, fontWeight:700 }}>❌ Rejected</span>}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
 
//       {/* Process modal */}
//       <Modal open={processModal} onClose={()=>setProcessModal(false)}
//         title={`⚡ Process Transfer — ${selected?.user?.name}`}
//         footer={[
//           <Btn key="cancel" variant="ghost" onClick={()=>setProcessModal(false)}>Cancel</Btn>,
//           <Btn key="process" onClick={handleProcess} disabled={processing}>
//             {processing ? "Processing..." : `Confirm: ${processForm.status}`}
//           </Btn>,
//         ]}>
//         {selected && (
//           <>
//             <div style={{ background:getT(state.theme).surface2, borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
//               <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
//                 <p style={{ fontWeight:700, fontSize:15, color:getT(state.theme).text, margin:0 }}>{selected.user?.name}</p>
//                 <span style={{ fontSize:22, fontWeight:900, color:getT(state.theme).danger }}>₹{selected.amount?.toLocaleString("en-IN")}</span>
//               </div>
//               {selected.bankDetails?.method==="upi" ? (
//                 <p style={{ fontSize:13, color:getT(state.theme).muted, margin:0 }}>📱 UPI: <strong style={{ color:getT(state.theme).text }}>{selected.bankDetails.upiId}</strong></p>
//               ) : (
//                 <>
//                   <p style={{ fontSize:13, fontWeight:700, color:getT(state.theme).text, margin:"0 0 2px" }}>🏦 {selected.bankDetails?.bankName}</p>
//                   <p style={{ fontSize:12, color:getT(state.theme).muted, margin:"0 0 2px" }}>A/C: <strong style={{ color:getT(state.theme).text }}>{selected.bankDetails?.accountNumber}</strong></p>
//                   <p style={{ fontSize:12, color:getT(state.theme).muted, margin:0 }}>IFSC: <strong style={{ color:getT(state.theme).text }}>{selected.bankDetails?.ifscCode}</strong></p>
//                 </>
//               )}
//             </div>
 
//             <div style={{ background:"#fef3c720", border:"1px solid #f59e0b40", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#92400e" }}>
//               <strong>Steps:</strong>
//               <ol style={{ margin:"6px 0 0 16px", lineHeight:1.8 }}>
//                 <li>Transfer ₹{selected.amount?.toLocaleString("en-IN")} to the account above via NEFT/IMPS/UPI</li>
//                 <li>Copy the UTR / transaction reference</li>
//                 <li>Paste below → set status to "Completed"</li>
//                 <li>User's wallet will be debited automatically ✅</li>
//               </ol>
//             </div>
 
//             <FormField label="Update Status">
//               <Select value={processForm.status} onChange={e=>setProcessForm(p=>({...p,status:e.target.value}))}>
//                 {STATUSES.map(st=><option key={st} value={st}>{st}</option>)}
//               </Select>
//             </FormField>
 
//             {processForm.status==="Completed" && (
//               <FormField label="UTR / Transaction Reference * (Required)">
//                 <Input value={processForm.transactionRef}
//                   onChange={e=>setProcessForm(p=>({...p,transactionRef:e.target.value}))}
//                   placeholder="e.g. UTR123456789012 or IMPS reference" />
//               </FormField>
//             )}
 
//             <FormField label="Note to User (optional)">
//               <Input value={processForm.adminNote}
//                 onChange={e=>setProcessForm(p=>({...p,adminNote:e.target.value}))}
//                 placeholder="e.g. Amount transferred via NEFT, reflects in 2–3 hours" />
//             </FormField>
 
//             {processForm.status==="Completed" && (
//               <div style={{ background:"#d1fae520", border:"1px solid #34d39940", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#065f46" }}>
//                 ✅ Marking Completed will <strong>deduct ₹{selected.amount?.toLocaleString("en-IN")} from the user's wallet</strong> and notify them with the UTR reference.
//               </div>
//             )}
//             {processForm.status==="Rejected" && (
//               <div style={{ background:"#fee2e220", border:"1px solid #f8717140", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#991b1b" }}>
//                 ❌ Rejecting will notify the user. <strong>Wallet balance will NOT be deducted.</strong>
//               </div>
//             )}
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

function AdminBankVerification() {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();
 
  const [accounts,     setAccounts]     = useState([]);  // flat list of bank accounts
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedAcct, setSelectedAcct] = useState(null);
  const [adminNote,    setAdminNote]    = useState("");
  const [processing,   setProcessing]   = useState(false);
 
  // ── load all bank accounts (admin view) ─────────────────
  const load = async () => {
    setLoading(true);
    try {
      // bankApi.adminAllAccounts returns [{_id, accountName, bankName,
      //   accountNumber, ifscCode, branchName, accountType, upiId,
      //   verified, rejected, adminNote, isPrimary,
      //   user: {_id, name, email, phone} }, ...]
      const data = await bankApi.adminAllAccounts(statusFilter);
      setAccounts(Array.isArray(data) ? data : (data.accounts || []));
    } catch (err) {
      // Graceful fallback: try admin.getBankDetails if bankApi method missing
      try {
        const fallback = await admin.getBankDetails(statusFilter);
        // flatten per-user bank accounts
        const flat = (fallback.users || []).flatMap(u => {
          const list = u.bankAccounts || (u.bankDetails ? [u.bankDetails] : []);
          return list.map(b => ({ ...b, user: { _id: u._id, name: u.name, email: u.email, phone: u.phone } }));
        });
        setAccounts(flat);
      } catch (e2) {
        toast("Failed to load bank accounts: " + e2.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [statusFilter]);
 
  // ── Verify ───────────────────────────────────────────────
  const openVerify = (acct) => { setSelectedAcct(acct); setAdminNote(""); setModalOpen(true); };
 
  const confirmVerify = async () => {
    setProcessing(true);
    try {
      await bankApi.verifyAccount(selectedAcct._id, adminNote);
      toast(`✅ Bank account verified for ${selectedAcct.user?.name}!`, "success");
      setModalOpen(false);
      load();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setProcessing(false);
    }
  };
 
  // ── Reject ───────────────────────────────────────────────
  const handleReject = async (acct) => {
    const note = window.prompt(`Rejection reason for ${acct.user?.name} (shown to user):`);
    if (note === null) return;
    try {
      await bankApi.rejectAccount(acct._id, note || "Bank details rejected. Please resubmit.");
      toast(`❌ Bank account rejected for ${acct.user?.name}.`, "success");
      load();
    } catch (err) {
      toast(err.message, "error");
    }
  };
 
  // ── counts for filter tabs ───────────────────────────────
  const counts = { pending: 0, verified: 0, rejected: 0 };
  accounts.forEach(a => {
    if (a.verified)       counts.verified++;
    else if (a.rejected)  counts.rejected++;
    else                  counts.pending++;
  });
 
  if (loading) return (
    <div style={{ textAlign:"center", padding:"4rem", color: T.muted }}>
      <div style={{ fontSize:36, marginBottom:12 }}>✅</div>Loading bank accounts...
    </div>
  );
 
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <h2 style={{ fontSize:20, fontWeight:700, color: T.text }}>✅ Bank Account Verification</h2>
        <button onClick={load} style={{ ...s.btn("ghost"), fontSize:12, padding:"7px 14px" }}>↻ Refresh</button>
      </div>
 
      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {[
          { id:"pending",  label:`⏳ Pending (${counts.pending})`,   color: T.warning },
          { id:"verified", label:`✅ Verified (${counts.verified})`,  color: T.success },
          { id:"rejected", label:`❌ Rejected (${counts.rejected})`,  color: T.danger  },
        ].map(tab => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)} style={{
            padding:"8px 18px", borderRadius:20, border:"none",
            background: statusFilter===tab.id ? tab.color : T.surface2,
            color:      statusFilter===tab.id ? "#fff"    : T.muted,
            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
            transition:"all 0.2s",
          }}>{tab.label}</button>
        ))}
      </div>
 
      {/* Account list */}
      {accounts.length === 0 ? (
        <EmptyState
          emoji="✅"
          title={`No ${statusFilter} bank accounts`}
          subtitle={statusFilter==="pending"
            ? "When users add bank accounts, they'll appear here for review."
            : `No ${statusFilter} accounts to show.`
          }
        />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {accounts.map(acct => (
            <div key={acct._id} style={{
              ...s.card, padding:"1.5rem",
              borderLeft:`4px solid ${acct.verified ? T.success : acct.rejected ? T.danger : T.warning}`,
            }}>
              {/* User info */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg, ${T.accent}, ${T.rose})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, fontWeight:900, color:"#0a0908",
                }}>
                  {acct.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, fontSize:15, color: T.text, margin:0 }}>{acct.user?.name}</p>
                  <p style={{ fontSize:12, color: T.muted, margin:0 }}>{acct.user?.email}</p>
                  {acct.user?.phone && <p style={{ fontSize:12, color: T.muted, margin:0 }}>📱 {acct.user.phone}</p>}
                </div>
                <div>
                  {acct.verified  && <Badge color="success">✅ Verified</Badge>}
                  {acct.rejected  && <Badge color="danger">❌ Rejected</Badge>}
                  {!acct.verified && !acct.rejected && <Badge color="warning">⏳ Pending</Badge>}
                </div>
              </div>
 
              {/* Bank details grid */}
              <div style={{ background: T.surface2, borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color: T.muted, marginBottom:10 }}>
                  Bank Account Details
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" }}>
                  {[
                    ["Account Holder", acct.accountName],
                    ["Bank Name",      acct.bankName],
                    ["Account No.",    acct.accountNumber ? `••••${acct.accountNumber.slice(-4)} (${acct.accountNumber.length} digits)` : "—"],
                    ["IFSC Code",      acct.ifscCode],
                    ["Account Type",   acct.accountType ? acct.accountType.charAt(0).toUpperCase() + acct.accountType.slice(1) : "—"],
                    ["Branch",         acct.branchName || "—"],
                    ["UPI ID",         acct.upiId || "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize:10, color: T.muted, margin:"0 0 1px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
                      <p style={{ fontSize:13, fontWeight:600, color: T.text, margin:0 }}>{val || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
 
              {acct.adminNote && (
                <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:12, color: T.muted, fontStyle:"italic" }}>
                  📝 Note: {acct.adminNote}
                </div>
              )}
 
              {/* Action buttons */}
              {!acct.verified && !acct.rejected && (
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => openVerify(acct)} style={{ ...s.btn("success"), padding:"8px 20px", fontSize:13, flex:1 }}>
                    ✅ Verify Account
                  </button>
                  <button onClick={() => handleReject(acct)} style={{ ...s.btn("danger"), padding:"8px 20px", fontSize:13, flex:1 }}>
                    ❌ Reject
                  </button>
                </div>
              )}
              {acct.rejected && (
                <button onClick={() => openVerify(acct)} style={{ ...s.btn("success"), padding:"8px 20px", fontSize:12 }}>
                  ✅ Verify Anyway
                </button>
              )}
            </div>
          ))}
        </div>
      )}
 
      {/* Verify modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={`Verify Bank Account — ${selectedAcct?.user?.name}`}
        footer={[
          <Btn key="cancel" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Btn>,
          <Btn key="verify" onClick={confirmVerify} disabled={processing}>
            {processing ? "Verifying..." : "✅ Confirm Verification"}
          </Btn>,
        ]}>
        {selectedAcct && (
          <>
            <div style={{ background:"#d1fae520", border:"1px solid #34d39940", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#065f46", fontWeight:600 }}>
              ℹ️ Once verified, this user can submit refund requests using this account.
            </div>
            <div style={{ background: getT(state.theme).surface2, borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
              <p style={{ fontWeight:700, margin:"0 0 6px" }}>{selectedAcct.accountName}</p>
              <p style={{ fontSize:12, color: getT(state.theme).muted, margin:"0 0 3px" }}>🏦 {selectedAcct.bankName}</p>
              <p style={{ fontSize:12, color: getT(state.theme).muted, margin:"0 0 3px" }}>A/C: {selectedAcct.accountNumber}</p>
              <p style={{ fontSize:12, color: getT(state.theme).muted, margin:0 }}>IFSC: {selectedAcct.ifscCode}</p>
            </div>
            <FormField label="Verification Note (optional — shown to user)">
              <Input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="e.g. Account verified successfully." />
            </FormField>
          </>
        )}
      </Modal>
    </div>
  );
}

const ADMIN_SECTIONS = [
  { id: "dash",       label: "Dashboard",         icon: "📊" },
  { id: "products",   label: "Products",           icon: "📦" },
  { id: "orders",     label: "Orders",             icon: "🛒" },
  { id: "returns",    label: "Returns",            icon: "↩️" },
  { id: "payments",   label: "Payments",           icon: "💳" },
  { id: "users",      label: "Users",              icon: "👥" },
  { id: "wallet",     label: "Wallets",            icon: "💰" },
  { id: "bankVerify", label: "Bank Verification",  icon: "✅" },
  { id: "analytics",  label: "Analytics",          icon: "📈" },
  { id: "coupons",    label: "Coupons",            icon: "🎟" },
  { id: "contacts",   label: "Messages",           icon: "💬" },
  { id: "reviews",    label: "Reviews",            icon: "⭐" },
  { id: "sales",      label: "Flash Sales",        icon: "⚡" },
    { id: "ads",       label: "Advertisements", icon: "📢" },   // ← ADD THIS
];

function AdminPayments() {
  const { state } = useApp();
  const toast = useToast();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await admin.payments();
        setData(res);
      } catch (err) {
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: T.muted }}>
      Loading payment report…
    </div>
  );

  if (!data) return (
    <EmptyState emoji="💳" title="No payment data" subtitle="Payments will appear here once orders are placed." />
  );

  const { summary, methodBreakdown, dailyRevenue, transactions } = data;

  const methodIcons = { card: "💳", upi: "📱", cod: "💵", netbank: "🏦", wallet: "👛", razorpay: "💳" };
  const methodLabels = { card: "Card", upi: "UPI", cod: "COD", netbank: "Net Banking", wallet: "Wallet", razorpay: "Razorpay" };

  const filtered = transactions.filter(t => {
    const matchSearch =
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.paymentId?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.method === filter;
    return matchSearch && matchFilter;
  });

  const maxDaily = Math.max(...Object.values(dailyRevenue), 1);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: T.text }}>
        💳 Payment Reports
      </h2>

      {/* Summary cards */}
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { icon: "💰", label: "Net Revenue", value: fmt.currency(summary.totalRevenue), color: T.accent },
          { icon: "📦", label: "Total Orders", value: summary.totalOrders, color: T.success },
          { icon: "📊", label: "Avg Order Value", value: fmt.currency(summary.avgOrderValue), color: T.rose },
          { icon: "📱", label: "Online Payments", value: summary.onlineOrders, color: T.warning },
          { icon: "💵", label: "COD Orders", value: summary.codOrders, color: T.muted },
          { icon: "↩️", label: "Total Refunded", value: fmt.currency(summary.totalRefunded || 0), color: "#f87171" },
          { icon: "🔄", label: "Refund Count", value: summary.totalRefunds || 0, color: "#f87171" },
        ].map(card => (
          <div key={card.label} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "1rem 1.25rem",
            borderTop: `3px solid ${card.color}`,
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Daily Revenue Chart */}
        <div style={{ ...s.card, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: T.text }}>📈 Last 7 Days Revenue</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {Object.entries(dailyRevenue).map(([day, amount]) => (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 9, color: T.muted, fontWeight: 600 }}>
                  {amount > 0 ? fmt.currency(amount).replace("₹", "₹") : ""}
                </div>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  background: amount > 0
                    ? `linear-gradient(180deg, ${T.accent}, ${T.rose})`
                    : T.surface2,
                  height: `${Math.max(4, (amount / maxDaily) * 90)}px`,
                  transition: "height 0.5s ease",
                  minHeight: 4,
                }} />
                <div style={{ fontSize: 9, color: T.muted, textAlign: "center" }}>{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method breakdown */}
        <div style={{ ...s.card, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: T.text }}>🥧 Payment Methods</h3>
          {Object.keys(methodBreakdown).length === 0
            ? <p style={{ color: T.muted, fontSize: 13 }}>No data yet</p>
            : Object.entries(methodBreakdown).map(([method, info]) => {
              const pct = Math.round((info.count / summary.totalOrders) * 100);
              return (
                <div key={method} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ fontSize: 18 }}>{methodIcons[method] || "💳"}</span>
                      <span style={{ fontWeight: 600 }}>{methodLabels[method] || method}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{fmt.currency(info.total)}</span>
                      <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>{info.count} orders</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: T.surface2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3, width: `${pct}%`,
                      background: `linear-gradient(90deg, ${T.accent}, ${T.rose})`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{pct}% of orders</div>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Transactions table */}
      <div style={{ ...s.card, padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text }}>🧾 All Transactions ({filtered.length})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              placeholder="🔍 Search order / user / payment ID…"
              value={search}
              onChange={e => setSearchInput(e.target.value)}
              style={{ fontSize: 12, padding: "6px 12px", width: 240 }}
            />
            <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ fontSize: 12 }}>
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="cod">COD</option>
              <option value="netbank">Net Banking</option>
              <option value="wallet">Wallet</option>
            </Select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Order ID", "Customer", "Amount", "Method", "Payment ID", "Discount", "Order Status", "Date"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    color: T.muted, fontWeight: 600, fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: T.muted }}>No transactions found</td></tr>
                : filtered.map(t => (
                  <tr key={t._id} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 700, fontFamily: "monospace", color: T.accent }}>
                      #{t.orderId}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600 }}>{t.user?.name || "—"}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{t.user?.email || "—"}</div>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 800, color: T.success }}>
                      {fmt.currency(t.amount)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span>{methodIcons[t.method] || "💳"}</span>
                        <span style={{ fontWeight: 600 }}>{methodLabels[t.method] || t.method}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: T.muted }}>
                      {t.paymentId?.length > 20 ? t.paymentId.slice(0, 20) + "…" : t.paymentId}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {t.discount > 0
                        ? <span style={{ color: T.success, fontWeight: 600 }}>−{fmt.currency(t.discount)}{t.coupon ? ` (${t.coupon})` : ""}</span>
                        : <span style={{ color: T.muted }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Badge color={{
                          Processing: "info", Shipped: "warning",
                          "Out for Delivery": "warning", Delivered: "success", Cancelled: "danger",
                        }[t.status] || "default"}>{t.status}</Badge>
                        {t.paymentStatus === "Refunded" && (
                          <Badge color="danger">↩ Refunded</Badge>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: T.muted, whiteSpace: "nowrap" }}>
                      {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {filtered.length > 0 && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.muted }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.accent }}>
              Total: {fmt.currency(filtered.reduce((s, t) => s + t.amount, 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════
//  SUPPORT PAGES — Add these functions to App.jsx
//  Place them just before the Footer function
// ═══════════════════════════════════════════════════════════

// ── 1. HELP CENTER ──────────────────────────────────────────
function HelpCenterSection({ onNavigate }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState("");

  const faqs = [
    {
      category: "Orders",
      icon: "📦",
      questions: [
        { q: "How do I track my order?", a: "Go to My Orders section after logging in. Each order shows its current status: Processing, Shipped, Out for Delivery, or Delivered. You can also see the delivery address and order details." },
        { q: "Can I cancel my order?", a: "Orders can be cancelled before they are shipped. Go to My Orders → select the order → click Cancel. Once shipped, cancellation is not possible but you can request a return after delivery." },
        { q: "How long does delivery take?", a: "Standard delivery takes 3–7 business days depending on your location. Metro cities usually receive orders within 2–3 days. You will receive updates at each stage." },
        { q: "What if I receive a wrong item?", a: "We apologize for the inconvenience. Go to My Orders → select the item → click Return → choose 'Wrong item delivered' as the reason. We will arrange a pickup and send the correct item." },
      ],
    },
    {
      category: "Payments",
      icon: "💳",
      questions: [
        { q: "What payment methods are accepted?", a: "We accept Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, all major Wallets, and Cash on Delivery. All online payments are secured by Razorpay." },
        { q: "Is my payment information safe?", a: "Yes, absolutely. We use Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers. All transactions are 256-bit SSL encrypted." },
        { q: "When will I be charged?", a: "For online payments, you are charged immediately at checkout. For COD orders, you pay cash when the order is delivered to your doorstep." },
        { q: "My payment failed but money was deducted.", a: "Don't worry — failed transactions are automatically reversed within 5–7 business days. If not received, contact your bank with the transaction reference number or reach out to our support team." },
      ],
    },
    {
      category: "Returns & Refunds",
      icon: "↩️",
      questions: [
        { q: "How do I return a product?", a: "Go to My Orders → select the delivered order → click the Return button next to the item → select a reason → submit. Our team will review and approve within 24–48 hours." },
        { q: "How long do refunds take?", a: "Once the return is approved and we receive the item, refunds are processed within 3–5 business days to your original payment method. COD refunds are processed as bank transfers." },
        { q: "What items cannot be returned?", a: "Perishable goods, digital products, personal hygiene items, and customized products cannot be returned. All other items are eligible within 30 days of delivery." },
        { q: "What if my item is damaged?", a: "If you receive a damaged item, request a return immediately with photos. Select 'Defective/Damaged product' as the reason. We will prioritize your case and arrange a replacement or full refund." },
      ],
    },
    {
      category: "Account",
      icon: "👤",
      questions: [
        { q: "How do I create an account?", a: "Click Register on the login page. Fill in your name, email, phone number, and password. You will receive a 6-digit OTP on your email to verify your account. Enter the OTP to complete registration." },
        { q: "I forgot my password. What do I do?", a: "Go to the Profile section after logging in with any method → Change Password. If you cannot login, contact our support team at support@bharatcart.com with your registered email." },
        { q: "How do I update my profile?", a: "Go to Profile → Edit Profile tab. You can update your name, email address, and phone number. All changes are saved immediately." },
        { q: "Can I have multiple accounts?", a: "Each email address can only be registered once. We recommend using a single account for a better shopping experience and order history management." },
      ],
    },
  ];

  const filtered = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div style={{ background: T.bg, minHeight: "60vh" }}>
      {/* Header */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: "3rem 2rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>Help Center</h1>
          <p style={{ fontSize: 16, color: T.muted, marginBottom: 28 }}>
            Find answers to common questions about orders, payments, returns, and your account.
          </p>
          <input
            value={search}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="🔍 Search for answers..."
            style={{
              width: "100%", padding: "13px 18px", borderRadius: 12,
              border: `1px solid ${T.border}`, background: T.surface2,
              color: T.text, fontSize: 14, fontFamily: "inherit",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Quick links */}
        {!search && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: "3rem" }}>
            {[
              { icon: "📦", label: "Track Order", section: "orders" },
              { icon: "↩️", label: "Return Item", section: "orders" },
              { icon: "💳", label: "Payment Help", section: "contact" },
              { icon: "👤", label: "Account Settings", section: "profile" },
            ].map(item => (
              <button key={item.label} onClick={() => onNavigate(item.section)} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "1.25rem 1rem",
                textAlign: "center", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.label}</div>
              </button>
            ))}
          </div>
        )}

        {/* FAQ accordion */}
        {filtered.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span>{cat.icon}</span> {cat.category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.questions.map((faq, fi) => {
                const key = `${ci}-${fi}`;
                const isOpen = openFaq === key;
                return (
                  <div key={fi} style={{
                    background: T.surface, border: `1px solid ${isOpen ? T.accentBorder : T.border}`,
                    borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    <button onClick={() => setOpenFaq(isOpen ? null : key)} style={{
                      width: "100%", padding: "1rem 1.25rem",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "inherit", textAlign: "left",
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{faq.q}</span>
                      <span style={{
                        fontSize: 18, color: T.accent, transition: "transform 0.2s",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        flexShrink: 0, marginLeft: 12,
                      }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: "0 1.25rem 1rem",
                        fontSize: 14, color: T.muted, lineHeight: 1.7,
                        borderTop: `1px solid ${T.border}`, paddingTop: "1rem",
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>No results found</p>
            <p style={{ fontSize: 13 }}>Try different keywords or <button onClick={() => onNavigate("contact")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>contact us</button></p>
          </div>
        )}

        {/* Still need help */}
        <div style={{
          background: T.accentBg, border: `1px solid ${T.accentBorder}`,
          borderRadius: 16, padding: "2rem", textAlign: "center", marginTop: "2rem",
        }}>
          <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Still need help?</p>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Our support team is available 24/7 to assist you.</p>
          <button onClick={() => onNavigate("contact")} style={{
            padding: "10px 28px", borderRadius: 10, border: "none",
            background: T.gradient, color: "#0a0908",
            fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
          }}>
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  const { state, dispatch } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("form");
  const [form, setForm] = useState({
    name: state.currentUser?.name || "",
    email: state.currentUser?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const fetchMyMessages = async () => {
    setLoadingMsgs(true);
    try {
      const data = await contacts.my();
      setMyMessages(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages") fetchMyMessages();
  }, [activeTab]);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast("Please fill all fields.", "error"); return;
    }
    if (!form.email.includes("@")) {
      toast("Please enter a valid email.", "error"); return;
    }
    if (form.message.trim().length < 10) {
      toast("Message must be at least 10 characters.", "error"); return;
    }
    setLoading(true);
    try {
      const newContact = await contacts.submit(form);
      dispatch({ type: "ADD_CONTACT", payload: newContact });
      setSent(true);
      setForm(p => ({ ...p, subject: "", message: "" }));
      toast("Message sent! We'll reply within 24 hours.", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    Unread: "warning", Read: "info", Replied: "success", Resolved: "accent", Spam: "danger",
  };

  return (
    <div style={{ background: T.bg, minHeight: "60vh" }}>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>Contact Us</h1>
        <p style={{ fontSize: 15, color: T.muted, maxWidth: 500, margin: "0 auto" }}>
          We're here to help. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: T.surface2, borderRadius: 12, padding: 4, marginBottom: "2rem", width: "fit-content" }}>
          {[["form", "✉️ Send Message"], ["messages", "📬 My Messages"]].map(([id, label]) => (
            <button key={id} onClick={() => { setActiveTab(id); setSent(false); }} style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              background: activeTab === id ? T.accent : "transparent",
              color: activeTab === id ? "#0a0908" : T.muted,
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* ── FORM TAB ── */}
        {activeTab === "form" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: "2.5rem" }}>

            {/* Contact info */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: "1.25rem", color: T.text }}>Get in Touch</h2>
              {[
                { icon: "📧", label: "Email", value: "support@bharatcart.com", sub: "Reply within 24 hours" },
                { icon: "📞", label: "Phone", value: "+91 98765 43210", sub: "Mon–Sat, 9AM–6PM IST" },
                { icon: "📍", label: "Address", value: "BharatCart HQ Mota Varachha, Surat", sub: "Gujarat 395006" },
                { icon: "⏰", label: "Support Hours", value: "24/7 Online Support", sub: "Always here for you" },
              ].map(info => (
                <div key={info.label} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "1rem", borderRadius: 14, background: T.surface, border: `1px solid ${T.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{info.icon}</div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted, marginBottom: 2 }}>{info.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 1 }}>{info.value}</p>
                    <p style={{ fontSize: 11, color: T.muted }}>{info.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form card */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "2rem" }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                    Thank you! We'll get back to you at <strong style={{ color: T.text }}>{form.email}</strong> within 24 hours.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => setSent(false)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.gradient, color: "#0a0908", fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                      Send Another
                    </button>
                    <button onClick={() => setActiveTab("messages")} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.text, fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                      View My Messages
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: "1.25rem", color: T.text }}>Send us a Message</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FormField label="Your Name *"><Input value={form.name} onChange={set("name")} placeholder="Enter your full name" /></FormField>
                    <FormField label="Email Address *"><Input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" /></FormField>
                  </div>
                  <FormField label="Subject *">
                    <Select value={form.subject} onChange={set("subject")}>
                      <option value="">Select a subject...</option>
                      <option>Order Issue</option>
                      <option>Payment Problem</option>
                      <option>Bank adding related</option>
                      <option>Return &amp; Refund</option>
                      <option>Product Query</option>
                      <option>Account Help</option>
                      <option>Delivery Issue</option>
                      <option>Technical Problem</option>
                      <option>Feedback / Suggestion</option>
                      <option>Other</option>
                    </Select>
                  </FormField>
                  <FormField label="Message *">
                    <textarea
                      value={form.message} onChange={set("message")}
                      placeholder="Describe your issue in detail (min. 10 characters)..."
                      rows={5}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border}
                    />
                    {form.message.length > 0 && form.message.length < 10 && (
                      <p style={{ fontSize: 11, color: T.danger, marginTop: 4 }}>⚠ {10 - form.message.length} more characters needed</p>
                    )}
                  </FormField>
                  <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: "rgb(107, 94, 240)", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Sending..." : "Send Message 📩"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MY MESSAGES TAB ── */}
        {activeTab === "messages" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Your Support Messages</h2>
              <button onClick={fetchMyMessages} style={{ ...s.btn("ghost"), fontSize: 12, padding: "7px 14px" }}>↻ Refresh</button>
            </div>

            {loadingMsgs ? (
              <div style={{ textAlign: "center", padding: "3rem", color: T.muted }}>Loading...</div>
            ) : myMessages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem", background: T.surface, borderRadius: 16, border: `1px dashed ${T.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>📭</div>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No messages yet</p>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>You haven't sent any support messages yet.</p>
                <button onClick={() => setActiveTab("form")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.gradient, color: "#0a0908", fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
                  Send a Message
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {myMessages.map(msg => (
                  <div key={msg._id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.5rem", borderLeft: `4px solid ${msg.status === "Replied" ? T.success : msg.status === "Resolved" ? T.accent : T.warning}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 4 }}>{msg.subject}</p>
                        <p style={{ fontSize: 11, color: T.muted }}>📅 {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <Badge color={statusColor[msg.status] || "default"}>{msg.status}</Badge>
                    </div>

                    {/* User's message */}
                    <div style={{ background: T.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.muted, marginBottom: 6 }}>Your Message</p>
                      <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7 }}>{msg.message}</p>
                    </div>

                    {/* Admin reply */}
                    {msg.adminReply && (
                      <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.accent, marginBottom: 6 }}>
                          ✅ BharatCart Admin Support
                          {msg.repliedAt && <span style={{ color: T.muted, fontWeight: 500, marginLeft: 8, textTransform: "none" }}>— {new Date(msg.repliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>}
                        </p>
                        <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7 }}>{msg.adminReply}</p>
                      </div>
                    )}

                    {msg.status === "Unread" && !msg.adminReply && (
                      <p style={{ fontSize: 12, color: T.muted, marginTop: 10 }}>⏳ Awaiting response — our team will reply within 24 hours.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. FAQs ──────────────────────────────────────────────────
function FAQSection({ onNavigate }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const allFaqs = [
    { cat: "orders", icon: "📦", q: "How do I place an order?", a: "Browse products → Add to Cart → Go to Checkout → Fill delivery address → Choose payment method → Confirm order. You'll receive a confirmation immediately." },
    { cat: "orders", icon: "📦", q: "Can I modify my order after placing it?", a: "Orders cannot be modified once placed. If you need changes, cancel the order (before shipping) and place a new one." },
    { cat: "orders", icon: "📦", q: "How do I track my order?", a: "Go to My Orders section. Each order shows real-time status updates: Processing → Shipped → Out for Delivery → Delivered." },
    { cat: "orders", icon: "📦", q: "What if my order is delayed?", a: "Delivery timelines can vary due to high demand or weather. If your order is more than 10 days late, please contact our support team." },
    { cat: "payment", icon: "💳", q: "Is it safe to save my card details?", a: "We do not store card details on our servers. All payments go through Razorpay which is PCI-DSS Level 1 compliant — the highest security standard." },
    { cat: "payment", icon: "💳", q: "Can I pay using EMI?", a: "Yes, EMI options are available for select credit cards through Razorpay during checkout. Look for the EMI option on the payment screen." },
    { cat: "payment", icon: "💳", q: "Are there any hidden charges?", a: "No hidden charges. Delivery is free above ₹999. For orders below ₹999, a ₹49 delivery fee applies. The price you see is what you pay." },
    { cat: "returns", icon: "↩️", q: "What is the return window?", a: "We offer a 30-day return window from the date of delivery for most products. Ensure the item is unused, in original packaging with all tags intact." },
    { cat: "returns", icon: "↩️", q: "How long does a refund take?", a: "Refunds are processed within 3–5 business days after we receive and inspect the returned item. You'll receive a confirmation email when it's done." },
    { cat: "returns", icon: "↩️", q: "Who pays for return shipping?", a: "For defective or wrong items, we arrange free pickup. For change-of-mind returns, a ₹99 pickup charge may apply depending on your location." },
    { cat: "account", icon: "👤", q: "How do I verify my email?", a: "After registration, a 6-digit OTP is sent to your email. Enter the OTP on the verification screen. The code is valid for 10 minutes." },
    { cat: "account", icon: "👤", q: "Can I change my registered email?", a: "Yes. Go to Profile → Edit Profile → change the Email field → click Save. A verification may be required for the new email." },
    { cat: "account", icon: "👤", q: "How do I add items to my wishlist?", a: "Click the heart icon 🤍 on any product card to add it to your wishlist. View all saved items in the Wishlist section." },
    { cat: "coupons", icon: "🎟", q: "How do I use a coupon code?", a: "During checkout, enter your coupon code in the 'Apply Coupon' field in the order summary sidebar and click Apply. The discount will be applied instantly." },
    { cat: "coupons", icon: "🎟", q: "Why is my coupon not working?", a: "Coupons may fail if: the code has expired, your order total is below the minimum required amount, or the coupon has already been used." },
  ];

  const tabs = [
    { id: "all", label: "All FAQs" },
    { id: "orders", label: "📦 Orders" },
    { id: "payment", label: "💳 Payment" },
    { id: "returns", label: "↩️ Returns" },
    { id: "account", label: "👤 Account" },
    { id: "coupons", label: "🎟 Coupons" },
  ];

  const filtered = activeTab === "all" ? allFaqs : allFaqs.filter(f => f.cat === activeTab);

  return (
    <div style={{ background: T.bg, minHeight: "60vh" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: 16, color: T.muted }}>Quick answers to questions we hear most often.</p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "2rem" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOpenFaq(null); }} style={{
              padding: "8px 16px", borderRadius: 20, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              fontFamily: "inherit",
              background: activeTab === tab.id ? T.accent : T.surface,
              color: activeTab === tab.id ? "#0a0908" : T.muted,
              boxShadow: activeTab === tab.id ? "0 2px 8px rgba(201,168,76,0.3)" : "none",
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* FAQ list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{
                background: T.surface, border: `1px solid ${isOpen ? T.accentBorder : T.border}`,
                borderRadius: 14, overflow: "hidden", transition: "all 0.2s",
              }}>
                <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                  width: "100%", padding: "1.1rem 1.25rem",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: isOpen ? T.accentBg : "none",
                  border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: "background 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{faq.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isOpen ? T.accent : T.text }}>{faq.q}</span>
                  </div>
                  <span style={{
                    fontSize: 20, color: T.accent, fontWeight: 300,
                    transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform 0.2s", flexShrink: 0, marginLeft: 12,
                  }}>+</span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: "1rem 1.25rem 1.25rem 3.1rem",
                    fontSize: 14, color: T.muted, lineHeight: 1.8,
                    borderTop: `1px solid ${T.border}`,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div style={{
          marginTop: "2.5rem", textAlign: "center",
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "2rem",
        }}>
          <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Didn't find your answer?</p>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Visit our Help Center or contact us directly.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => onNavigate("helpcenter")} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: T.gradient, color: "#0a0908",
              fontWeight: 800, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
            }}>Help Center</button>
            <button onClick={() => onNavigate("contact")} style={{
              padding: "10px 24px", borderRadius: 10,
              border: `1px solid ${T.border}`, background: "transparent",
              color: T.text, fontWeight: 600, fontSize: 13, fontFamily: "inherit", cursor: "pointer",
            }}>Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. PRIVACY POLICY ────────────────────────────────────────
function PrivacyPolicySection() {
  const { state } = useApp();
  const T = getT(state.theme);

  const sections = [
    {
      title: "1. Information We Collect",
      content: `When you use BharatCart, we collect the following information:

• Personal Information: Name, email address, phone number, and delivery address when you register or place an order.
• Payment Information: We do not store card details. All payment data is handled by Razorpay, our secure payment partner.
• Usage Data: Pages visited, products viewed, searches performed, and time spent on the platform to improve your experience.
• Device Information: Browser type, IP address, and operating system for security and analytics purposes.`,
    },
    {
      title: "2. How We Use Your Information",
      content: `We use your information to:

• Process and deliver your orders accurately and on time.
• Send order confirmations, shipping updates, and delivery notifications.
• Provide customer support and respond to your queries.
• Send promotional offers and newsletters (you can opt out anytime).
• Improve our platform, products, and services based on usage patterns.
• Detect and prevent fraudulent transactions and unauthorized access.`,
    },
    {
      title: "3. Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We share data only with:

• Delivery Partners: Name, address, and phone number for order fulfillment.
• Payment Processors: Razorpay receives transaction data securely.
• Analytics Services: Anonymized usage data to improve our platform.
• Legal Requirements: When required by law or court order.

All third-party partners are bound by strict confidentiality agreements.`,
    },
    {
      title: "4. Data Security",
      content: `We implement industry-standard security measures:

• All data is transmitted using 256-bit SSL encryption.
• Passwords are hashed using bcrypt — we never store plain text passwords.
• Payment data is handled by PCI-DSS Level 1 compliant systems.
• Regular security audits and vulnerability assessments are performed.
• Access to personal data is restricted to authorized personnel only.`,
    },
    {
      title: "5. Cookies",
      content: `BharatCart uses cookies to enhance your shopping experience:

• Essential Cookies: Required for login sessions and cart functionality.
• Analytics Cookies: Help us understand how users interact with our platform.
• Preference Cookies: Remember your theme (light/dark) and settings.

You can disable cookies in your browser settings, but some features may not work correctly.`,
    },
    {
      title: "6. Your Rights",
      content: `You have the following rights regarding your data:

• Access: Request a copy of all personal data we hold about you.
• Correction: Update or correct inaccurate personal information.
• Deletion: Request deletion of your account and associated data.
• Portability: Receive your data in a machine-readable format.
• Opt-out: Unsubscribe from marketing emails at any time.

To exercise these rights, contact us at privacy@bharatcart.com.`,
    },
    {
      title: "7. Data Retention",
      content: `We retain your data for as long as your account is active or as needed to provide services. After account deletion, we retain transaction records for 7 years as required by Indian tax law. All other personal data is deleted within 30 days of account closure.`,
    },
    {
      title: "8. Contact & Updates",
      content: `For privacy-related queries, contact our Data Protection Officer at privacy@bharatcart.com. We may update this policy periodically. Significant changes will be communicated via email. Continued use of BharatCart after changes constitutes acceptance of the updated policy.

Last updated: January 2026`,
    },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "60vh" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>Privacy Policy</h1>
        <p style={{ fontSize: 16, color: T.muted }}>We value your privacy. Here's how we collect, use, and protect your information.</p>
        <p style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Last updated: January 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{
          background: T.accentBg, border: `1px solid ${T.accentBorder}`,
          borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2.5rem",
        }}>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <strong>Summary:</strong> BharatCart collects only the information necessary to provide our services. We never sell your data, use industry-standard security, and give you full control over your personal information.
          </p>
        </div>

        {sections.map((sec, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "1.75rem", marginBottom: 14,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: T.text }}>{sec.title}</h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.85, whiteSpace: "pre-line" }}>{sec.content}</p>
          </div>
        ))}

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.75rem", marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 12 }}>Have questions about our privacy practices?</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>📧 privacy@bharatcart.com</p>
        </div>
      </div>
    </div>
  );
}

// ── 5. TERMS OF SERVICE ──────────────────────────────────────
function TermsSection() {
  const { state } = useApp();
  const T = getT(state.theme);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using BharatCart, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including buyers, browsers, and registered members.`,
    },
    {
      title: "2. User Accounts",
      content: `• You must be at least 18 years of age to create an account and make purchases.
• You are responsible for maintaining the confidentiality of your account credentials.
• You agree to provide accurate, current, and complete information during registration.
• Notify us immediately at support@bharatcart.com if you suspect unauthorized access to your account.
• We reserve the right to terminate accounts that violate these terms.`,
    },
    {
      title: "3. Products & Pricing",
      content: `• All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.
• We reserve the right to modify prices without prior notice.
• Product images are for illustration only; actual product may vary slightly.
• We do not guarantee the availability of any product at any time.
• In case of pricing errors, we reserve the right to cancel the order and issue a full refund.`,
    },
    {
      title: "4. Orders & Payments",
      content: `• An order is confirmed only after successful payment or COD placement.
• We reserve the right to cancel orders due to stock unavailability, pricing errors, or suspected fraud.
• All payments are processed securely through Razorpay. By making a payment, you agree to Razorpay's terms.
• You agree not to use stolen or unauthorized payment methods.
• Charge-back fraud will result in permanent account suspension and legal action.`,
    },
    {
      title: "5. Shipping & Delivery",
      content: `• Delivery timelines are estimates and not guaranteed. Delays may occur due to logistics, weather, or other factors.
• Risk of loss and title for items passes to you upon delivery to the carrier.
• We are not responsible for delays caused by incorrect shipping information provided by the user.
• Free shipping applies to orders above ₹999. Standard shipping charges of ₹49 apply otherwise.`,
    },
    {
      title: "6. Returns & Refunds",
      content: `• Our 30-day return policy allows returns for eligible products in original condition.
• Refunds are processed within 3–5 business days after receiving and inspecting the returned item.
• Items that are damaged due to misuse, missing parts, or not in original condition are not eligible for returns.
• BharatCart reserves the right to reject returns that do not meet our return criteria.`,
    },
    {
      title: "7. Prohibited Activities",
      content: `You agree not to:
• Use the platform for any unlawful purpose or in violation of any regulations.
• Attempt to gain unauthorized access to any part of our systems.
• Submit false reviews, manipulate ratings, or engage in deceptive practices.
• Use automated bots or scripts to access or scrape our platform.
• Resell products purchased from BharatCart without prior written consent.
• Infringe upon the intellectual property rights of BharatCart or third parties.`,
    },
    {
      title: "8. Intellectual Property",
      content: `All content on BharatCart including but not limited to text, graphics, logos, images, and software is the property of BharatCart and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our explicit written permission.`,
    },
    {
      title: "9. Limitation of Liability",
      content: `BharatCart shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our platform. Our total liability shall not exceed the amount paid for the specific order giving rise to the claim. We do not guarantee uninterrupted or error-free service.`,
    },
    {
      title: "10. Governing Law & Disputes",
      content: `These terms are governed by the laws of India. Any disputes arising from these terms or your use of BharatCart shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra. We encourage resolving disputes through our customer support team before initiating legal proceedings.

Last updated: January 2026`,
    },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "60vh" }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "3rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>Terms of Service</h1>
        <p style={{ fontSize: 16, color: T.muted }}>Please read these terms carefully before using BharatCart.</p>
        <p style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Last updated: January 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{
          background: "rgba(224,92,92,0.08)", border: "1px solid rgba(224,92,92,0.2)",
          borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2.5rem",
        }}>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <strong>⚠️ Important:</strong> By creating an account or placing an order on BharatCart, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>

        {sections.map((sec, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "1.75rem", marginBottom: 14,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: T.text }}>{sec.title}</h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.85, whiteSpace: "pre-line" }}>{sec.content}</p>
          </div>
        ))}

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "1.75rem", marginTop: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 6 }}>Questions about our terms?</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>📧 legal@bharatcart.com</p>
        </div>
      </div>
    </div>
  );
}

function Footer({ onNavigate }) {
  const { state } = useApp();
  const T = getT(state.theme);

  return (
    <footer style={{
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      padding: "3rem 2rem 1.5rem",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>

          {/* Brand */}
          <div>
            <div onClick={() => onNavigate("home")} style={{
              cursor: "pointer", display: "inline-flex", alignItems: "center",
              gap: 8, marginBottom: 14,
            }}>
              <BharatCartLogo />
            </div>
            <p style={{ fontSize: 13, color: "black", lineHeight: 1.7, maxWidth: 240, marginBottom: 16 }}>
              Your premium shopping destination. Quality products, fast delivery, and great prices — all in one place.
            </p>
            {/* Social icons */}
            {/* <div style={{ display: "flex", gap: 8 }}>
              {["📘", "📸", "🐦", "▶️"].map((icon, i) => (  
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: T.surface2, border: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, cursor: "pointer", transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >{icon}</div>
              ))}
            </div> */}
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: T.surface2,
                      border: `1px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      color: T.text,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = T.accent;
                      e.currentTarget.style.color = T.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.color = T.text;
                    }}
                  >
                    {item.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>


          {/* Shop links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text, marginBottom: 14 }}>Shop</p>
            {[
              { label: "All Products", section: "shop" },
              { label: "Electronics", section: "shop" },
              { label: "Fashion", section: "shop" },
              { label: "Sports", section: "shop" },
              { label: "Books", section: "shop" },
            ].map(item => (
              <p key={item.label}
                onClick={() => onNavigate(item.section)}
                style={{ fontSize: 13, color: T.muted, marginBottom: 9, cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.accent}
                onMouseLeave={e => e.target.style.color = T.muted}
              >{item.label}</p>
            ))}
          </div>

          {/* Account links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text, marginBottom: 14 }}>Account</p>
            {[
              { label: "My Orders", section: "orders" },
              { label: "Wishlist", section: "wishlist" },
              { label: "Profile", section: "profile" },
              { label: "My Returns", section: "orders" },
              { label: "Checkout", section: "checkout" },
            ].map(item => (
              <p key={item.label}
                onClick={() => onNavigate(item.section)}
                style={{ fontSize: 13, color: T.muted, marginBottom: 9, cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.accent}
                onMouseLeave={e => e.target.style.color = T.muted}
              >{item.label}</p>
            ))}
          </div>

          {/* Support */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text, marginBottom: 14 }}>Support</p>
            {[
              { label: "Help Center", section: "helpcenter" },
              { label: "Contact Us", section: "contact" },
              { label: "FAQs", section: "faq" },
              { label: "Privacy Policy", section: "privacy" },
              { label: "Terms of Service", section: "terms" },
            ].map(item => (
              <p key={item.label}
                onClick={() => onNavigate(item.section)}
                style={{ fontSize: 13, color: T.muted, marginBottom: 9, cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.accent}
                onMouseLeave={e => e.target.style.color = T.muted}
              >{item.label}</p>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 11, color: T.muted, marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>We Accept</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { icon: "📱", label: "UPI" },
              { icon: "💳", label: "Visa" },
              { icon: "💳", label: "Mastercard" },
              { icon: "💵", label: "COD" },
              { icon: "🏦", label: "Net Banking" },
              { icon: "👛", label: "Wallets" },
            ].map(p => (
              <div key={p.label} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: T.surface2, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "5px 12px",
                fontSize: 12, color: T.muted,
              }}>
                <span>{p.icon}</span> {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", borderTop: `1px solid ${T.border}`, paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
          {[
            { icon: "🚚", text: "Free Delivery over ₹999" },
            { icon: "↩️", text: "Easy 30-day Returns" },
            { icon: "🔒", text: "100% Secure Payments" },
            { icon: "⭐", text: "Top Rated Products" },
          ].map(g => (
            <div key={g.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.muted }}>
              <span style={{ fontSize: 15 }}>{g.icon}</span>
              <span>{g.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${T.border}`, paddingTop: "1.25rem",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ fontSize: 12, color: T.muted }}>
            © {new Date().getFullYear()} BharatCart. All rights reserved.
          </p>
          <p style={{ fontSize: 14, color: T.muted }}>
            <b> ""Create By BharatCart Team""</b>
          </p>
        </div>

      </div>
    </footer>
  );
}

function PWAInstallPrompt() {
  const { state } = useApp();
  const T = getT(state.theme);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem("sv_pwa_dismissed");
    if (dismissed) return;

    const handler = e => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("sv_pwa_dismissed", "true");
  };

  if (!showBanner || installed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9000,
      width: "92%",
      maxWidth: 440,
      background: T.surface,
      border: `1px solid ${T.accentBorder}`,
      borderRadius: 18,
      padding: "16px 20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      display: "flex",
      gap: 14,
      alignItems: "center",
      animation: "slideUp 0.4s ease",
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        flexShrink: 0,
      }}>
      </div>
      

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: T.text, margin: "0 0 3px" }}>
          Install BharatCart App
        </p>
        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
          Shop faster — works offline too!
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: "7px 16px",
            borderRadius: 8,
            border: "none",
            background: T.gradient,
            color: "#0a0908",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}

function UserPanel({ onLogout }) {
  const { state } = useApp();
  const [activeSection, setActiveSection] = useState(() => readPageFromUrl("home", USER_PAGE_IDS));
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useMemo(() => state.cart.reduce((s, c) => s + c.qty, 0), [state.cart]);
  const handleNavigate = useCallback((section) => {
    if (!USER_PAGE_IDS.includes(section)) return;
    setActiveSection(section);
    writePageToUrl(section);
  }, []);

  useEffect(() => {
    const handlePopState = () => setActiveSection(readPageFromUrl("home", USER_PAGE_IDS));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  function NotificationBell({ onNavigate }) {
    const { state } = useApp();
    const T = getT(state.theme);
    const s = baseStyles(state.theme);
    const toast = useToast();

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
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Notification load error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    // Load on mount and poll every 30 seconds
    useEffect(() => {
      if (!state.currentUser || state.isAdmin) return;
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }, [state.currentUser]);

    // Close on outside click
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
      setOpen(!open);
      if (!open) loadNotifications();
    };

    const handleMarkRead = async (id) => {
      try {
        await notifications.markRead(id);
        setNotifList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { }
    };

    const handleMarkAllRead = async () => {
      try {
        await notifications.markAllRead();
        setNotifList(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast("All notifications marked as read", "success");
      } catch (err) { }
    };

    const handleDelete = async (id, e) => {
      e.stopPropagation();
      try {
        await notifications.remove(id);
        const removed = notifList.find(n => n._id === id);
        setNotifList(prev => prev.filter(n => n._id !== id));
        if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { }
    };

    const handleClearAll = async () => {
      if (!window.confirm("Clear all notifications?")) return;
      try {
        await notifications.clearAll();
        setNotifList([]);
        setUnreadCount(0);
        toast("All notifications cleared", "success");
      } catch (err) { }
    };

    const handleClick = (notif) => {
      if (!notif.isRead) handleMarkRead(notif._id);
      if (notif.link) {
        onNavigate(notif.link);
        setOpen(false);
      }
    };

    const typeColors = {
      order: T.accent,
      return: T.warning,
      payment: T.success,
      account: T.danger,
      message: "#608cdc",
      info: T.muted,
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
        {/* Bell button */}
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

        {/* Dropdown */}
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
            {/* Header */}
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
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: T.accent, fontWeight: 700, fontFamily: "inherit",
                  }}>
                    Mark all read
                  </button>
                )}
                {notifList.length > 0 && (
                  <button onClick={handleClearAll} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: T.danger, fontWeight: 700, fontFamily: "inherit",
                  }}>
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
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
                    }}
                    onMouseEnter={e => !notif.isRead && (e.currentTarget.style.background = T.surface2)}
                    onMouseLeave={e => !notif.isRead && (e.currentTarget.style.background = T.accentBg)}
                  >
                    {/* Icon */}
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

                    {/* Content */}
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

                    {/* Unread dot */}
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

                    {/* Delete button */}
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

        <style>{`
        div:hover .delete-btn { opacity: 1 !important; }
      `}</style>
      </div>
    );
  }

  const sectionMap = {
    home: <HomePage onNavigate={handleNavigate} />,
    shop: <ShopSection onNavigate={handleNavigate} />,
    orders: <OrdersSection onNavigate={handleNavigate} />,
    wishlist: <WishlistSection />,
    wallet: <WalletSection />,
    profile: <ProfileSection />,
    checkout: <CheckoutSection onNavigate={handleNavigate} />,
    helpcenter: <HelpCenterSection onNavigate={handleNavigate} />,
    contact: <ContactSection />,
    faq: <FAQSection onNavigate={handleNavigate} />,
    privacy: <PrivacyPolicySection />,
    terms: <TermsSection />,
    reviews: <AdminReviews />,
    ads: <AdminAds />,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        isAdmin={false} user={state.currentUser} cartCount={cartCount}
        activeSection={activeSection} onNavigate={handleNavigate}
        onCartOpen={() => setCartOpen(true)} onLogout={onLogout}
        onNotificationClick={() => { }}
      />
      <FlashSaleBanner />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); handleNavigate("checkout"); }} />
      <div style={{ flex: 1 }}>
        {sectionMap[activeSection] || sectionMap.home}
      </div>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

function LoadingScreen() {
  const { state } = useApp();
  const T = getT(state.theme);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: `4px solid ${T.border}`,
        borderTop: `4px solid ${T.accent}`,
        animation: "spin 0.8s linear infinite",
        marginBottom: 20,
      }} />
      <div style={{
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: "-0.03em",
        background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        BharatCart
      </div>
      <p style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>Loading your store...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRoot />
      </ToastProvider>
    </AppProvider>
  );
}

// function AppRoot() {
//   const { state, dispatch } = useApp();
//   const { logout } = useAuthActions();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);

//   if (state.loading) return <LoadingScreen />;

//   return (
//     <div style={s.app} className="app-root">
//       <style>{`
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body { background: ${T.bg}; min-height: 100vh; overflow-x: hidden; word-break: break-word; }
//         #root { min-height: 100vh; word-break: break-word; }
//         img, svg, video, iframe { max-width: 100%; height: auto; }
//         button, input, select, textarea { min-width: 0; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: ${T.surface}; }
//         ::-webkit-scrollbar-thumb { background: ${T.faint}; border-radius: 3px; }
//         ::-webkit-scrollbar-thumb:hover { background: ${T.accent}; }

//         @media (max-width: 980px) {
//           .app-root { padding: 0 1rem !important; }
//           .app-root, .app-root > div, .app-root > section, .app-root > main, .app-root > article, .app-root header, .app-root footer {
//             max-width: 100% !important;
//             width: 100% !important;
//             min-width: 0 !important;
//           }
//           .app-root [style*="display: flex"] {
//             flex-wrap: wrap !important;
//           }
//           .app-root [style*="display:grid"], .app-root [style*="display: grid"] {
//             grid-template-columns: 1fr !important;
//             width: 100% !important;
//           }
//           .app-root [style*="position: sticky"] {
//             position: static !important;
//             width: 100% !important;
//           }
//           .app-root [style*="width: 220px"] ,
//           .app-root [style*="width:220px"],
//           .app-root [style*="width: 340px"],
//           .app-root [style*="width:340px"],
//           .app-root [style*="width: 500px"],
//           .app-root [style*="width:500px"] {
//             width: 100% !important;
//             max-width: 100% !important;
//           }
//           .app-root [style*="max-width: 1160px"],
//           .app-root [style*="max-width:1160px"],
//           .app-root [style*="max-width: 1060px"],
//           .app-root [style*="max-width:1060px"],
//           .app-root [style*="max-width: 860px"],
//           .app-root [style*="max-width:860px"],
//           .app-root [style*="max-width: 720px"],
//           .app-root [style*="max-width:720px"] {
//             max-width: 100% !important;
//             padding-left: 0.5rem !important;
//             padding-right: 0.5rem !important;
//           }
//           .app-root [style*="grid-template-columns: repeat(4,1fr)"],
//           .app-root [style*="grid-template-columns: repeat(6,1fr)"],
//           .app-root [style*="grid-template-columns: 1fr 340px"],
//           .app-root [style*="grid-template-columns: 1fr 1fr"] {
//             grid-template-columns: 1fr !important;
//           }
//           .app-root [style*="gap: 1.5rem"],
//           .app-root [style*="gap: 2rem"],
//           .app-root [style*="gap: 2.5rem"],
//           .app-root [style*="gap: 10px"] {
//             gap: 1rem !important;
//           }
//           .app-root [style*="margin-left: auto"],
//           .app-root [style*="margin-right: auto"] {
//             margin-left: auto !important;
//             margin-right: auto !important;
//           }
//         }
//       `}</style>
//       {/* {!state.currentUser && <AuthPage />}
//       {state.currentUser && state.isAdmin  && <AdminPanel onLogout={logout} />}
//       {state.currentUser && !state.isAdmin && <UserPanel  onLogout={logout} />} */}
//       {state.currentUser && state.isAdmin && <AdminPanel onLogout={logout} />}
//       {state.currentUser && !state.isAdmin && <UserPanel onLogout={logout} />}
//       {!state.currentUser && <AuthPage />}
//       <PWAInstallPrompt />
//     </div>
//   );
// }

function AppRoot() {
  const { state, dispatch } = useApp();
  const { logout } = useAuthActions();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [showSignedInResetModal, setShowSignedInResetModal] = useState(
    () => Boolean(new URLSearchParams(window.location.search).get("resetToken"))
  );

  const closeSignedInResetModal = () => {
    setShowSignedInResetModal(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("resetToken");
    window.history.replaceState({}, document.title, url.toString());
  };
 
  if (state.loading) return <LoadingScreen />;
 
  return (
    <div style={s.app} className="app-root">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${T.bg}; min-height: 100vh; overflow-x: hidden; word-break: break-word; }
        #root { min-height: 100vh; word-break: break-word; }
        img, svg, video, iframe { max-width: 100%; height: auto; }
        button, input, select, textarea { min-width: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${T.surface}; }
        ::-webkit-scrollbar-thumb { background: ${T.faint}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.accent}; }
 
        @media (max-width: 980px) {
          .app-root { padding: 0 1rem !important; }
          .app-root, .app-root > div, .app-root > section, .app-root > main, .app-root > article, .app-root header, .app-root footer {
            max-width: 100% !important; width: 100% !important; min-width: 0 !important;
          }
          .app-root [style*="display: flex"] { flex-wrap: wrap !important; }
          .app-root [style*="display:grid"], .app-root [style*="display: grid"] {
            grid-template-columns: 1fr !important; width: 100% !important;
          }
          .app-root [style*="position: sticky"] { position: static !important; width: 100% !important; }
          .app-root [style*="width: 220px"], .app-root [style*="width:220px"],
          .app-root [style*="width: 340px"], .app-root [style*="width:340px"],
          .app-root [style*="width: 500px"], .app-root [style*="width:500px"] {
            width: 100% !important; max-width: 100% !important;
          }
          .app-root [style*="max-width: 1160px"], .app-root [style*="max-width:1160px"],
          .app-root [style*="max-width: 1060px"], .app-root [style*="max-width:1060px"],
          .app-root [style*="max-width: 860px"],  .app-root [style*="max-width:860px"],
          .app-root [style*="max-width: 720px"],  .app-root [style*="max-width:720px"] {
            max-width: 100% !important; padding-left: 0.5rem !important; padding-right: 0.5rem !important;
          }
          .app-root [style*="grid-template-columns: repeat(4,1fr)"],
          .app-root [style*="grid-template-columns: repeat(6,1fr)"],
          .app-root [style*="grid-template-columns: 1fr 340px"],
          .app-root [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .app-root [style*="gap: 1.5rem"], .app-root [style*="gap: 2rem"],
          .app-root [style*="gap: 2.5rem"], .app-root [style*="gap: 10px"] { gap: 1rem !important; }
        }
      `}</style>
 
      {/* Admin */}
      {state.currentUser && state.isAdmin && <AdminPanel onLogout={logout} />}
 
      {/* Logged-in user */}
      {state.currentUser && !state.isAdmin && <UserPanel onLogout={logout} />}

      {state.currentUser && showSignedInResetModal && (
        <AuthModal initialTab="login" onClose={closeSignedInResetModal} />
      )}

      {/* Guest — show public shell with home + shop */}
      {!state.currentUser && <GuestPanel />}
 
      <PWAInstallPrompt />
    </div>
  );
}

function GuestPanel() {
  const { state } = useApp();
  const T = getT(state.theme);
  const [activeSection, setActiveSection] = useState(() => readPageFromUrl("home", GUEST_PAGE_IDS));
  const [showAuthModal, setShowAuthModal] = useState(
    () => Boolean(new URLSearchParams(window.location.search).get("resetToken"))
  );
  const [authTab,       setAuthTab]       = useState("login"); // "login" | "register"

  const closeAuthModal = () => {
    setShowAuthModal(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("resetToken")) {
      url.searchParams.delete("resetToken");
      window.history.replaceState({}, document.title, url.toString());
    }
  };
 
  const handleNavigate = (section) => {
    // Sections allowed for guests
    if (GUEST_PAGE_IDS.includes(section)) {
      setActiveSection(section);
      writePageToUrl(section);
    } else {
      // Blocked section — show login modal
      setAuthTab("login");
      setShowAuthModal(true);
    }
  };
 
  const handleRequireLogin = (tab = "login") => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };
 
  const sectionMap = {
    home:       <HomePage onNavigate={handleNavigate} />,
    shop:       <GuestShopSection onNavigate={handleNavigate} onRequireLogin={handleRequireLogin} />,
    helpcenter: <HelpCenterSection onNavigate={handleNavigate} />,
    faq:        <FAQSection onNavigate={handleNavigate} />,
    privacy:    <PrivacyPolicySection />,
    terms:      <TermsSection />,
    contact:    <ContactSection />,
  };

  useEffect(() => {
    const handlePopState = () => setActiveSection(readPageFromUrl("home", GUEST_PAGE_IDS));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
 
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
 
      {/* Navbar with Login/Signup buttons */}
      <GuestNavbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogin={() => handleRequireLogin("login")}
        onSignup={() => handleRequireLogin("register")}
      />
 
      <FlashSaleBanner />
 
      <div style={{ flex:1 }}>
        {sectionMap[activeSection] || sectionMap.home}
      </div>
 
      <Footer onNavigate={handleNavigate} />
 
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialTab={authTab}
          onClose={closeAuthModal}
        />
      )}
    </div>
  );
}

function GuestNavbar({ activeSection, onNavigate, onLogin, onSignup }) {
  const { state, dispatch } = useApp();
  const T = getT(state.theme);
 
  return (
    <nav style={{
      background: T.surface,
      borderBottom: `1px solid ${T.border}`,
      padding: "0 2rem",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 200,
    }}>
      {/* Left: Logo */}
      <div
        onClick={() => onNavigate("home")}
        style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}
      >
        <BharatCartLogo />
      </div>
 
      {/* Center: Nav links */}
      {/* <div style={{ display:"flex", gap:4, alignItems:"center" }}>
        {[
          ["home", "🏠 Home"],
          ["shop", "🛍️ Shop"],
          ["helpcenter", "❓ Help"],
          ["contact", "💬 Contact"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              background: activeSection === id ? T.accentBg : "transparent",
              color:      activeSection === id ? T.accent   : T.muted,
              transition: "all 0.2s",
            }}
          >{label}</button>
        ))}
      </div> */}
 
      {/* Right: Theme toggle + Login + Sign Up */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
 
        {/* Theme toggle */}
        <button
          onClick={() => dispatch({ type:"TOGGLE_THEME" })}
          style={{
            width:36, height:36, borderRadius:8,
            border:`1px solid ${T.border}`, background:"transparent",
            cursor:"pointer", fontSize:16, display:"flex",
            alignItems:"center", justifyContent:"center",
          }}
          title="Toggle theme"
        >
          {state.theme === "dark" ? "☀️" : "🌙"}
        </button>
 
        {/* Login button */}
        <button
          onClick={onLogin}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.text,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
        >
          Sign In
        </button>
 
        {/* Sign Up button */}
        <button
          onClick={onSignup}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Sign Up →
        </button>
      </div>
    </nav>
  );
}