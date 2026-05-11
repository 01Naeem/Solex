/**
 * hooks/useRazorpay.js
 * Solex — Custom hook for Razorpay SDK
 *
 * Handles:
 *   - Dynamic script loading (once)
 *   - Opening the Razorpay checkout modal
 *   - Success / failure / dismiss callbacks
 *
 * Usage:
 *   const { openRazorpayay, isLoading } = useRazorpay();
 *   openRazorpay({ razorpayOrderId, amount, user, onSuccess, onFailure });
 */

import { useState, useCallback } from "react";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const loadScript = () =>
  new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) return resolve(true);

    // Already injected but not yet loaded
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function useRazorpay() {
  const [isSdkLoading, setIsSdkLoading] = useState(false);

  

  const openRazorpay = useCallback(
    async ({ razorpayOrderId, amount, user, onSuccess, onFailure, onDismiss }) => {
      setIsSdkLoading(true);
      const ok = await loadScript();
      setIsSdkLoading(false);

      if (!ok) {
        onFailure?.({
          description: "Payment service unavailable. Check your connection.",
        });
        return;
      }

      const options = {
        // Your Razorpay publishable key (SAFE to expose in frontend)
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,             // in paise (backend already converted)
        currency: "INR",
        name: "Solex",
        description: "Premium Footwear",
        image: "/solex-logo.png", // put your logo at public/solex-logo.png
        order_id: razorpayOrderId,

        // Pre-fill customer info from your auth/checkout state
        prefill: {
          name:    user?.name  || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email:   user?.email || "",
          contact: user?.phone || "",
        },

        theme: {
          color: "#ff3c00", // matches your brand accent exactly
        },

        retry: {
          enabled: true,
          max_count: 3,
        },

        modal: {
          ondismiss: () => {
            onDismiss?.();
          },
          // Prevent closing during payment processing
          escape: false,
          animation: true,
        },

        // Called by Razorpay on successful payment
        handler: (response) => {
          // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
          onSuccess?.(response);
        },
      };

      const rzp = new window.Razorpay(options);

      // Called on payment failure (e.g. wrong OTP, card decline)
      rzp.on("payment.failed", (response) => {
        onFailure?.(response.error);
      });

      rzp.open();
    },
    []
  );

  return { openRazorpay, isSdkLoading };
}