/**
 * CartPage.jsx — Solex Shoe Brand
 * ─────────────────────────────────────────────────────────────────────────
 * Self-contained JSX function component.
 *
 * Dependencies (install in your project):
 *   npm install lucide-react framer-motion
 *
 * Usage:
 *   import CartPage from './CartPage';
 *   <CartPage />
 *
 * Fonts (add to your index.html or global CSS):
 *   <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet"/>
 *
 * Tailwind config — extend theme with these custom values:
 *   fontFamily: { head: ['Barlow Condensed', 'sans-serif'], body: ['Barlow', 'sans-serif'] }
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Bookmark,
  Check,
  X,
  Plus,
  Minus,
  Lock,
  ArrowRight,
  Tag,
  Sun,
  Moon,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";

import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  addToCart,
} from "../../features/cart/CartSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CheckoutProgress from "../checkout/CheckoutProgress";

// ─── Fonts injection (if not already in your HTML) ─────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap";

const RECOMMENDED = [
  {
    id: 10,
    brand: "NEW BALANCE",
    name: "2002R Protection Pack",
    price: 12499,
    rating: 4.8,
    reviews: 312,
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
  },
  {
    id: 11,
    brand: "JORDAN",
    name: "Air Jordan 1 High OG",
    price: 16999,
    rating: 4.9,
    reviews: 891,
    img: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&q=80",
  },
  {
    id: 12,
    brand: "ASICS",
    name: "Gel-Kayano 14 Cream",
    price: 9999,
    rating: 4.7,
    reviews: 204,
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
  },
  {
    id: 13,
    brand: "VANS",
    name: "Old Skool Pro Skate",
    price: 6499,
    rating: 4.6,
    reviews: 537,
    img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
  },
];

const VALID_COUPONS = { SOLEX20: 20, FIRST15: 15, SAVE10: 10 };

// ─── localStorage helpers ───────────────────────────────────────────────────

const saveCart = (cart) => {
  try {
    localStorage.setItem("solex_cart", JSON.stringify(cart));
  } catch {}
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (p) =>
  `₹${Number(p).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
const pctOff = (orig, curr) => Math.round(((orig - curr) / orig) * 100);

// ─── Badge config ───────────────────────────────────────────────────────────
const BADGE_STYLES = {
  Sale: "bg-red-500 text-white",
  New: "bg-emerald-500 text-white",
  Limited: "bg-amber-400 text-black",
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
            shadow-2xl border min-w-[260px] max-w-sm
            transition-all duration-300
            ${
              t.dark
                ? "bg-[#1a1a1e] border-white/10 text-white"
                : "bg-white border-black/10 text-gray-900"
            }
            animate-[slideInRight_0.35s_cubic-bezier(.22,1,.36,1)_both]
          `}
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              t.type === "success"
                ? "bg-emerald-500/15 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {t.type === "success" ? (
              <Check size={13} strokeWidth={3} />
            ) : (
              <X size={13} strokeWidth={3} />
            )}
          </span>
          <span className="text-[13px] font-medium flex-1 leading-snug">
            {t.msg}
          </span>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => removeToast(t.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Ticker ──────────────────────────────────────────────────────────────────
function Ticker() {
  const items = [
    "Free delivery above ₹2,999",
    "Use SOLEX20 for 20% off",
    "New Arrivals Every Friday",
    "Authentic Brands Only",
    "30-Day Easy Returns",
    "Secure Checkout · 256-bit SSL",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="fixed top-0 left-0 right-0 z-39 h-7 bg-[#ff3c00] overflow-hidden">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 24s linear infinite" }}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-5 text-[10px] font-bold tracking-[0.18em] uppercase text-white leading-7"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {t}
            <span className="opacity-40 text-[7px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Checkout Progress ───────────────────────────────────────────────────────
// function CheckoutProgress({ dark }) {
//   const steps = ["Cart", "Address", "Payment", "Done"];
//   return (
//     <div className="flex items-center justify-center gap-0 mb-10">
//       {steps.map((label, i) => {
//         const isDone = i < 0;
//         const isActive = i === 0;
//         return (
//           <div key={label} className="flex items-center">
//             <div className="flex items-center gap-2">
//               <div
//                 className={`
//                   w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black
//                   transition-all duration-300
//                   ${
//                     isActive
//                       ? "bg-[#ff3c00] text-white scale-110 shadow-lg shadow-red-500/30"
//                       : isDone
//                         ? "bg-emerald-500 text-white"
//                         : dark
//                           ? "bg-white/8 text-white/30"
//                           : "bg-black/8 text-gray-400"
//                   }
//                 `}
//                 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
//               >
//                 {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
//               </div>
//               <span
//                 className={`
//                   text-[11px] font-bold tracking-[0.1em] uppercase hidden sm:block
//                   ${
//                     isActive
//                       ? dark
//                         ? "text-white"
//                         : "text-gray-900"
//                       : isDone
//                         ? "text-emerald-500"
//                         : dark
//                           ? "text-white/25"
//                           : "text-gray-400"
//                   }
//                 `}
//                 style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
//               >
//                 {label}
//               </span>
//             </div>
//             {i < steps.length - 1 && (
//               <div
//                 className={`w-10 h-px mx-3 ${
//                   isDone
//                     ? "bg-emerald-500"
//                     : dark
//                       ? "bg-white/12"
//                       : "bg-black/12"
//                 }`}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// ─── Cart Item Card ──────────────────────────────────────────────────────────
function CartItemCard({
  item,
  dispatch,
  onToast,
  wishlist,
  toggleWish,
  dark,
  index,
}) {
  const [removing, setRemoving] = useState(false);
  const isWished = wishlist.includes(item.id);
  const saving = item.original - item.price;

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      dispatch(removeFromCart(item.id));
      onToast(`Removed "${item.name}"`, "error");
    }, 320);
  };

  return (
    <div
      className={`
        rounded-2xl border p-5 transition-all duration-300
        ${removing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
        ${
          dark
            ? "bg-[#131316] border-white/7 hover:border-white/14 hover:shadow-2xl hover:shadow-black/40"
            : "bg-white border-black/7 hover:border-black/14 hover:shadow-xl hover:shadow-black/8"
        }
      `}
      style={{
        animation: `fadeSlideUp 0.5s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
      }}
    >
      <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] gap-5">
        {/* Image */}
        <div
          className={`relative rounded-xl overflow-hidden aspect-square flex-shrink-0 ${dark ? "bg-[#1a1a1e]" : "bg-gray-100"}`}
        >
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
          {item.badge && (
            <span
              className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold tracking-[0.08em] uppercase ${BADGE_STYLES[item.badge] ?? "bg-gray-500 text-white"}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {item.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2.5 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#ff3c00] mb-0.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {item.brand}
              </p>
              <h3
                className={`font-bold text-[17px] leading-tight truncate ${dark ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                title={item.name}
              >
                {item.name}
              </h3>
            </div>
            {/* Stock badge */}
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold flex-shrink-0 ${
                item.stock === "low-stock"
                  ? "text-amber-400"
                  : "text-emerald-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.stock === "low-stock" ? "bg-amber-400" : "bg-emerald-500"
                }`}
              />
              {item.stock === "low-stock" ? "Low Stock" : "In Stock"}
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: item.category, icon: "📦" },
              { label: item.size, icon: "📏" },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  dark
                    ? "bg-white/5 border-white/8 text-white/60"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {icon} {label}
              </span>
            ))}
            {/* Color pill */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${
                dark
                  ? "bg-white/5 border-white/8 text-white/60"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: item.colorHex }}
              />
              {item.color}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-[22px] font-extrabold ${dark ? "text-white" : "text-gray-900"}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {fmt(item.price)}
            </span>
            <span
              className={`text-sm line-through ${dark ? "text-white/30" : "text-gray-400"}`}
            >
              {fmt(item.original)}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {pctOff(item.original, item.price)}% OFF
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
            {/* Qty + subtotal */}
            <div className="flex items-center gap-3">
              {/* Qty control */}
              <div
                className={`flex items-center rounded-lg border overflow-hidden ${
                  dark
                    ? "bg-white/5 border-white/10"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <button
                  aria-label="Decrease quantity"
                  disabled={item.qty <= 1}
                  onClick={() => dispatch(decreaseQuantity(item.id))}
                  className={`w-9 h-9 flex items-center justify-center transition-all duration-150
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${dark ? "text-white/50 hover:bg-white/8 hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span
                  className={`min-w-[38px] text-center text-[15px] font-bold ${dark ? "text-white" : "text-gray-900"}`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {item.qty}
                </span>
                <button
                  aria-label="Increase quantity"
                  disabled={item.qty >= 9}
                  onClick={() => dispatch(increaseQuantity(item.id))}
                  className={`w-9 h-9 flex items-center justify-center transition-all duration-150
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${dark ? "text-white/50 hover:bg-white/8 hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}`}
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Subtotal */}
              <span
                className={`text-[18px] font-extrabold ${dark ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {fmt(item.price * item.qty)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  toggleWish(item.id);
                  onToast(
                    isWished ? "Removed from wishlist" : "Added to wishlist ❤",
                    isWished ? "error" : "success",
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all duration-200
                  ${isWished ? "text-[#ff3c00]" : dark ? "text-white/40 hover:text-white hover:bg-white/6" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Heart
                  size={12}
                  strokeWidth={2}
                  fill={isWished ? "#ff3c00" : "none"}
                />
                Save
              </button>

              <div
                className={`w-px h-4 ${dark ? "bg-white/10" : "bg-gray-200"}`}
              />

              <button
                onClick={handleRemove}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all duration-200
                  ${
                    dark
                      ? "text-white/40 hover:text-[#ff3c00] hover:bg-red-500/8"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Trash2 size={12} strokeWidth={2} />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Summary ──────────────────────────────────────────────────────────
function OrderSummary({ cart, onToast, dark }) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const origTotal = cart.reduce((s, i) => s + i.original * i.qty, 0);
  const itemDisc = origTotal - subtotal;
  const couponDisc = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.pct) / 100)
    : 0;
  const delivery = subtotal >= 2999 ? 0 : 199;
  const platform = 29;
  const taxBase = subtotal - couponDisc + delivery + platform;
  const tax = Math.round(taxBase * 0.18);
  const total = taxBase + tax;

  const navigate = useNavigate();

  const applyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      const code = couponInput.trim().toUpperCase();
      const pct = VALID_COUPONS[code];
      if (pct) {
        setApplied({ code, pct });
        setCouponError("");
        onToast(`Coupon ${code} applied — ${pct}% off! 🎉`, "success");
      } else {
        setCouponError("Invalid coupon code. Try: SOLEX20, FIRST15, SAVE10");
      }
    }, 900);
  };

  const removeCoupon = () => {
    setApplied(null);
    setCouponInput("");
    setCouponError("");
    onToast("Coupon removed", "error");
  };

  const lineRowCls = `flex items-center justify-between text-[13px]`;

  return (
    <div
      className={`
        rounded-2xl border p-7 flex flex-col gap-5
        sticky top-[calc(68px+28px+20px)]
        ${dark ? "bg-[#131316] border-white/7" : "bg-white border-black/7"}
      `}
      style={{
        animation: "fadeSlideUp 0.55s 0.1s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className={`text-[19px] font-black tracking-wide uppercase ${dark ? "text-white" : "text-gray-900"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Order Summary
        </h2>
        <span
          className={`text-[12px] font-medium ${dark ? "text-white/40" : "text-gray-400"}`}
        >
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lines */}
      <div className="flex flex-col gap-2.5">
        <div className={lineRowCls}>
          <span className={dark ? "text-white/50" : "text-gray-500"}>
            Subtotal (MRP)
          </span>
          <span
            className={`font-semibold ${dark ? "text-white/40 line-through" : "text-gray-400 line-through"}`}
          >
            {fmt(origTotal)}
          </span>
        </div>
        <div className={lineRowCls}>
          <span className={dark ? "text-white/50" : "text-gray-500"}>
            Product Discount
          </span>
          <span className="font-semibold text-emerald-500">
            −{fmt(itemDisc)}
          </span>
        </div>
        {appliedCoupon && (
          <div className={lineRowCls}>
            <span className={dark ? "text-white/50" : "text-gray-500"}>
              Coupon ({appliedCoupon.code})
            </span>
            <span className="font-semibold text-emerald-500">
              −{fmt(couponDisc)}
            </span>
          </div>
        )}
        <div className={lineRowCls}>
          <span className={dark ? "text-white/50" : "text-gray-500"}>
            Delivery
          </span>
          {delivery === 0 ? (
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              <Truck size={12} /> FREE
            </span>
          ) : (
            <span
              className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
            >
              {fmt(delivery)}
            </span>
          )}
        </div>
        {delivery > 0 && (
          <p
            className={`text-[11px] ${dark ? "text-white/30" : "text-gray-400"}`}
          >
            Add {fmt(2999 - subtotal)} more for free delivery
          </p>
        )}
        <div className={lineRowCls}>
          <span className={dark ? "text-white/50" : "text-gray-500"}>
            Platform Fee
          </span>
          <span
            className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
          >
            {fmt(platform)}
          </span>
        </div>

        <div className={`h-px ${dark ? "bg-white/7" : "bg-gray-100"} my-1`} />

        <div className={lineRowCls}>
          <span className={dark ? "text-white/50" : "text-gray-500"}>
            GST (18%)
          </span>
          <span
            className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}
          >
            {fmt(tax)}
          </span>
        </div>

        <div className={`h-px ${dark ? "bg-white/7" : "bg-gray-100"} my-1`} />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[18px] font-black uppercase tracking-wider ${dark ? "text-white" : "text-gray-900"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Total
        </span>
        <span
          className={`text-[28px] font-black ${dark ? "text-white" : "text-gray-900"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {fmt(total)}
        </span>
      </div>
      <p
        className={`text-[11px] text-right -mt-3 ${dark ? "text-white/30" : "text-gray-400"}`}
      >
        Inclusive of all taxes
      </p>

      {/* Coupon */}
      <div className="flex flex-col gap-2">
        <p
          className={`text-[11px] font-bold tracking-[0.14em] uppercase ${dark ? "text-white/40" : "text-gray-400"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Coupon Code
        </p>

        {appliedCoupon ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-500">
              <Tag size={14} />"{appliedCoupon.code}" — {appliedCoupon.pct}% off
              applied!
            </div>
            <button
              onClick={removeCoupon}
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${dark ? "text-white/30 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div
              className={`flex rounded-xl overflow-hidden border transition-colors duration-200 focus-within:border-[#ff3c00] ${
                dark
                  ? "border-white/12 bg-white/5"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <input
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="Enter code (try SOLEX20)"
                className="flex-1 px-4 py-3 bg-transparent outline-none text-[13px] font-medium placeholder-white/20"
                style={{
                  color: dark ? "white" : "#111",
                  fontFamily: "'Barlow', sans-serif",
                }}
              />
              <button
                onClick={applyCoupon}
                disabled={applying || !couponInput.trim()}
                className="px-4 bg-[#ff3c00] hover:bg-[#ff6b3d] text-white text-[12px] font-black tracking-[0.12em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {applying ? "..." : "Apply"}
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] font-semibold text-red-400">
                {couponError}
              </p>
            )}

            {/* Quick coupon chips */}
            <div className="flex gap-1.5 flex-wrap">
              {Object.keys(VALID_COUPONS).map((c) => (
                <button
                  key={c}
                  onClick={() => setCouponInput(c)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border transition-all duration-200
                    ${
                      dark
                        ? "bg-white/5 border-white/10 text-white/40 hover:border-[#ff3c00] hover:text-[#ff3c00] hover:bg-red-500/8"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-[#ff3c00] hover:text-[#ff3c00] hover:bg-red-50"
                    }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          onToast("Redirecting to secure checkout 🔒", "success");
          navigate("/cart/checkout");
        }}
        className="w-full flex items-center justify-center gap-3 py-[18px] rounded-xl bg-[#ff3c00] hover:bg-[#ff6b3d] text-white font-black text-[15px] tracking-[0.12em] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/30 active:translate-y-0 relative overflow-hidden group"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <Lock size={16} strokeWidth={2.5} />
        Checkout — {fmt(total)}
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>

      {/* Payment icons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {["VISA", "MC", "PayPal", "UPI", "GPay", "AMEX"].map((p) => (
          <div
            key={p}
            className={`h-6 px-2 rounded flex items-center justify-center text-[9px] font-black tracking-wider border ${
              dark
                ? "bg-white/5 border-white/8 text-white/40"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {p}
          </div>
        ))}
      </div>

      <div
        className={`flex items-center justify-center gap-1.5 text-[11px] ${dark ? "text-white/25" : "text-gray-400"}`}
      >
        <Lock size={11} strokeWidth={2} />
        256-bit SSL secured · Trusted checkout
      </div>
    </div>
  );
}

// ─── Empty Cart ──────────────────────────────────────────────────────────────
function EmptyCart({ dark, onShop }) {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center py-24 px-8 text-center"
      style={{ animation: "fadeSlideUp 0.5s ease both" }}
    >
      <div
        className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-2 border-dashed ${
          dark ? "bg-white/4 border-white/15" : "bg-gray-50 border-gray-300"
        }`}
      >
        <ShoppingBag
          size={52}
          strokeWidth={1.3}
          className={dark ? "text-white/20" : "text-gray-300"}
        />
      </div>

      <h2
        className={`text-[40px] font-black uppercase tracking-tight mb-3 ${dark ? "text-white" : "text-gray-900"}`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        Your cart is empty
      </h2>
      <p
        className={`text-[15px] max-w-xs leading-relaxed mb-8 ${dark ? "text-white/40" : "text-gray-500"}`}
      >
        Looks like you haven't added any kicks yet. Explore our collection and
        find your next pair.
      </p>
      <button
        onClick={onShop}
        className="flex items-center gap-3 px-10 py-4 bg-[#ff3c00] hover:bg-[#ff6b3d] text-white rounded-xl font-black text-[15px] tracking-[0.12em] uppercase transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-red-500/25"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        Explore Collection
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Recommendations ─────────────────────────────────────────────────────────
function Recommendations({ dispatch, onToast, dark, wishlist, toggleWish }) {
  return (
    <section
      className="mt-16"
      style={{ animation: "fadeSlideUp 0.5s 0.25s ease both" }}
    >
      <div className="flex items-end justify-between mb-6">
        <h2
          className={`text-[28px] font-black uppercase tracking-tight ${dark ? "text-white" : "text-gray-900"}`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          You May <span className="text-[#ff3c00]">Also Like</span>
        </h2>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-[12px] font-bold tracking-[0.1em] uppercase transition-all duration-200
            ${
              dark
                ? "border-white/12 text-white/50 hover:border-white/30 hover:text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
            }`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          View All
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {RECOMMENDED.map((p, i) => {
          const wished = wishlist.includes(p.id);
          return (
            <div
              key={p.id}
              className={`
                rounded-2xl border overflow-hidden cursor-pointer group
                transition-all duration-300 hover:-translate-y-1.5
                ${
                  dark
                    ? "bg-[#131316] border-white/7 hover:border-white/14 hover:shadow-2xl hover:shadow-black/40"
                    : "bg-white border-black/7 hover:border-black/12 hover:shadow-xl hover:shadow-black/8"
                }
              `}
              style={{
                animation: `fadeSlideUp 0.5s ${0.1 + i * 0.07}s ease both`,
              }}
            >
              {/* Image */}
              <div
                className={`relative aspect-square overflow-hidden ${dark ? "bg-[#1a1a1e]" : "bg-gray-100"}`}
              >
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWish(p.id);
                  }}
                  className={`
                    absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                    backdrop-blur-md transition-all duration-200
                    opacity-0 group-hover:opacity-100 hover:scale-110
                    ${dark ? "bg-black/60 text-white" : "bg-white/80 text-gray-700"}
                    ${wished ? "!opacity-100" : ""}
                  `}
                >
                  <Heart
                    size={13}
                    strokeWidth={2}
                    fill={wished ? "#ff3c00" : "none"}
                    stroke={wished ? "#ff3c00" : "currentColor"}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="p-3.5">
                <p
                  className="text-[9px] font-extrabold tracking-[0.16em] uppercase text-[#ff3c00] mb-0.5"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {p.brand}
                </p>
                <p
                  className={`text-[14px] font-bold leading-tight mb-2 ${dark ? "text-white" : "text-gray-900"}`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {p.name}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        size={10}
                        fill={j < Math.floor(p.rating) ? "#f59e0b" : "none"}
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                      />
                    ))}
                  <span
                    className={`text-[10px] ml-1 ${dark ? "text-white/30" : "text-gray-400"}`}
                  >
                    ({p.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-[16px] font-extrabold ${dark ? "text-white" : "text-gray-900"}`}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {fmt(p.price)}
                  </span>
                  <button
                    onClick={() => {
                      dispatch(addToCart(p));
                      onToast(`${p.name} added to cart 👟`, "success");
                    }}
                    className="w-8 h-8 rounded-full bg-[#ff3c00] hover:bg-[#ff6b3d] text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Trust Badges ────────────────────────────────────────────────────────────
function TrustBadges({ dark }) {
  const badges = [
    {
      icon: <Truck size={18} />,
      label: "Free Delivery",
      sub: "On orders above ₹2,999",
    },
    {
      icon: <RotateCcw size={18} />,
      label: "Easy Returns",
      sub: "30-day hassle-free",
    },
    {
      icon: <Shield size={18} />,
      label: "100% Authentic",
      sub: "Original products only",
    },
    {
      icon: <Zap size={18} />,
      label: "Fast Dispatch",
      sub: "Same-day if ordered by 2PM",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {badges.map((b) => (
        <div
          key={b.label}
          className={`flex items-center gap-3 p-3.5 rounded-xl border ${
            dark ? "bg-white/3 border-white/7" : "bg-gray-50 border-gray-100"
          }`}
        >
          <span className="text-[#ff3c00] flex-shrink-0">{b.icon}</span>
          <div>
            <p
              className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-900"}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {b.label}
            </p>
            <p
              className={`text-[10px] ${dark ? "text-white/30" : "text-gray-400"}`}
            >
              {b.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function SkeletonItem({ dark }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${dark ? "bg-[#131316] border-white/7" : "bg-white border-black/7"}`}
    >
      <div className="grid grid-cols-[110px_1fr] gap-5">
        <div
          className={`rounded-xl aspect-square ${dark ? "bg-white/6" : "bg-gray-100"}`}
          style={{ animation: "shimmer 1.5s infinite" }}
        />
        <div className="flex flex-col gap-3">
          {[60, 80, 40, 60].map((w, i) => (
            <div
              key={i}
              className={`h-4 rounded-lg ${dark ? "bg-white/6" : "bg-gray-100"}`}
              style={{
                width: `${w}%`,
                animation: `shimmer 1.5s ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CART PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function CartPage() {
  const [dark, setDark] = useState(true);
  const reduxDispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const cart = cartItems.map((item) => ({
    ...item,
    qty: item.quantity || 1,

    original: item.originalPrice || item.price,

    img: item.image || item.thumbnail || item.img,

    colorHex: item.colorHex || "#888",

    color: item.color || "Standard",

    size: item.size || "UK 9",

    category: item.category || "Lifestyle",

    badge: item.badge || "New",

    stock: item.stock || "in-stock",
  }));

  const [recommended, setRecommended] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toastIdRef = useRef(0);

  /* Persist cart */
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  /* Simulate initial load */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const fetchRecommendedProducts = async (categories, productIds) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/recommended-products`,
        {
          categories,
          productIds,
        },
      );

      setRecommended(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // get Recommendations
  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("solex_cart")) || [];
    const categories = [...new Set(cartItems.map((item) => item.category))];
    const productIds = cartItems.map((item) => item.id);
    if (categories.length > 0) {
      fetchRecommendedProducts(categories, productIds);
    }
  }, []);

  /* Inject font + keyframes */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(80px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes shimmer {
        0%   { opacity: 0.5; }
        50%  { opacity: 1; }
        100% { opacity: 0.5; }
      }
      @keyframes badgePop {
        0%   { transform: scale(0.7); }
        60%  { transform: scale(1.25); }
        100% { transform: scale(1); }
      }
      input::placeholder { color: rgba(255,255,255,0.2) !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  const addToast = useCallback(
    (msg, type = "success") => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, msg, type, dark }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3500,
      );
    },
    [dark],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleWish = useCallback((id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0c0c0e] text-white" : "bg-[#f5f4f0] text-gray-900"}`}
        style={{ fontFamily: "'Barlow', sans-serif" }}
      >
        {/* Ticker */}
        <Ticker />

        {/* Page content */}
        <main className="pt-[calc(40px+25px+18px)] pb-20 max-w-[1320px] mx-auto px-4 sm:px-8">
          {/* Checkout progress */}
          {/* <CheckoutProgress dark={dark} /> */}
          <CheckoutProgress currentStep={1} dark={dark} />

          {/* Cart header */}
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
            style={{ animation: "fadeSlideUp 0.5s ease both" }}
          >
            <div>
              {/* Breadcrumb */}
              <div
                className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 ${dark ? "text-white/30" : "text-gray-400"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <span>Home</span>
                <ChevronRight size={10} strokeWidth={2.5} />
                <span className={dark ? "text-white" : "text-gray-800"}>
                  Cart
                </span>
              </div>

              <h1
                className="font-black text-[clamp(36px,5vw,64px)] uppercase leading-none tracking-tight"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Shopping <span className="text-[#ff3c00]">Cart</span>
                {cart.length > 0 && (
                  <span
                    className={`text-[0.42em] ml-4 font-semibold ${dark ? "text-white/30" : "text-gray-400"}`}
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  >
                    ({cartCount} item{cartCount !== 1 ? "s" : ""})
                  </span>
                )}
              </h1>
            </div>

            <button
              className={`self-start sm:self-auto flex items-center gap-2 px-5 py-3 rounded-xl border text-[12px] font-bold tracking-[0.1em] uppercase transition-all duration-200
              ${
                dark
                  ? "border-white/12 text-white/60 hover:border-white/30 hover:text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900"
              }`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <ChevronLeft size={13} strokeWidth={2.5} />
              Continue Shopping
            </button>
          </div>

          {/* Trust badges */}
          <TrustBadges dark={dark} />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 mt-8">
            {/* ── Left column ── */}
            <div className="flex flex-col gap-4">
              {loading ? (
                /* Skeleton */
                [1, 2, 3].map((i) => <SkeletonItem key={i} dark={dark} />)
              ) : cart.length === 0 ? (
                <EmptyCart
                  dark={dark}
                  onShop={() => addToast("Opening store…", "success")}
                />
              ) : (
                <>
                  {/* Select / clear bar */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 rounded-xl border ${
                      dark
                        ? "bg-[#131316] border-white/7"
                        : "bg-white border-black/7"
                    }`}
                    style={{ animation: "fadeSlideUp 0.45s ease both" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-[18px] h-[18px] rounded-[4px] bg-[#ff3c00] border border-[#ff3c00] flex items-center justify-center cursor-pointer">
                        <Check size={11} strokeWidth={3} color="white" />
                      </div>
                      <span
                        className={`text-[13px] font-semibold ${dark ? "text-white/50" : "text-gray-500"}`}
                      >
                        All {cartCount} items selected
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        reduxDispatch(clearCart());

                        addToast("Cart cleared", "error");
                      }}
                      className="text-[#ff3c00] text-[12px] font-bold tracking-wider uppercase hover:opacity-70 transition-opacity"
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      Clear Cart
                    </button>
                  </div>

                  {/* Cart items */}
                  {cart.map((item, i) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      dispatch={reduxDispatch}
                      onToast={addToast}
                      wishlist={wishlist}
                      toggleWish={toggleWish}
                      dark={dark}
                      index={i}
                    />
                  ))}

                  {/* Delivery note */}
                  <div
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-[13px] font-medium ${
                      dark
                        ? "bg-[#131316] border-white/7 text-white/50"
                        : "bg-white border-black/7 text-gray-500"
                    }`}
                  >
                    <Truck size={16} className="text-[#ff3c00] flex-shrink-0" />
                    <span>
                      Estimated delivery:{" "}
                      <strong className={dark ? "text-white" : "text-gray-900"}>
                        3–5 business days
                      </strong>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ── Right column — Summary ── */}
            {!loading &&
              (cart.length > 0 ? (
                <OrderSummary cart={cart} onToast={addToast} dark={dark} />
              ) : (
                /* Empty cart recommendations */
                <div
                  className={`rounded-2xl border p-6 flex flex-col gap-4 ${dark ? "bg-[#131316] border-white/7" : "bg-white border-black/7"}`}
                >
                  <p
                    className={`text-[13px] font-bold tracking-[0.1em] uppercase ${dark ? "text-white/30" : "text-gray-400"}`}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Trending Now
                  </p>
                  {RECOMMENDED.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ${dark ? "bg-[#1a1a1e]" : "bg-gray-100"}`}
                      >
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[12px] font-bold truncate ${dark ? "text-white" : "text-gray-900"}`}
                        >
                          {p.name}
                        </p>
                        <p className="text-[12px] font-semibold text-[#ff3c00]">
                          {fmt(p.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          reduxDispatch(addToCart(p));
                          addToast(`${p.name} added!`, "success");
                        }}
                        className="w-7 h-7 rounded-full bg-[#ff3c00] hover:bg-[#ff6b3d] text-white flex items-center justify-center flex-shrink-0 transition-colors"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Recommendations */}
          {!loading && (
            <Recommendations
              dispatch={reduxDispatch}
              onToast={addToast}
              dark={dark}
              wishlist={wishlist}
              toggleWish={toggleWish}
            />
          )}
        </main>

        {/* Toasts */}
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </>
  );
}
