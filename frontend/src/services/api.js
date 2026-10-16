  const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  try {
    return localStorage.getItem("sv_token");
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

async function requestForm(method, path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: formData });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const get  = (path)       => request("GET",    path);
const post = (path, body) => request("POST",   path, body);
const put  = (path, body) => request("PUT",    path, body);
const del  = (path)       => request("DELETE", path);


export const auth = {
  register:      (data)          => post("/auth/register", data),
  verifyOtp:     (userId, otp)   => post("/auth/verify-otp", { userId, otp }),
  resendOtp:     (userId)        => post("/auth/resend-otp", { userId }),
  login:         (email, password) => post("/auth/login", { email, password }),
  requestPasswordReset: (email)  => post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => post("/auth/reset-password", { token, newPassword }),
  me:            ()              => get("/auth/me"),
  updateProfile: (data)          => put("/auth/profile", data),
  changePassword:(currentPassword, newPassword) => put("/auth/password", { currentPassword, newPassword }),
  updateBankDetails: (bankDetails) => put("/auth/bank-details", { bankDetails }),
};

// ── PRODUCTS ──────────────────────────────────────────────────
export const products = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return get(`/products${qs ? "?" + qs : ""}`);
  },
  get:    (id)              => get(`/products/${id}`),
  create: (data, imageFiles = []) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v));
    imageFiles.forEach(imageFile => fd.append("images", imageFile));
    return requestForm("POST", "/products", fd);
  },
  update: (id, data, imageFiles = []) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v));
    imageFiles.forEach(imageFile => fd.append("images", imageFile));
    return requestForm("PUT", `/products/${id}`, fd);
  },
  delete: (id) => del(`/products/${id}`),
};

// ── CART ──────────────────────────────────────────────────────
export const cart = {
  get:    ()                 => get("/cart"),
  add:    (productId)        => post("/cart/add", { productId }),
  qty:    (productId, delta) => put("/cart/qty",  { productId, delta }),
  remove: (productId)        => del(`/cart/${productId}`),
  clear:  ()                 => del("/cart"),
};

// ── ORDERS ────────────────────────────────────────────────────
export const orders = {
  place:  (data)                  => post("/orders", data),
  my:     ()                      => get("/orders/my"),
  all:    ()                      => get("/orders"),
  status: (id, status, message)   => put(`/orders/${id}/status`, { status, message }),
};

// ── WISHLIST ──────────────────────────────────────────────────
export const wishlist = {
  get:    ()          => get("/wishlist"),
  toggle: (productId) => post("/wishlist/toggle", { productId }),
};

// ── COUPONS ───────────────────────────────────────────────────
export const coupons = {
  validate: (code, total) => post("/coupons/validate", { code, total }),
  list:     ()            => get("/coupons"),
  create:   (data)        => post("/coupons", data),
  update:   (id, data)    => put(`/coupons/${id}`, data),
  delete:   (id)          => del(`/coupons/${id}`),
};

// ── RETURNS ───────────────────────────────────────────────────
export const returns = {
  request: (data)     => post("/returns", data),
  my:      ()         => get("/returns/my"),
  all:     ()         => get("/returns"),
  update:  (id, data) => put(`/returns/${id}`, data),
};

// ── CONTACTS ──────────────────────────────────────────────────
export const contacts = {
  submit: (data)           => post("/contacts", data),
  my:     ()               => get("/contacts/my"),
  all:    (status, search) => get(`/contacts?status=${status || "all"}&search=${search || ""}`),
  update: (id, data)       => put(`/contacts/${id}`, data),
  remove: (id)             => del(`/contacts/${id}`),
};

// ── PAYMENTS ──────────────────────────────────────────────────
export const payments = {
  createOrder: (data)       => post("/payments/create-order", data),
  verify:      (data)       => post("/payments/verify",       data),
  cod:         (data)       => post("/payments/cod",          data),
  wallet:      (data)       => post("/payments/wallet",       data),
};

// ── PAYMENTS ──────────────────────────────────────────────────
// export const payments = {
//   createOrder: (amount) => post("/payments/create-order", { amount }),
//   verify:      (data)   => post("/payments/verify", data),
// };

// ── REVIEWS ───────────────────────────────────────────────────
export const reviews = {
  getByProduct: (productId)        => get(`/reviews/${productId}`),
  submit:       (data)             => post("/reviews", data),
  adminAll:     ()                 => get("/reviews/admin/all"),
  adminDelete:  (id)               => del(`/reviews/${id}`),
};

// ── ADDRESSES ─────────────────────────────────────────────────
export const addresses = {
  list:       ()           => get("/addresses"),
  add:        (data)       => post("/addresses", data),
  update:     (id, data)   => put(`/addresses/${id}`, data),
  remove:     (id)         => del(`/addresses/${id}`),
  setDefault: (id)         => request("PATCH", `/addresses/${id}/default`),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notifications = {
  list:       ()    => get("/notifications"),
  send:       (data) => post("/notifications/send", data),
  markRead:   (id)  => request("PUT", `/notifications/${id}/read`),
  markAllRead:()    => request("PUT", "/notifications/read-all"),
  remove:     (id)  => del(`/notifications/${id}`),
  clearAll:   ()    => del("/notifications"),
};

// ── SALES ─────────────────────────────────────────────────────
export const sales = {
  active: ()           => get("/sales/active"),
  all:    ()           => get("/sales"),
  create: (data)       => post("/sales", data),
  update: (id, data)   => put(`/sales/${id}`, data),
  remove: (id)         => del(`/sales/${id}`),
};
// ── LABEL ─────────────────────────────────────────────────────
export const label = {
  download: async (orderId) => {
    const token = localStorage.getItem("sv_token");
    const BASE  = import.meta.env.VITE_API_URL || "/api";
    const res   = await fetch(`${BASE}/label/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to generate label.");
    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `BharatCart-Label-${orderId.slice(-8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ── INVOICE ───────────────────────────────────────────────────
export const invoice = {
  download: async (orderId) => {
    const token = localStorage.getItem("sv_token");
    const res   = await fetch(`/api/invoice/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to generate invoice.");
    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `BharatCart-Invoice-${orderId.slice(-8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ── ANALYTICS ─────────────────────────────────────────────────
export const analytics = {
  overview:      ()             => get("/analytics/overview"),
  revenueChart:  (period = 30) => get(`/analytics/revenue-chart?period=${period}`),
  categoryChart: ()             => get("/analytics/category-chart"),
  topProducts:   ()             => get("/analytics/top-products"),
  customerChart: ()             => get("/analytics/customer-chart"),
  orderStatus:   ()             => get("/analytics/order-status"),
};

// ── WALLET ───────────────────────────────────────────────────
export const wallet = {
  get:          ()                             => get("/wallet"),
  topupCreate:  (amount)                       => post("/wallet/topup/create", { amount }),
  topupVerify:  (data)                         => post("/wallet/topup/verify", data),
  pay:          (amount, orderId, description) => post("/wallet/pay", { amount, orderId, description }),
  refund:       (userId, amount, orderId, description) => post("/wallet/refund", { userId, amount, orderId, description }),
  adminAll:     ()                             => get("/wallet/admin/all"),
  adminCredit:  (userId, amount, description) => post("/wallet/admin/credit", { userId, amount, description }),
  adminDebit: (userId, amount, description, refundId) =>
  post("/wallet/admin-debit", { userId, amount, description, refundId }),
  adminRefund:  (userId, amount, method, orderId, returnId, reason) => post("/wallet/admin/refund", { userId, amount, method, orderId, returnId, reason }),
  getBankRefunds: (status = "Pending") => get(`/wallet/admin/bank-refunds?status=${status}`),
  updateBankRefund: (id, status, transactionId, adminNote) => put(`/wallet/admin/bank-refunds/${id}`, { status, transactionId, adminNote }),
};

// ── ADVERTISEMENTS ──────────────────────────────────────────
export const ads = {
  list:       ()           => get("/ads"),
  adminList:  ()           => get("/ads/admin"),
  create:     (data)       => post("/ads", data),
  update:     (id, data)   => put(`/ads/${id}`, data),
  remove:     (id)         => del(`/ads/${id}`),
};

// ── BANK & REFUNDS ─────────────────────────────────────────────
export const bankApi = {
  list:               ()           => get("/bank"),
  add:                (data)       => post("/bank", data),
  update:             (id, data)   => put(`/bank/${id}`, data),
  remove:             (id)         => del(`/bank/${id}`),
  requestRefund:      (data)       => post("/bank/refund-request", data),
  myRefunds:          ()           => get("/bank/refund-requests/my"),
  adminAllAccounts:   (status)     => get(`/bank/admin/all?status=${status}`),      // ← add
  verifyAccount:      (id, note)   => put(`/bank/${id}/verify`, { adminNote: note }), // ← add
  rejectAccount:      (id, note)   => put(`/bank/${id}/reject`, { adminNote: note }), // ← add
  adminAllRefunds:    (status)     => get(`/bank/admin/refund-requests?status=${status || "all"}`),
  adminProcessRefund: (id, data)   => put(`/bank/admin/refund-requests/${id}`, data),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const admin = {
  users:            ()                 => get("/admin/users"),
  updateUserStatus: (id, status, note) => put(`/admin/users/${id}/status`, { accountStatus: status, statusNote: note }),
  deleteUser:       (id)               => del(`/admin/users/${id}`),
  analytics:        ()                 => get("/admin/analytics"),
  seed:             ()                 => post("/admin/seed"),
  payments:         ()                 => get("/admin/payments"),
  getBankDetails:   (status = "pending") => get(`/admin/bank-details?status=${status}`),
  verifyBankDetails: (userId, adminNote) => post(`/admin/bank-details/${userId}/verify`, { adminNote }),
  rejectBankDetails: (userId, adminNote) => post(`/admin/bank-details/${userId}/reject`, { adminNote }),
};