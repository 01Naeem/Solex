/**
 * pages/checkout/PaymentPage.jsx
 * Solex — Payment Page (Razorpay wired)
 *
 * No auth-related changes needed here.
 * All auth is handled transparently by the axios interceptor in api.js.
 */

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import CheckoutProgress from "./CheckoutProgress";
import { useRazorpay } from "../../hooks/useRazorpay";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../features/payment/paymentThunks";
import { resetPayment } from "../../features/payment/paymentSlice";
import { clearCart } from "../../features/cart/CartSlice";

const fmt = (p) => `₹${Number(p).toLocaleString("en-IN")}`;

// ─── Inline Toast ─────────────────────────────────────────────────────────────
function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      : type === "warn"
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
        : "bg-red-500/10 border-red-500/30 text-red-400";

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md ${colors} text-sm font-medium max-w-sm animate-in slide-in-from-right duration-300`}
    >
      <AlertCircle size={16} />
      {message}
      <button
        onClick={onClose}
        className="ml-auto opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Selectors ──────────────────────────────────────────────────────────────
  const cartItems = useSelector((s) => s.cart.cartItems);
  const checkoutData = useSelector((s) => s.checkout);
  const { isCreatingOrder, isVerifying, createOrderError, verifyError } =
    useSelector((s) => s.payment);

  const shippingAddress = checkoutData?.shippingAddress;

  // ── Local state ────────────────────────────────────────────────────────────
  const [selectedPayment, setSelectedPayment] = useState("razorpay");
  const [toast, setToast] = useState(null);

  const { openRazorpay, isSdkLoading } = useRazorpay();

  // ── Price calculation ──────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = subtotal >= 2999 ? 0 : 199;
  const platformFee = 29;
  const gst = Math.round((subtotal + shipping + platformFee) * 0.18);
  const total = subtotal + shipping + platformFee + gst;

  const showToast = (message, type = "error") => setToast({ message, type });

  // ── Redirect if cart is empty ──────────────────────────────────────────────
  useEffect(() => {
    if (!cartItems.length) navigate("/cart");
  }, []);

  // ── Show API errors as toasts ──────────────────────────────────────────────
  useEffect(() => {
    if (createOrderError) showToast(createOrderError);
  }, [createOrderError]);

  useEffect(() => {
    if (verifyError) showToast(verifyError);
  }, [verifyError]);

  // ── Main payment handler ───────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!shippingAddress) {
      showToast("Please fill in your shipping address first.", "warn");
      navigate("/cart/checkout");
      return;
    }

    // COD flow
    if (selectedPayment === "cod") {
      showToast("COD order placed! We'll confirm via email.", "success");
      dispatch(clearCart());
      navigate("/payment/success", { state: { paymentMethod: "cod" } });
      return;
    }

    // ── Step 1: Create backend order ──────────────────────────────────────
    const cartPayload = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      selectedSize: item.selectedSize || item.size,
      selectedColor: item.selectedColor || item.color || "Default",
    }));

    const orderResult = await dispatch(
      createRazorpayOrder({
        cartItems: cartPayload,
        shippingAddress: {
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          phone: shippingAddress.phone,
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country || "IN",
        },
        couponCode: checkoutData?.couponCode || null,
      }),
    );

    if (createRazorpayOrder.rejected.match(orderResult)) return;

    const { razorpayOrderId, amount, orderId } = orderResult.payload;

    // ── Step 2: Open Razorpay modal ───────────────────────────────────────
    console.log("Razorpay payload:", {
      razorpayOrderId,
      amount,
      orderId,
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    });
    openRazorpay({
      razorpayOrderId,
      amount,
      user: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },

      onSuccess: async (razorpayResponse) => {
        const verifyResult = await dispatch(
          verifyRazorpayPayment({
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            orderId,
          }),
        );

        if (verifyRazorpayPayment.fulfilled.match(verifyResult)) {
          dispatch(clearCart());
          dispatch(resetPayment());
          navigate("/payment/success", {
            state: { orderId: verifyResult.payload.orderId },
          });
        } else {
          showToast(
            "Payment received but verification failed. Contact support.",
            "error",
          );
          navigate("/payment/failed", { state: { orderId } });
        }
      },

      onFailure: (error) => {
        showToast(error?.description || "Payment failed. You can retry.");
        navigate("/payment/failed", {
          state: { orderId, error: error?.description },
        });
      },

      onDismiss: () => {
        showToast("Payment cancelled. Your cart is still saved.", "warn");
      },
    });
  };

  const isProcessing = isCreatingOrder || isSdkLoading || isVerifying;

  // ── Payment methods ────────────────────────────────────────────────────────
  const paymentMethods = [
    {
      id: "razorpay",
      title: "Razorpay",
      subtitle: "UPI, Cards, Wallets & Net Banking",
      icon: <CreditCard size={18} />,
    },
    {
      id: "upi",
      title: "UPI Payment",
      subtitle: "Google Pay, PhonePe, Paytm",
      icon: <Smartphone size={18} />,
    },
    {
      id: "wallet",
      title: "Wallets",
      subtitle: "Amazon Pay & Mobikwik",
      icon: <Wallet size={18} />,
    },
    {
      id: "netbanking",
      title: "Net Banking",
      subtitle: "All major Indian banks",
      icon: <Landmark size={18} />,
    },
    {
      id: "cod",
      title: "Cash On Delivery",
      subtitle: "Pay after delivery",
      icon: <ShieldCheck size={18} />,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <CheckoutProgress currentStep={3} dark={true} />

        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/30 mb-5">
          <span>Home</span>
          <ChevronRight size={10} />
          <span>Cart</span>
          <ChevronRight size={10} />
          <span>Checkout</span>
          <ChevronRight size={10} />
          <span className="text-white">Payment</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-10">
          <div>
            <h1
              className="text-[clamp(42px,7vw,76px)] leading-none uppercase font-black tracking-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Payment <span className="text-[#ff3c00]">Gateway</span>
            </h1>
            <p className="text-white/40 mt-3 max-w-xl">
              Your payment information is encrypted and securely processed.
            </p>
          </div>
          <button
            onClick={() => navigate("/cart/checkout")}
            className="h-12 px-6 rounded-xl border border-white/10 hover:border-white/25 transition-all duration-300 flex items-center gap-2 text-sm uppercase tracking-[0.1em] font-bold"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            <section className="bg-[#131316] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-[#ff3c00]" size={20} />
                <h2
                  className="text-[28px] uppercase font-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Choose Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const active = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                        active
                          ? "border-[#ff3c00] bg-[#ff3c00]/10"
                          : "border-white/10 bg-[#0f0f12] hover:border-[#ff3c00]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            active
                              ? "bg-[#ff3c00] text-white"
                              : "bg-white/5 text-white/50"
                          }`}
                        >
                          {method.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{method.title}</p>
                          <p className="text-sm text-white/40">
                            {method.subtitle}
                          </p>
                        </div>
                      </div>
                      {active && (
                        <CheckCircle2 className="text-[#ff3c00]" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-[#131316] border border-white/8 rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff3c00]/10 flex items-center justify-center text-[#ff3c00]">
                  <Lock size={20} />
                </div>
                <div>
                  <h3
                    className="text-[22px] uppercase font-black mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Secure Payment
                  </h3>
                  <p className="text-white/40 leading-relaxed">
                    All transactions are secured with 256-bit SSL encryption.
                    Your card details are never stored on Solex servers.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="sticky top-8 h-fit">
            <div className="bg-[#131316] border border-white/8 rounded-3xl p-7">
              <h2
                className="text-[30px] uppercase font-black mb-6"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedSize}`}
                    className="flex gap-4"
                  >
                    <img
                      src={item.image || item.thumbnail}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-white/40">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/10 pt-5">
                <div className="payment-row">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="payment-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : fmt(shipping)}</span>
                </div>
                <div className="payment-row">
                  <span>Platform Fee</span>
                  <span>{fmt(platformFee)}</span>
                </div>
                <div className="payment-row">
                  <span>GST (18%)</span>
                  <span>{fmt(gst)}</span>
                </div>
                <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                  <span
                    className="text-[22px] uppercase font-black"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[38px] font-black"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full h-16 mt-8 rounded-2xl uppercase tracking-[0.14em] font-black text-[15px] flex items-center justify-center gap-3 shadow-2xl shadow-red-500/20 transition-all duration-300 ${
                  isProcessing
                    ? "bg-[#ff3c00]/50 cursor-not-allowed"
                    : "bg-[#ff3c00] hover:bg-[#ff5d2f]"
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isCreatingOrder
                      ? "Creating Order..."
                      : isSdkLoading
                        ? "Loading Payment..."
                        : "Verifying..."}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {selectedPayment === "cod"
                      ? "Place COD Order"
                      : "Pay Securely"}
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-white/30 text-sm mt-5">
                <ShieldCheck size={14} />
                256-bit SSL Secure Payment
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
