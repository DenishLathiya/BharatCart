import { useEffect, useState } from "react";
import { useApp, useToast } from "../context/AppContext";
import { reviews as reviewsApi } from "../services/api";
import { Btn, FormField, Input, baseStyles, getT } from "./ui";

const emptyReviews = { reviews: [], total: 0, avgRating: 0, breakdown: {} };

function getId(value) {
  return (value?._id || value)?.toString();
}

function StarRating({ value, onChange, size = 16 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: 4 }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: size,
            cursor: onChange ? "pointer" : "default",
            color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.15s",
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const toast = useToast();
  const [data, setData] = useState(emptyReviews);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });

  const productKey = getId(productId);
  const currentUserId = getId(state.currentUser);
  const deliveredOrders = (state.orders || []).filter(order =>
    order.status === "Delivered" &&
    (order.items || []).some(item => getId(item.product) === productKey)
  );
  const reviewedOrderIds = new Set(
    data.reviews
      .filter(review => getId(review.user) === currentUserId)
      .map(review => getId(review.order))
  );
  const eligibleOrders = deliveredOrders.filter(order => !reviewedOrderIds.has(getId(order)));

  const loadReviews = async () => {
    setLoadError("");
    try {
      const result = await reviewsApi.getByProduct(productKey);
      setData(result);
    } catch (err) {
      setLoadError(err.message || "Could not load product reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadReviews();
  }, [productKey]);

  const handleSubmit = async () => {
    if (!form.rating) {
      toast("Please select a star rating.", "error");
      return;
    }
    if (!selectedOrderId || !eligibleOrders.some(order => getId(order) === selectedOrderId)) {
      toast("A delivered order for this product is required to leave a review.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.submit({ productId: productKey, orderId: selectedOrderId, ...form });
      toast("Review submitted! Thank you.", "success");
      setShowForm(false);
      setForm({ rating: 0, title: "", body: "" });
      await loadReviews();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startReview = () => {
    setSelectedOrderId(getId(eligibleOrders[0]));
    setShowForm(true);
  };

  if (loading) return <div style={{ padding: "1.5rem", color: T.muted, fontSize: 13 }}>Loading reviews...</div>;

  return (
    <section style={{ padding: "1.5rem 2rem 2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text }}>
          Customer reviews ({data.total})
        </h3>
        {eligibleOrders.length > 0 && (
          <button onClick={() => showForm ? setShowForm(false) : startReview()} style={{ ...s.btn("primary"), padding: "8px 18px", fontSize: 13 }}>
            {showForm ? "Cancel" : "Write a review"}
          </button>
        )}
      </div>

      {loadError && (
        <div role="alert" style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>
          {loadError}{" "}
          <button
            onClick={() => { setLoading(true); loadReviews(); }}
            style={{ border: 0, padding: 0, background: "none", color: T.accent, cursor: "pointer", font: "inherit", fontWeight: 700 }}
          >
            Try again
          </button>
        </div>
      )}

      {data.total > 0 ? (
        <div style={{ ...s.card, padding: "1.25rem", marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "minmax(120px, auto) 1fr", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: T.accent, letterSpacing: "-0.04em" }}>{data.avgRating.toFixed(1)}</div>
            <StarRating value={Math.round(data.avgRating)} size={18} />
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{data.total} {data.total === 1 ? "review" : "reviews"}</div>
          </div>
          <div>
            {[5, 4, 3, 2, 1].map(star => {
              const count = data.breakdown?.[star] || 0;
              const pct = data.total ? (count / data.total) * 100 : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.muted, width: 24 }}>{star} star</span>
                  <div style={{ flex: 1, height: 8, background: T.surface2, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: T.muted, width: 24, textAlign: "right" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : !loadError ? (
        <div style={{ textAlign: "center", padding: "1.5rem", marginBottom: "1.25rem", color: T.muted, background: T.surface2, borderRadius: 12 }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>⭐</div>
          <p style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>No customer reviews yet</p>
          <p style={{ fontSize: 13 }}>Be the first to share your experience with this product.</p>
        </div>
      ) : null}

      {showForm && (
        <div style={{ ...s.card, padding: "1.25rem", marginBottom: "1.25rem", border: `1px solid ${T.accentBorder}` }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: "1rem", color: T.text }}>Write your review</h4>
          {eligibleOrders.length > 1 && (
            <FormField label="Delivered order">
              <select
                value={selectedOrderId}
                onChange={event => setSelectedOrderId(event.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit" }}
              >
                {eligibleOrders.map(order => (
                  <option key={getId(order)} value={getId(order)}>
                    Order #{getId(order).slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </option>
                ))}
              </select>
            </FormField>
          )}
          <FormField label="Rating *">
            <StarRating value={form.rating} onChange={rating => setForm(current => ({ ...current, rating }))} size={30} />
          </FormField>
          <FormField label="Review title">
            <Input
              value={form.title}
              maxLength={120}
              onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
              placeholder="Summarize your experience..."
            />
          </FormField>
          <FormField label="Your review">
            <textarea
              value={form.body}
              maxLength={1000}
              onChange={event => setForm(current => ({ ...current, body: event.target.value }))}
              placeholder="Share your detailed experience with this product..."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </FormField>
          <Btn onClick={handleSubmit} disabled={submitting || !form.rating}>
            {submitting ? "Submitting..." : "Submit review"}
          </Btn>
        </div>
      )}

      {!state.currentUser && (
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
          Sign in and receive this product to leave a verified-purchase review.
        </p>
      )}
      {state.currentUser && deliveredOrders.length === 0 && (
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
          Reviews can be left after this product has been delivered.
        </p>
      )}
      {state.currentUser && deliveredOrders.length > 0 && eligibleOrders.length === 0 && (
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
          You have reviewed all delivered purchases of this product.
        </p>
      )}

      {data.reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.reviews.map(review => {
            const reviewerName = review.user?.name || "Customer";
            return (
              <article key={review._id} style={{ ...s.card, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", background: T.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#0a0908" }}>
                      {reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{reviewerName}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <StarRating value={review.rating} size={14} />
                        {review.verified && <span style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>Verified purchase</span>}
                      </div>
                    </div>
                  </div>
                  <time dateTime={review.createdAt} style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </time>
                </div>
                {review.title && <p style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 6 }}>{review.title}</p>}
                {review.body && <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>{review.body}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
