import { useState } from "react";
import { getT, baseStyles, Badge, fmt } from "./ui.jsx";
import { useApp } from "../context/AppContext";
import TrendingSection from "../App.jsx";
import TopRatedSection from "../App.jsx";
import RecentlyViewedSection from "../App.jsx";

export default function HomePage({ onNavigate }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const featured = (state.products || []).filter(product => product && typeof product === "object").slice(0, 6);
  const homepageAds = [...(state.ads || [])]
    .filter(ad => ad.active && ad.position === "top")
    .sort((a, b) => (a.priority || 5) - (b.priority || 5));

  const features = [
    { icon: "🚚", title: "Free Delivery",      desc: "On all orders above ₹999" },
    { icon: "↩️", title: "Easy Returns",        desc: "30-day hassle-free returns" },
    { icon: "🔒", title: "Secure Payments",     desc: "100% encrypted & safe" },
    { icon: "⭐", title: "Top Rated Products",  desc: "Curated bestsellers only" },
    { icon: "💳", title: "Multiple Payments",   desc: "Card, UPI, NetBank, COD" },
    { icon: "📱", title: "24/7 Support",        desc: "Always here to help you" },
  ];

  const categories = [
    { id: "Electronics", icon: "📱", name: "Electronics", color: "rgba(96,140,220,0.12)", border: "rgba(96,140,220,0.3)" },
    { id: "Fashion",     icon: "👕", name: "Fashion",     color: "rgba(224,92,92,0.12)",  border: "rgba(224,92,92,0.3)"  },
    { id: "Sports",      icon: "⚽", name: "Sports",      color: "rgba(58,184,122,0.12)", border: "rgba(58,184,122,0.3)" },
    { id: "Books",       icon: "📚", name: "Books",       color: "rgba(212,168,67,0.12)", border: "rgba(212,168,67,0.3)" },
  ];

  const testimonials = [
    { name: "Vasu Kakadiya",  role: "Verified Buyer",    text: "Amazing products and super fast delivery! Will definitely shop again.", rating: 5 },
    { name: "Romit Korat.", role: "Regular Customer",  text: "Best online shopping experience. Quality is absolutely top-notch!", rating: 5 },
    { name: "Chirag Kukvava",  role: "Happy Shopper",     text: "Easy website, great prices, and the support team is super helpful.", rating: 5 },
  ];

  return (
    <div style={{ background: T.bg, color: T.text }}>

      {homepageAds.length > 0 && (
        <section style={{ padding: "1.5rem 2rem 0" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gap: 16 }}>
            {homepageAds.map(ad => (
              <div
                key={ad._id || ad.id}
                onClick={() => onNavigate("shop")}
                style={{
                  borderRadius: 16,
                  padding: "1.5rem 2rem",
                  background: `linear-gradient(135deg, ${ad.bgColor || "#7c6fff"}, ${ad.bgColor2 || "#e05c8a"})`,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                  <span style={{ fontSize: 38, lineHeight: 1 }}>{ad.emoji}</span>
                  <div>
                    {ad.badgeText && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", opacity: 0.85 }}>{ad.badgeText}</div>}
                    <h2 style={{ fontSize: 20, fontWeight: 900, margin: "4px 0 0", lineHeight: 1.2 }}>{ad.title}</h2>
                    {ad.subtitle && <p style={{ fontSize: 13, margin: "6px 0 0", opacity: 0.85 }}>{ad.subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={event => { event.stopPropagation(); onNavigate("shop"); }}
                  style={{ flexShrink: 0, border: "none", borderRadius: 10, padding: "10px 18px", background: "#fff", color: ad.bgColor || "#7c6fff", fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                >
                  {ad.linkLabel || "Shop Now"} -&gt;
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
     <section style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: "5rem 2rem 4rem",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>

            {/* Left text */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 14px", borderRadius: 20,
                  background: T.accentBg, border: `1px solid ${T.accentBorder}`,
                  fontSize: 16, fontWeight: 700, color: T.accent, letterSpacing: "0.04em"
                }}>
                 <b> ✨ Welcome to BharatCart</b>
                </span>
              </div>

           <h1 style={{
                fontSize: 36, fontWeight: 900, lineHeight: 1.2,
                marginBottom: 18, letterSpacing: "-0.03em",
                //background: T.gradient,
                color: T.muted,
                //WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Your Premium Shopping Destination
              </h1>

              <p style={{
                fontSize: 17, color: T.muted, lineHeight: 1.7,
                marginBottom: 32, maxWidth: 480,
              }}>
                Discover thousands of quality products with exclusive deals, secure payments, and lightning-fast delivery across India.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
                <button onClick={() => onNavigate("shop")} style={{
                  padding: "13px 32px", borderRadius: 12, border: "none",
                  cursor: "pointer", fontSize: 14, fontWeight: 800,
                  fontFamily: "inherit", letterSpacing: "0.02em",
                  background: T.gradient, color: "#0a0908",
                  boxShadow: "0 6px 20px rgba(201,168,76,0.35)",
                  transition: "all 0.2s",
                }}>
                  🛍 Shop Now →
                </button>
                <button onClick={() => onNavigate("shop")} style={{
                  padding: "13px 28px", borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  fontFamily: "inherit", background: "transparent", color: T.text,
                  transition: "all 0.2s",
                }}>
                  Browse Categories
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 36 }}>
                {[
                  { value: "50K+", label: "Happy Customers" },
                  { value: "10K+", label: "Products" },
                  { value: "4.9★", label: "Avg Rating" },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{
                      fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em",
                      background: T.gradient,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 3, fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

       {/* Right — floating emojis */}
            <div style={{
              position: "relative", height: 320,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* Blur blobs */}
              <div style={{
                position: "absolute", width: 280, height: 280, borderRadius: "50%",
                background: T.accentBg, filter: "blur(60px)",
                top: 30, right: 20,
                animation: "svBlob1 7s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", width: 180, height: 180, borderRadius: "50%",
                background: "rgba(224,92,92,0.08)", filter: "blur(40px)",
                bottom: 30, left: 20,
                animation: "svBlob2 9s ease-in-out infinite",
              }} />

              {/* Emoji grid */}
              <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { emoji: "📱", delay: 0   },
                  { emoji: "👕", delay: 0.5 },
                  { emoji: "📚", delay: 1.0 },
                  { emoji: "⌚", delay: 1.5 },
                  { emoji: "👟", delay: 2.0 },
                  { emoji: "🎮", delay: 2.5 },
                ].map(({ emoji, delay }, i) => (
                  <div key={i} style={{
                    fontSize: 38,
                    animation: `svFloat 4s ${delay}s ease-in-out infinite`,
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
                    textAlign: "center",
                  }}>
                    {emoji}
                  </div>
                ))}
              </div>

              <style>{`
                @keyframes svFloat {
                  0%, 100% { transform: translateY(0px) rotate(-2deg); }
                  50% { transform: translateY(-22px) rotate(2deg); }
                }
                @keyframes svBlob1 {
                  0%, 100% { transform: scale(1) translate(0,0); }
                  50% { transform: scale(1.1) translate(-10px, 15px); }
                }
                @keyframes svBlob2 {
                  0%, 100% { transform: scale(1) translate(0,0); }
                  50% { transform: scale(0.9) translate(10px, -10px); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
              Why Choose BharatCart?
            </h2>
            <p style={{ fontSize: 15, color: T.muted, maxWidth: 460, margin: "0 auto" }}>
              We've made shopping easier, safer, and more rewarding than ever before.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map((f, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: T.surface,
                  border: `1px solid ${hoveredFeature === i ? T.accentBorder : T.border}`,
                  borderRadius: 16, padding: "1.75rem",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  transform: hoveredFeature === i ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: hoveredFeature === i ? T.cardShadowHover : T.cardShadow,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: T.text }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section style={{
        padding: "5rem 2rem",
        background: T.surface2,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
              Shop by Category
            </h2>
            <p style={{ fontSize: 15, color: T.muted, maxWidth: 460, margin: "0 auto" }}>
              Browse our curated collections across all categories.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate("shop")}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{
                  background: cat.color,
                  border: `2px solid ${hoveredCat === cat.id ? cat.border : "transparent"}`,
                  borderRadius: 18, padding: "2rem 1.5rem",
                  textAlign: "center", cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.25s ease",
                  transform: hoveredCat === cat.id ? "scale(1.04)" : "scale(1)",
                  boxShadow: hoveredCat === cat.id ? T.cardShadowHover : T.cardShadow,
                }}
              >
                <div style={{ fontSize: 52, marginBottom: 12 }}>{cat.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>{cat.name}</h3>
                <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Shop now →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
            <div>
              <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>
                Featured Products
              </h2>
     
              <p style={{ fontSize: 14, color: T.muted }}>Handpicked bestsellers just for you</p>
            </div>
            <button onClick={() => onNavigate("shop")} style={{
              ...s.btn("ghost"), fontSize: 13, padding: "8px 18px",
            }}>
              View All Products →
            </button>
          </div>
          

          {featured.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: T.muted, fontSize: 14 }}>
              No products loaded yet. <button onClick={() => onNavigate("shop")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Go to shop →</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {featured.map((product) => (
                <div
                  key={product._id || product.id}
                  onClick={() => onNavigate("shop")}
                  onMouseEnter={() => setHoveredProduct(product._id || product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{
                    background: T.surface,
                    border: `1px solid ${hoveredProduct === (product._id || product.id) ? T.accentBorder : T.border}`,
                    borderRadius: 18, overflow: "hidden", cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: hoveredProduct === (product._id || product.id) ? "translateY(-8px)" : "translateY(0)",
                    boxShadow: hoveredProduct === (product._id || product.id) ? T.cardShadowHover : T.cardShadow,
                  }}
                >
                  {/* Image */}
                  <div style={{
                    height: 160, background: T.surface2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 60, position: "relative", overflow: "hidden",
                  }}>
                    {(product.images?.[0] || product.image)
                      ? <img src={product.images?.[0] || product.image} alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover",
                            transition: "transform 0.4s ease",
                            transform: hoveredProduct === (product._id || product.id) ? "scale(1.08)" : "scale(1)" }}
                          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                        />
                      : null
                    }
                    <span style={{ display: product.images?.[0] || product.image ? "none" : "block", fontSize: 60 }}>{product.emoji}</span>

                    {/* Hover overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: hoveredProduct === (product._id || product.id)
                        ? "linear-gradient(to top, rgba(0,0,0,0.4), transparent)"
                        : "transparent",
                      transition: "all 0.3s",
                      display: "flex", alignItems: "flex-end", justifyContent: "center",
                      paddingBottom: 10,
                    }}>
                      {hoveredProduct === (product._id || product.id) && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 800, letterSpacing: "0.08em" }}>
                          TAP TO VIEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: T.accent,
                      background: T.accentBg, padding: "2px 8px", borderRadius: 5,
                    }}>{product.category}</span>

                    <h3 style={{ fontSize: 14, fontWeight: 800, margin: "8px 0 4px", color: T.text, letterSpacing: "-0.02em" }}>
                      {product.name}
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                      <span style={{
                        fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em",
                        background: T.gradient,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                        {fmt.currency(product.price)}
                      </span>
                      <span style={{ fontSize: 12, color: T.warning, fontWeight: 700 }}>
                        ★ {product.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════ */}
      <section style={{ padding: "0 2rem 3rem" }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto",
          background: T.gradient,
          borderRadius: 24, padding: "3.5rem 2.5rem",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", fontSize: 200, opacity: 0.06,
            top: -40, right: -20, lineHeight: 1,
          }}>🎁</div>

          <h2 style={{ fontSize: 30, fontWeight: 900, color: "#0a0908", marginBottom: 10, letterSpacing: "-0.03em" }}>
            Exclusive Offer Just for You! 🎁
          </h2>
          <p style={{ fontSize: 16, color: "rgba(10,9,8,0.75)", marginBottom: 24 }}>
            Use code <strong>FIRST20</strong> to get 20% off your order above ₹1000
          </p>
          <button onClick={() => onNavigate("shop")} style={{
            padding: "13px 36px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 14, fontWeight: 800,
            fontFamily: "inherit", background: "#0a0908", color: T.accent,
            letterSpacing: "0.02em", transition: "all 0.2s",
          }}>
            Shop with Discount →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section style={{
        padding: "5rem 2rem",
        background: T.surface2,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
              What Our Customers Say
            </h2>
            <p style={{ fontSize: 15, color: T.muted, maxWidth: 460, margin: "0 auto" }}>
              Join thousands of happy customers who trust BharatCart.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.75rem" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ color: j < t.rating ? "#f59e0b" : T.border, fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 18, fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: T.gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: "#0a0908", flexShrink: 0,
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Ready to Start Shopping?
          </h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Explore our massive collection and find exactly what you're looking for.
            Fast shipping, easy returns, and secure payments — guaranteed.
          </p>
          <button onClick={() => onNavigate("shop")} style={{
            padding: "14px 44px", borderRadius: 12, border: "none",
            cursor: "pointer", fontSize: 15, fontWeight: 800,
            fontFamily: "inherit", background: T.gradient, color: "#0a0908",
            boxShadow: "0 6px 20px rgba(201,168,76,0.4)",
            letterSpacing: "0.02em",
          }}>
            Start Shopping 🛍
          </button>
        </div>
      </section>

    </div>
  );
}