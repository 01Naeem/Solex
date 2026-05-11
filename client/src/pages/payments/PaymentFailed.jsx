/**
 * pages/Payment/PaymentFailed.jsx
 * Solex — Payment Failed Page
 *
 * Shown when:
 *   - Razorpay payment.failed event fires
 *   - Backend signature verification fails
 *
 * Allows user to retry payment without re-entering address.
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  MessageCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { retryPayment } from "../../features/payment/paymentThunks";
import { useRazorpay } from "../../hooks/useRazorpay";
import { verifyRazorpayPayment } from "../../features/payment/paymentThunks";
import { clearCart } from "../../features/cart/CartSlice";
import { resetPayment } from "../../features/payment/paymentSlice";

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderId, error: failError } = location.state || {};
  const { isRetrying } = useSelector((s) => s.payment);
  const checkoutData = useSelector((s) => s.checkout);
  const cartItems = useSelector((s) => s.cart.cartItems);
  const [localError, setLocalError] = useState(null);

  const { openRazorpay, isSdkLoading } = useRazorpay();

  const handleRetry = async () => {
    if (!orderId) {
      navigate("/cart/checkout");
      return;
    }

    setLocalError(null);

    const result = await dispatch(retryPayment({ orderId }));
    if (retryPayment.rejected.match(result)) {
      setLocalError(result.payload);
      return;
    }

    const { razorpayOrderId, amount } = result.payload;
    const shippingAddress =
      checkoutData?.shippingAddress ||
      JSON.parse(localStorage.getItem("solex_checkout") || "{}")
        ?.shippingAddress ||
      {};

    openRazorpay({
      razorpayOrderId,
      amount,
      user: {
        name: `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim(),
        email: shippingAddress.email || "",
        phone: shippingAddress.phone || "",
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
          setLocalError("Verification failed. Contact support.");
        }
      },
      onFailure: (err) => {
        setLocalError(err?.description || "Payment failed again.");
      },
      onDismiss: () => {
        setLocalError("Payment cancelled.");
      },
    });
  };

  const isProcessing = isRetrying || isSdkLoading;

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-red-500/15" />
          <div className="relative w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            <XCircle size={38} strokeWidth={2.5} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-[clamp(48px,9vw,88px)] leading-none font-black uppercase tracking-tight mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Payment <span className="text-red-400">Failed</span>
        </h1>

        <p className="text-white/50 text-lg mb-2">
          {failError || "Your payment could not be processed."}
        </p>

        {orderId && (
          <p className="text-white/30 text-sm mb-10">
            Order ID:{" "}
            <span className="text-white/60 font-mono font-bold">{orderId}</span>
          </p>
        )}

        {/* Reason card */}
        <div className="bg-[#131316] border border-red-500/20 rounded-3xl p-6 mb-8 text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold text-sm mb-1">
                Common reasons for failure
              </p>
              <ul className="text-white/40 text-xs space-y-1.5">
                <li>• Insufficient balance or card limit exceeded</li>
                <li>• Bank declined the transaction</li>
                <li>• Payment session timed out</li>
                <li>• Network interruption during payment</li>
              </ul>
              <p className="text-white/30 text-xs mt-3">
                No amount has been deducted. You can safely retry.
              </p>
            </div>
          </div>
        </div>

        {/* Error display */}
        {localError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400 text-sm">
            {localError}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          {orderId && (
            <button
              onClick={handleRetry}
              disabled={isProcessing}
              className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.14em] text-[14px] flex items-center justify-center gap-2 shadow-2xl shadow-red-500/20 transition-all duration-300 ${
                isProcessing
                  ? "bg-[#ff3c00]/50 cursor-not-allowed"
                  : "bg-[#ff3c00] hover:bg-[#ff5d2f]"
              }`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isRetrying ? "Getting Retry..." : "Loading..."}
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Retry Payment
                </>
              )}
            </button>
          )}

          <button
            onClick={() => navigate("/cart/checkout")}
            className="flex-1 h-14 rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300 font-black uppercase tracking-[0.14em] text-[14px] flex items-center justify-center gap-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <ArrowLeft size={16} />
            Back to Checkout
          </button>
        </div>

        <button
          onClick={() => navigate("/support")}
          className="mt-4 flex items-center gap-1.5 mx-auto text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          <MessageCircle size={12} />
          Contact support if issue persists
        </button>
      </div>
    </div>
  );
}
