/**
 * pages/Payment/PaymentSuccess.jsx
 * Solex — Payment Success Page
 *
 * Shown after successful Razorpay payment + backend verification.
 * Receives { orderId } from navigate state.
 */

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Download, Home } from "lucide-react";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentMethod } = location.state || {};
  const confettiRef = useRef(false);

  // Simple confetti burst using CSS
  useEffect(() => {
    if (confettiRef.current) return;
    confettiRef.current = true;
    // Could integrate canvas-confetti here if installed
    // import confetti from 'canvas-confetti';
    // confetti({ particleCount: 120, spread: 80, colors: ['#ff3c00','#ffffff','#1a1a1a'] });
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">

        {/* Animated check */}
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-emerald-500/15" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            <CheckCircle2 size={38} strokeWidth={2.5} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-[clamp(48px,9vw,88px)] leading-none font-black uppercase tracking-tight mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Payment{" "}
          <span className="text-emerald-400">Successful</span>
        </h1>

        <p className="text-white/50 text-lg mb-2">
          {paymentMethod === "cod"
            ? "Your Cash on Delivery order has been placed!"
            : "Your payment has been received and verified."}
        </p>

        {orderId && (
          <p className="text-white/30 text-sm mb-10">
            Order ID:{" "}
            <span className="text-white/60 font-mono font-bold">{orderId}</span>
          </p>
        )}

        {/* Info card */}
        <div className="bg-[#131316] border border-white/8 rounded-3xl p-6 mb-8 text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff3c00]/10 flex items-center justify-center text-[#ff3c00]">
              <Package size={18} />
            </div>
            <div>
              <p className="font-bold text-sm">What happens next?</p>
              <p className="text-white/40 text-xs mt-0.5">
                You'll receive a confirmation email with invoice and tracking details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: "Order Confirmed", time: "Just now", done: true },
              { label: "Being Packed", time: "In 24 hrs", done: false },
              { label: "Out for Delivery", time: "3–5 days", done: false },
            ].map((step) => (
              <div key={step.label} className="text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    step.done
                      ? "bg-emerald-500 text-white"
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-[11px] font-bold text-white/70">{step.label}</p>
                <p className="text-[10px] text-white/30">{step.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 h-14 rounded-2xl bg-[#ff3c00] hover:bg-[#ff5d2f] transition-all duration-300 font-black uppercase tracking-[0.14em] text-[14px] flex items-center justify-center gap-2 shadow-2xl shadow-red-500/20"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <Package size={16} />
            Track Order
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 h-14 rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300 font-black uppercase tracking-[0.14em] text-[14px] flex items-center justify-center gap-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <Home size={16} />
            Continue Shopping
          </button>
        </div>

        {/* Invoice download hint */}
        <p className="text-white/20 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Download size={12} />
          Invoice will be emailed to you within 5 minutes
        </p>
      </div>
    </div>
  );
}