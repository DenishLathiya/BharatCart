// import { useState, useEffect } from "react";
// import { Badge, fmt, getT, baseStyles } from "./ui.jsx";
// import { useApp } from "../context/AppContext";
// import RecommendationsSection from "../App.jsx";

// // ── Product Detail Modal ────────────────────────────────────────
// function ProductDetailModal({ product, open, onClose, inCart, inWishlist, onAddToCart, onToggleWish }) {
//   const { state } = useApp();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);
//   const [imgError, setImgError] = useState(false);

//   if (!open || !product) return null;

//   const handleAddToCart = (e) => {
//     e.stopPropagation();
//     onAddToCart(product._id || product.id);
//   };

//   const handleWishlist = (e) => {
//     e.stopPropagation();
//     onToggleWish(product._id || product.id);
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         style={{
//           position:   "fixed",
//           inset:      0,
//           background: "rgba(0,0,0,0.75)",
//           zIndex:     1000,
//           backdropFilter: "blur(6px)",
//         }}
//       />

//       {/* Modal box */}
//       <div
//         onClick={e => e.stopPropagation()}
//         style={{
//           position:  "fixed",
//           top:       "50%",
//           left:      "50%",
//           transform: "translate(-50%, -50%)",
//           zIndex:    1001,
//           width:     "92%",
//           maxWidth:  780,
//           maxHeight: "88vh",
//           overflowY: "auto",
//           background:   T.surface,
//           border:       `1px solid ${T.border}`,
//           borderRadius: 20,
//           boxShadow:    "0 40px 100px rgba(0,0,0,0.6)",
//         }}
//       >
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           style={{
//             position:   "absolute",
//             top:        14,
//             right:      14,
//             zIndex:     10,
//             width:      36,
//             height:     36,
//             borderRadius: "50%",
//             background: "rgba(0,0,0,0.5)",
//             border:     "1px solid rgba(255,255,255,0.15)",
//             color:      "#fff",
//             fontSize:   20,
//             cursor:     "pointer",
//             display:    "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             lineHeight: 1,
//           }}
//         >×</button>

//         {/* Content grid */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "1fr 1fr",
//         }}>

//           {/* Left — image */}
//           <div style={{
//             background:     T.surface2,
//             minHeight:      360,
//             display:        "flex",
//             alignItems:     "center",
//             justifyContent: "center",
//             position:       "relative",
//             overflow:       "hidden",
//             borderRadius:   "20px 0 0 20px",
//           }}>
//             {product.image && !imgError ? (
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 onError={() => setImgError(true)}
//                 style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 360 }}
//               />
//             ) : (
//               <span style={{ fontSize: 90 }}>{product.emoji}</span>
//             )}

//             {/* Out of stock overlay */}
//             {product.stock === 0 && (
//               <div style={{
//                 position:       "absolute",
//                 inset:          0,
//                 background:     "rgba(0,0,0,0.65)",
//                 display:        "flex",
//                 alignItems:     "center",
//                 justifyContent: "center",
//               }}>
//                 <span style={{
//                   background:    "rgba(224,92,92,0.9)",
//                   color:         "#fff",
//                   padding:       "8px 20px",
//                   borderRadius:  8,
//                   fontSize:      13,
//                   fontWeight:    800,
//                   letterSpacing: "0.05em",
//                 }}>OUT OF STOCK</span>
//               </div>
//             )}
//           </div>

//           {/* Right — details */}
//           <div style={{ padding: "2rem" }}>

//             {/* Category badge */}
//             <Badge color="accent">{product.category}</Badge>

//             {/* Product name */}
//             <h2 style={{
//               fontSize:      22,
//               fontWeight:    900,
//               margin:        "12px 0 8px",
//               color:         T.text,
//               lineHeight:    1.25,
//               letterSpacing: "-0.03em",
//             }}>
//               {product.name}
//             </h2>

//               {/* Rating row */}

//               <div style={{ gridColumn: "1 / -1", padding: "0 2.5rem 2.5rem", borderTop: `1px solid ${T.border}`, paddingTop: "2rem" }}>
//                 <RecommendationsSection
//                   currentProductId={product._id || product.id}
//                   currentCategory={product.category}
//                   title="Similar Products"
//                 />
//               </div>
//             {/* Price */}
//             <div style={{
//               fontSize:      32,
//               fontWeight:    900,
//               letterSpacing: "-0.04em",
//               marginBottom:  16,
//               color:         T.accent,
//             }}>
//               {/* {fmt.currency(product.price)} */} <SalePriceDisplay product={product} />
//             </div>

//             {/* Description */}
//             <p style={{
//               fontSize:    14,
//               color:       T.muted,
//               lineHeight:  1.75,
//               marginBottom: 18,
//             }}>
//               {product.description || "No description available."}
//             </p>

//             {/* Stock status */}
//             <div style={{
//               display:    "flex",
//               alignItems: "center",
//               gap:        10,
//               marginBottom: 18,
//               padding:    "10px 14px",
//               borderRadius: 12,
//               background: T.surface2,
//               border:     `1px solid ${T.border}`,
//             }}>
//               <span style={{ fontSize: 18 }}>{product.stock > 0 ? "✅" : "❌"}</span>
//               <div>
//                 <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
//                   {product.stock > 0 ? "In Stock" : "Out of Stock"}
//                 </p>
//                 {product.stock > 0 && (
//                   <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
//                     {product.stock} units available
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Stats grid */}
//             <div style={{
//               display:             "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap:                 8,
//               marginBottom:        20,
//             }}>
//               {[
//                 { label: "Category", value: product.category },
//                 { label: "Rating",   value: `${product.rating} / 5 ⭐` },
//                 { label: "Sold",     value: `${product.sales || 0} units` },
//                 { label: "Stock",    value: product.stock > 0 ? `${product.stock} left` : "Sold out" },
//               ].map(stat => (
//                 <div key={stat.label} style={{
//                   background:   T.surface2,
//                   borderRadius: 10,
//                   padding:      "10px 12px",
//                   border:       `1px solid ${T.border}`,
//                 }}>
//                   <p style={{
//                     fontSize:      10,
//                     color:         T.muted,
//                     textTransform: "uppercase",
//                     letterSpacing: "0.08em",
//                     fontWeight:    700,
//                     marginBottom:  4,
//                     margin:        "0 0 4px 0",
//                   }}>
//                     {stat.label}
//                   </p>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
//                     {stat.value}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Action buttons */}
//             <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
//               <button
//                 disabled={product.stock === 0}
//                 onClick={handleAddToCart}
//                 style={{
//                   flex:         1,
//                   padding:      "13px 0",
//                   borderRadius: 12,
//                   border:       "none",
//                   cursor:       product.stock === 0 ? "not-allowed" : "pointer",
//                   fontSize:     14,
//                   fontWeight:   800,
//                   fontFamily:   "inherit",
//                   background:   inCart
//                     ? "rgba(42,157,110,0.15)"
//                     : "linear-gradient(135deg, #c9a84c, #e8c97a)",
//                   color:        inCart ? "#2a9d6e" : "#0a0908",
//                   opacity:      product.stock === 0 ? 0.45 : 1,
//                   transition:   "all 0.2s",
//                 }}
//               >
//                 {product.stock === 0 ? "Unavailable" : inCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
//               </button>

//               <button
//                 onClick={handleWishlist}
//                 style={{
//                   width:        50,
//                   borderRadius: 12,
//                   border:       `1px solid ${T.border}`,
//                   background:   inWishlist ? "rgba(201,168,76,0.15)" : T.surface2,
//                   cursor:       "pointer",
//                   fontSize:     20,
//                   display:      "flex",
//                   alignItems:   "center",
//                   justifyContent: "center",
//                   transition:   "all 0.2s",
//                 }}
//               >
//                 {inWishlist ? "❤️" : "🤍"}
//               </button>
//             </div>

//             {/* Guarantees */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//               {[
//                 { icon: "🚚", text: "Free delivery on orders above ₹999" },
//                 { icon: "↩️", text: "Easy 30-day returns" },
//                 { icon: "🔒", text: "Secure & encrypted checkout" },
//               ].map(item => (
//                 <div key={item.text} style={{
//                   display:    "flex",
//                   alignItems: "center",
//                   gap:        8,
//                   fontSize:   12,
//                   color:      T.muted,
//                 }}>
//                   <span>{item.icon}</span>
//                   <span>{item.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Related Products */}
//         <div style={{ gridColumn: "1 / -1", padding: "0 2.5rem 2.5rem", borderTop: `1px solid ${T.border}`, paddingTop: "2rem" }}>
//           <RecommendationsSection
//             currentProductId={product._id || product.id}
//             currentCategory={product.category}
//             title="Similar Products"
//           />
//         </div>
//     </>
    
//   );
// }

// function useSalePrice(product) {
//   const [saleInfo, setSaleInfo] = useState(null);

//   useEffect(() => {
//     try {
//       const cached = localStorage.getItem("sv_active_sales");
//       if (cached) {
//         const activeSales = JSON.parse(cached);
//         const now = Date.now();
//         for (const sale of activeSales) {
//           if (new Date(sale.endTime) < now) continue;
//           const productId = (product._id || product.id)?.toString();
//           const appliesToProduct =
//             (sale.products?.length === 0 && sale.categories?.length === 0) ||
//             sale.products?.some(p => (p._id || p)?.toString() === productId) ||
//             sale.categories?.includes(product.category);
//           if (appliesToProduct) {
//             const salePrice = Math.round(product.price * (1 - sale.discount / 100));
//             setSaleInfo({ salePrice, discount: sale.discount, badge: sale.badge, endTime: sale.endTime });
//             return;
//           }
//         }
//       }
//     } catch {}
//     setSaleInfo(null);
//   }, [product]);

//   return saleInfo;
// }

// function SalePriceDisplay({ product, large = false }) {
//   const { state } = useApp();
//   const T = getT(state.theme);
//   const saleInfo = useSalePrice(product);

//   const priceStyle = {
//     fontSize:      large ? 32 : 20,
//     fontWeight:    900,
//     letterSpacing: "-0.03em",
//   };

//   if (!saleInfo) return (
//     <div style={{ ...priceStyle, color: T.accent }}>{fmt.currency(product.price)}</div>
//   );

//   return (
//     <div>
//       <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
//         <span style={{ ...priceStyle, color: T.danger }}>{fmt.currency(saleInfo.salePrice)}</span>
//         <span style={{ fontSize: large ? 16 : 12, color: T.muted, textDecoration: "line-through" }}>
//           {fmt.currency(product.price)}
//         </span>
//         <span style={{
//           fontSize:     10,
//           fontWeight:   800,
//           background:   T.danger,
//           color:        "#fff",
//           padding:      "2px 6px",
//           borderRadius: 6,
//         }}>
//           -{saleInfo.discount}%
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Product Card ────────────────────────────────────────────────
// export default function ProductCard({ product, inCart, inWishlist, onAddToCart, onToggleWish }) {
//   const { state } = useApp();
//   const T = getT(state.theme);
//   const s = baseStyles(state.theme);
//   const [hover,      setHover]      = useState(false);
//   const [imgError,   setImgError]   = useState(false);
//   const [detailOpen, setDetailOpen] = useState(false);

//   const productId = product._id || product.id;

//   const handleCardClick = () => {
//     // Track recently viewed
//     try {
//       const KEY  = "sv_recently_viewed";
//       const id   = (product._id || product.id)?.toString();
//       const list = JSON.parse(localStorage.getItem(KEY) || "[]").filter(i => i !== id);
//       list.unshift(id);
//       localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
//     } catch {}
//     setDetailOpen(true);
//   };
//   const handleWishClick = (e) => {
//     e.stopPropagation();
//     onToggleWish(productId);
//   };

//   const handleCartClick = (e) => {
//     e.stopPropagation();
//     onAddToCart(productId);
//   };

//   return (
//     <>
//       {/* ── Card ── */}
//       <div
//         onClick={handleCardClick}
//         onMouseEnter={() => setHover(true)}
//         onMouseLeave={() => setHover(false)}
//         style={{
//           ...s.card,
//           overflow:   "hidden",
//           cursor:     "pointer",
//           transition: "all 0.25s ease",
//           transform:  hover ? "translateY(-6px)" : "translateY(0)",
//           boxShadow:  hover
//             ? "0 20px 50px rgba(124,111,255,0.18)"
//             : s.card.boxShadow,
//           borderColor: hover ? "rgba(124,111,255,0.4)" : T.border,
//         }}
//       >
//         {/* Image area */}
//         <div style={{
//           height:         150,
//           display:        "flex",
//           alignItems:     "center",
//           justifyContent: "center",
//           background:     T.surface2,
//           position:       "relative",
//           overflow:       "hidden",
//           fontSize:       52,
//         }}>
//           {product.image && !imgError ? (
//             <img
//               src={product.image}
//               alt={product.name}
//               onError={() => setImgError(true)}
//               style={{
//                 width:      "100%",
//                 height:     "100%",
//                 objectFit:  "cover",
//                 transition: "transform 0.4s ease",
//                 transform:  hover ? "scale(1.08)" : "scale(1)",
//               }}
//             />
//           ) : (
//             <span style={{
//               transition: "transform 0.3s",
//               transform:  hover ? "scale(1.1)" : "scale(1)",
//             }}>
//               {product.emoji}
//             </span>
//           )}

//           {/* Hover hint */}
//           {hover && product.stock > 0 && (
//             <div style={{
//               position:       "absolute",
//               bottom:         0,
//               left:           0,
//               right:          0,
//               background:     "rgba(124,111,255,0.85)",
//               padding:        "6px 0",
//               textAlign:      "center",
//               fontSize:       11,
//               color:          "#fff",
//               fontWeight:     700,
//               letterSpacing:  "0.05em",
//             }}>
//               TAP TO VIEW DETAILS
//             </div>
//           )}

//           {/* Wishlist button */}
//           <button
//             onClick={handleWishClick}
//             style={{
//               position:       "absolute",
//               top:            10,
//               right:          10,
//               background:     inWishlist
//                 ? "rgba(201,168,76,0.9)"
//                 : "rgba(0,0,0,0.45)",
//               border:         "none",
//               borderRadius:   "50%",
//               width:          34,
//               height:         34,
//               cursor:         "pointer",
//               fontSize:       15,
//               display:        "flex",
//               alignItems:     "center",
//               justifyContent: "center",
//               zIndex:         2,
//               transition:     "all 0.2s",
//             }}
//           >
//             {inWishlist ? "❤️" : "🤍"}
//           </button>

//           {/* Out of stock overlay */}
//           {product.stock === 0 && (
//             <div style={{
//               position:       "absolute",
//               inset:          0,
//               background:     "rgba(0,0,0,0.65)",
//               display:        "flex",
//               alignItems:     "center",
//               justifyContent: "center",
//               zIndex:         1,
//             }}>
//               <span style={{
//                 background:    "rgba(224,92,92,0.9)",
//                 color:         "#fff",
//                 padding:       "5px 14px",
//                 borderRadius:  8,
//                 fontSize:      11,
//                 fontWeight:    800,
//                 letterSpacing: "0.05em",
//               }}>OUT OF STOCK</span>
//             </div>
//           )}
//         </div>

//         {/* Card body */}
//         <div style={{ padding: "1rem" }}>
//           <div style={{ marginBottom: 6 }}>
//             <Badge color="accent">{product.category}</Badge>
//           </div>

//           <h3 style={{
//             fontSize:   14,
//             fontWeight: 700,
//             margin:     "8px 0 5px",
//             lineHeight: 1.3,
//             color:      T.text,
//           }}>
//             {product.name}
//           </h3>

//           <p style={{
//             fontSize:   12,
//             color:      T.muted,
//             marginBottom: 8,
//             lineHeight: 1.5,
//             overflow:   "hidden",
//             display:    "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//           }}>
//             {product.description}
//           </p>

//           <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 10 }}>
//             {fmt.stars(product.rating)}{" "}
//             <span style={{ color: T.muted }}>({product.rating})</span>
//           </div>

//           <div style={{
//             display:        "flex",
//             alignItems:     "center",
//             justifyContent: "space-between",
//             marginBottom:   12,
//           }}>
//             <span style={{
//               fontSize:      18,
//               fontWeight:    900,
//               color:         T.accent,
//               letterSpacing: "-0.02em",
//             }}>
//               {/* {fmt.currency(product.price)} */}
//               <SalePriceDisplay product={product} />
//             </span>
//             {product.stock > 0 && (
//               <span style={{ fontSize: 11, color: T.muted }}>
//                 {product.stock} left
//               </span>
//             )}
//           </div>

//           {/* Add to cart button */}
//           <button
//             disabled={product.stock === 0}
//             onClick={handleCartClick}
//             style={{
//               ...s.btn(inCart ? "success" : "primary"),
//               width:          "100%",
//               padding:        "9px 0",
//               fontSize:       13,
//               alignItems:     "center",
//               justifyContent: "center",
//               opacity:        product.stock === 0 ? 0.4 : 1,
//               cursor:         product.stock === 0 ? "not-allowed" : "pointer",
//             }}
//           >
//             {product.stock === 0 ? "Unavailable" : inCart ? "✓ In Cart" : "Add to Cart"}
//           </button>
//         </div>
//       </div>

//       {/* ── Detail Modal ── */}
//       <ProductDetailModal
//         product={product}
//         open={detailOpen}
//         onClose={() => setDetailOpen(false)}
//         inCart={inCart}
//         inWishlist={inWishlist}
//         onAddToCart={onAddToCart}
//         onToggleWish={onToggleWish}
//       />
//     </>
//   );
// }

import { useState, useEffect } from "react";
import { Badge, fmt, getT, baseStyles } from "./ui.jsx";
import { useApp } from "../context/AppContext";
import ProductReviews from "./ProductReviews.jsx";

// ── Sale Price Hook ─────────────────────────────────────────────
function useSalePrice(product) {
  const [saleInfo, setSaleInfo] = useState(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("sv_active_sales");
      if (cached) {
        const activeSales = JSON.parse(cached);
        const now = Date.now();
        for (const sale of activeSales) {
          if (new Date(sale.endTime) < now) continue;
          const productId = (product._id || product.id)?.toString();
          const appliesToProduct =
            (sale.products?.length === 0 && sale.categories?.length === 0) ||
            sale.products?.some(p => (p?._id || p)?.toString() === productId) ||
            sale.categories?.includes(product.category);
          if (appliesToProduct) {
            const salePrice = Math.round(product.price * (1 - sale.discount / 100));
            setSaleInfo({ salePrice, discount: sale.discount, badge: sale.badge, endTime: sale.endTime });
            return;
          }
        }
      }
    } catch {}
    setSaleInfo(null);
  }, [product]);

  return saleInfo;
}

// ── Sale Price Display ──────────────────────────────────────────
function SalePriceDisplay({ product, large = false }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const saleInfo = useSalePrice(product);

  const priceStyle = {
    fontSize:      large ? 32 : 20,
    fontWeight:    900,
    letterSpacing: "-0.03em",
  };

  if (!saleInfo) return (
    <div style={{ ...priceStyle, color: T.accent }}>{fmt.currency(product.price)}</div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ ...priceStyle, color: T.danger }}>{fmt.currency(saleInfo.salePrice)}</span>
        <span style={{ fontSize: large ? 16 : 12, color: T.muted, textDecoration: "line-through" }}>
          {fmt.currency(product.price)}
        </span>
        <span style={{
          fontSize:     10,
          fontWeight:   800,
          background:   T.danger,
          color:        "#fff",
          padding:      "2px 6px",
          borderRadius: 6,
        }}>
          -{saleInfo.discount}%
        </span>
      </div>
    </div>
  );
}

// ── Product Detail Modal ────────────────────────────────────────
export function ProductDetailModal({ product, open, onClose, inCart, inWishlist, onAddToCart, onToggleWish }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const productImages = [...new Set([...(product?.images || []), product?.image].filter(Boolean))];
  const [selectedImage, setSelectedImage] = useState(productImages[0] || "");
  const [failedImages, setFailedImages] = useState([]);

  useEffect(() => {
    setSelectedImage(productImages[0] || "");
    setFailedImages([]);
  }, [product?._id, product?.id, open]);

  if (!open || !product) return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product._id || product.id);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWish(product._id || product.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:       "fixed",
          inset:          0,
          background:     "rgba(0,0,0,0.75)",
          zIndex:         1000,
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal box */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:     "fixed",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%, -50%)",
          zIndex:       1001,
          width:        "92%",
          maxWidth:     1040,
          maxHeight:    "88vh",
          overflowY:    "auto",
          background:   T.surface,
          border:       `1px solid ${T.border}`,
          borderRadius: 20,
          boxShadow:    "0 40px 100px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position:       "absolute",
            top:            14,
            right:          14,
            zIndex:         10,
            width:          36,
            height:         36,
            borderRadius:   "50%",
            background:     "rgba(0,0,0,0.5)",
            border:         "1px solid rgba(255,255,255,0.15)",
            color:          "#fff",
            fontSize:       20,
            cursor:         "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            lineHeight:     1,
          }}
        >×</button>

        {/* Content grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
        }}>

          {/* Left — image */}
          <div style={{
            background:     T.surface2,
            minHeight:      440,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            position:       "relative",
            overflow:       "hidden",
            padding:        18,
            gap:            12,
            borderRadius:   "20px 0 0 20px",
          }}>
            {selectedImage && !failedImages.includes(selectedImage) ? (
              <img
              src={selectedImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => {
                setFailedImages(current => [...current, selectedImage]);
                const fallbackImage = productImages.find(image => image !== selectedImage && !failedImages.includes(image));
                if (fallbackImage) setSelectedImage(fallbackImage);
              }}
              style={{ width: "100%", height: 390, objectFit: "contain", borderRadius: 12 }}
            />
            ) : (
              <span style={{ fontSize: 90, minHeight: 390, display:"grid", placeItems:"center" }}>{product.emoji}</span>
            )}
            {productImages.length > 1 && (
              <div role="group" aria-label="Product images" style={{ display:"flex", gap:8, maxWidth:"100%", overflowX:"auto", padding:3 }}>
                {productImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    onClick={() => setSelectedImage(image)}
                    style={{
                      flex:"0 0 64px", width:64, height:64, padding:3, borderRadius:9,
                      border:`2px solid ${selectedImage === image ? T.accent : T.border}`,
                      background:T.surface, cursor:"pointer",
                    }}
                  >
                    <img src={image} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:5 }} />
                  </button>
                ))}
              </div>
            )}

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div style={{
                position:       "absolute",
                inset:          0,
                background:     "rgba(0,0,0,0.65)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}>
                <span style={{
                  background:    "rgba(224,92,92,0.9)",
                  color:         "#fff",
                  padding:       "8px 20px",
                  borderRadius:  8,
                  fontSize:      13,
                  fontWeight:    800,
                  letterSpacing: "0.05em",
                }}>OUT OF STOCK</span>
              </div>
            )}
          </div>

          {/* Right — details */}
          <div style={{ padding: "2rem" }}>

            {/* Category badge */}
            <Badge color="accent">{product.category}</Badge>

            {/* Product name */}
            <h2 style={{
              fontSize:      26,
              fontWeight:    900,
              margin:        "12px 0 8px",
              color:         T.text,
              lineHeight:    1.25,
              letterSpacing: "-0.03em",
            }}>
              {product.name}
            </h2>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, fontSize:13 }}>
              <span style={{ color:"#f59e0b", letterSpacing:1 }}>{fmt.stars(product.rating)}</span>
              <span style={{ color:T.text, fontWeight:700 }}>{Number(product.rating || 0).toFixed(1)}</span>
              <span style={{ color:T.muted }}>· {product.sales || 0} sold</span>
            </div>

            {/* Price */}  {/* ✅ Fixed: removed misplaced RecommendationsSection that was here */}
            <div style={{
              fontSize:      32,
              fontWeight:    900,
              letterSpacing: "-0.04em",
              marginBottom:  16,
              color:         T.accent,
            }}>
              <SalePriceDisplay product={product} /> {/* ✅ Fixed: removed commented-out dead code */}
            </div>

            {/* Description */}
            <p style={{
              fontSize:     14,
              color:        T.muted,
              lineHeight:   1.75,
              marginBottom: 18,
            }}>
              {product.description || "No description available."}
            </p>

            <div style={{ display:"grid", gap:8, marginBottom:16 }}>
              {[
                ["✓", "Quality checked before dispatch"],
                ["↩", "Easy returns on eligible products"],
                ["🔒", "Secure checkout and payment"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display:"flex", alignItems:"center", gap:9, color:T.muted, fontSize:12 }}>
                  <span style={{ color:T.success, fontWeight:900 }}>{icon}</span>{text}
                </div>
              ))}
            </div>

            {/* Stock status */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              marginBottom: 18,
              padding:      "10px 14px",
              borderRadius: 12,
              background:   T.surface2,
              border:       `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: 18 }}>{product.stock > 0 ? "✅" : "❌"}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>
                {product.stock > 0 && (
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>
                    {product.stock} units available
                  </p>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:                 8,
              marginBottom:        20,
            }}>
              {[
                { label: "Category", value: product.category },
                { label: "Sold",     value: `${product.sales || 0} units` },
                { label: "Stock",    value: product.stock > 0 ? `${product.stock} left` : "Sold out" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background:   T.surface2,
                  borderRadius: 10,
                  padding:      "10px 12px",
                  border:       `1px solid ${T.border}`,
                }}>
                  <p style={{
                    fontSize:      10,
                    color:         T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight:    700,
                    margin:        "0 0 4px 0",
                  }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                style={{
                  flex:         1,
                  padding:      "13px 0",
                  borderRadius: 12,
                  border:       "none",
                  cursor:       product.stock === 0 ? "not-allowed" : "pointer",
                  fontSize:     14,
                  fontWeight:   800,
                  fontFamily:   "inherit",
                  background:   inCart
                    ? "rgba(42,157,110,0.15)"
                    : "linear-gradient(135deg, #c9a84c, #e8c97a)",
                  color:        inCart ? "#2a9d6e" : "#0a0908",
                  opacity:      product.stock === 0 ? 0.45 : 1,
                  transition:   "all 0.2s",
                }}
              >
                {product.stock === 0 ? "Unavailable" : inCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
              </button>

              <button
                onClick={handleWishlist}
                style={{
                  width:          50,
                  borderRadius:   12,
                  border:         `1px solid ${T.border}`,
                  background:     inWishlist ? "rgba(201,168,76,0.15)" : T.surface2,
                  cursor:         "pointer",
                  fontSize:       20,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "all 0.2s",
                }}
              >
                {inWishlist ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Guarantees */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: "🚚", text: "Free delivery on orders above ₹999" },
                { icon: "↩️", text: "Easy 30-day returns" },
                { icon: "🔒", text: "Secure & encrypted checkout" },
              ].map(item => (
                <div key={item.text} style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        8,
                  fontSize:   12,
                  color:      T.muted,
                }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProductReviews productId={product._id || product.id} />

        {/* ✅ Fixed: Single RecommendationsSection, correctly placed INSIDE modal box, AFTER the grid
        <div style={{
          padding:    "2rem 2.5rem 2.5rem",
          borderTop:  `1px solid ${T.border}`,
        }}>
          <RecommendationsSection
            currentProductId={product._id || product.id}
            currentCategory={product.category}
            title="Similar Products"
          />
        </div> */}

      </div>{/* end modal box */}
    </>
  );
}

// ── Product Card ────────────────────────────────────────────────
export default function ProductCard({ product, inCart, inWishlist, onAddToCart, onToggleWish }) {
  const { state } = useApp();
  const T = getT(state.theme);
  const s = baseStyles(state.theme);
  const [hover,      setHover]      = useState(false);
  const [imgError,   setImgError]   = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  if (!product || typeof product !== "object") return null;

  const productId = product._id || product.id;
  const primaryImage = product.images?.[0] || product.image;

  const handleCardClick = () => {
    // Track recently viewed
    try {
      const KEY  = "sv_recently_viewed";
      const id   = (product._id || product.id)?.toString();
      const list = JSON.parse(localStorage.getItem(KEY) || "[]").filter(i => i !== id);
      list.unshift(id);
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
    } catch {}
    setDetailOpen(true);
  };

  const handleWishClick = (e) => {
    e.stopPropagation();
    onToggleWish(productId);
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(productId);
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...s.card,
          display:     "flex",
          flexDirection: "column",
          height:       "100%",
          overflow:    "hidden",
          cursor:      "pointer",
          transition:  "all 0.25s ease",
          transform:   hover ? "translateY(-6px)" : "translateY(0)",
          boxShadow:   hover
            ? "0 20px 50px rgba(124,111,255,0.18)"
            : s.card.boxShadow,
          borderColor: hover ? "rgba(124,111,255,0.4)" : T.border,
        }}
      >
        {/* Image area */}
        <div style={{
          height:         190,
          flexShrink:     0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     `linear-gradient(145deg, ${T.surface2}, ${T.surface})`,
          position:       "relative",
          overflow:       "hidden",
          fontSize:       52,
          padding:        12,
          boxSizing:      "border-box",
        }}>
       {primaryImage && !imgError ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              style={{
                width:      "100%",
                height:     "100%",
                objectFit:  "contain",
                transition: "transform 0.4s ease",
                transform:  hover ? "scale(1.04)" : "scale(1)",
              }}
            />
          ) : (
            <span style={{
              transition: "transform 0.3s",
              transform:  hover ? "scale(1.1)" : "scale(1)",
            }}>
              {product.emoji}
            </span>
          )}
          {product.images?.length > 1 && (
            <span style={{ position:"absolute", left:8, bottom:8, padding:"3px 7px", borderRadius:6, background:"rgba(0,0,0,.65)", color:"#fff", fontSize:10, fontWeight:700 }}>
              +{product.images.length - 1} photos
            </span>
          )}

          {/* Hover hint */}
          {hover && product.stock > 0 && (
            <div style={{
              position:      "absolute",
              bottom:        0,
              left:          0,
              right:         0,
              background:    "rgba(124,111,255,0.85)",
              padding:       "6px 0",
              textAlign:     "center",
              fontSize:      11,
              color:         "#fff",
              fontWeight:    700,
              letterSpacing: "0.05em",
            }}>
              TAP TO VIEW DETAILS
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishClick}
            style={{
              position:       "absolute",
              top:            10,
              right:          10,
              background:     inWishlist
                ? "rgba(201,168,76,0.9)"
                : "rgba(0,0,0,0.45)",
              border:         "none",
              borderRadius:   "50%",
              width:          34,
              height:         34,
              cursor:         "pointer",
              fontSize:       15,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              zIndex:         2,
              transition:     "all 0.2s",
            }}
          >
            {inWishlist ? "❤️" : "🤍"}
          </button>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div style={{
              position:       "absolute",
              inset:          0,
              background:     "rgba(0,0,0,0.65)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              zIndex:         1,
            }}>
              <span style={{
                background:    "rgba(224,92,92,0.9)",
                color:         "#fff",
                padding:       "5px 14px",
                borderRadius:  8,
                fontSize:      11,
                fontWeight:    800,
                letterSpacing: "0.05em",
              }}>OUT OF STOCK</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ marginBottom: 6 }}>
            <Badge color="accent">{product.category}</Badge>
          </div>

          <h3 style={{
            fontSize:   14,
            fontWeight: 700,
            margin:     "8px 0 5px",
            lineHeight: 1.3,
            color:      T.text,
            minHeight:  36,
            overflow:   "hidden",
            display:    "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {product.name}
          </h3>

          <p style={{
            fontSize:        12,
            color:           T.muted,
            marginBottom:    8,
            lineHeight:      1.5,
            minHeight:       36,
            overflow:        "hidden",
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {product.description}
          </p>

          <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 10 }}>
            {fmt.stars(product.rating)}{" "}
            <span style={{ color: T.muted }}>({product.rating})</span>
          </div>

          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            marginBottom:   12,
            marginTop:      "auto",
          }}>
            <span style={{
              fontSize:      18,
              fontWeight:    900,
              color:         T.accent,
              letterSpacing: "-0.02em",
            }}>
              <SalePriceDisplay product={product} /> {/* ✅ Fixed: removed commented-out dead code */}
            </span>
            {product.stock > 0 && (
              <span style={{ fontSize: 11, color: T.muted }}>
                {product.stock} left
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            disabled={product.stock === 0}
            onClick={handleCartClick}
            style={{
              ...s.btn(inCart ? "success" : "primary"),
              width:          "100%",
              padding:        "9px 0",
              fontSize:       13,
              alignItems:     "center",
              justifyContent: "center",
              opacity:        product.stock === 0 ? 0.4 : 1,
              cursor:         product.stock === 0 ? "not-allowed" : "pointer",
            }}
          >
            {product.stock === 0 ? "Unavailable" : inCart ? "✓ In Cart" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <ProductDetailModal
        product={product}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        inCart={inCart}
        inWishlist={inWishlist}
        onAddToCart={onAddToCart}
        onToggleWish={onToggleWish}
      />
    </>
  );
}