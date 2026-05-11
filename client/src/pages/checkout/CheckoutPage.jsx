/**
 * pages/checkout/CheckoutPage.jsx
 * Solex — Checkout Page
 *
 * No auth-related changes needed here.
 * All auth is handled transparently by the axios interceptor in api.js.
 */
import { useDispatch } from "react-redux";
import { useState } from "react";
import {
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  ShieldCheck,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setShippingAddress,
  setPaymentMethod,
} from "../../features/payment/checkoutSlice";

import CheckoutProgress from "./CheckoutProgress";

const fmt = (p) =>
  `₹${Number(p).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
  })}`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems);

  const [selectedPayment, setSelectedPayment] = useState("razorpay");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 2999 ? 0 : 199;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Invalid Indian phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;

    dispatch(setShippingAddress(formData));
    dispatch(setPaymentMethod(selectedPayment));

    navigate("/cart/checkout/payment");
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      <main className="max-w-[1380px] mx-auto px-4 sm:px-8 py-10">
        <CheckoutProgress currentStep={2} dark={true} />

        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/30 mb-4">
          <span>Home</span>
          <ChevronRight size={10} />
          <span>Cart</span>
          <ChevronRight size={10} />
          <span className="text-white">Checkout</span>
        </div>

        <div className="mb-10">
          <h1
            className="text-[clamp(40px,6vw,72px)] leading-none font-black uppercase tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Secure <span className="text-[#ff3c00]">Checkout</span>
          </h1>
          <p className="text-white/40 mt-3 max-w-xl">
            Complete your order securely with encrypted payment and lightning
            fast delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            {/* Shipping Address */}
            <section className="bg-[#131316] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <MapPin className="text-[#ff3c00]" size={20} />
                <h2
                  className="text-[24px] uppercase font-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Shipping Address
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className={`checkout-input ${errors.firstName ? "border-red-500" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="checkout-error">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className={`checkout-input ${errors.lastName ? "border-red-500" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="checkout-error">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className={`checkout-input ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && (
                    <p className="checkout-error">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className={`checkout-input ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="checkout-error">{errors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full Address"
                    rows={4}
                    className={`checkout-input resize-none py-4 ${errors.address ? "border-red-500" : ""}`}
                  />
                  {errors.address && (
                    <p className="checkout-error">{errors.address}</p>
                  )}
                </div>

                <div>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`checkout-input ${errors.city ? "border-red-500" : ""}`}
                  />
                  {errors.city && (
                    <p className="checkout-error">{errors.city}</p>
                  )}
                </div>

                <div>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`checkout-input ${errors.state ? "border-red-500" : ""}`}
                  />
                  {errors.state && (
                    <p className="checkout-error">{errors.state}</p>
                  )}
                </div>

                <div>
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className={`checkout-input ${errors.pincode ? "border-red-500" : ""}`}
                  />
                  {errors.pincode && (
                    <p className="checkout-error">{errors.pincode}</p>
                  )}
                </div>

                <div>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className={`checkout-input ${errors.country ? "border-red-500" : ""}`}
                  />
                  {errors.country && (
                    <p className="checkout-error">{errors.country}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="bg-[#131316] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Truck className="text-[#ff3c00]" size={20} />
                <h2
                  className="text-[24px] uppercase font-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Delivery Method
                </h2>
              </div>

              <div className="space-y-4">
                <label className="checkout-radio">
                  <input type="radio" defaultChecked />
                  <div>
                    <p className="font-bold">Standard Delivery</p>
                    <p className="text-sm text-white/40">
                      Delivery in 3-5 business days
                    </p>
                  </div>
                  <span className="ml-auto font-bold">FREE</span>
                </label>

                <label className="checkout-radio">
                  <input type="radio" />
                  <div>
                    <p className="font-bold">Express Delivery</p>
                    <p className="text-sm text-white/40">
                      Delivery in 1-2 business days
                    </p>
                  </div>
                  <span className="ml-auto font-bold">₹299</span>
                </label>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-[#131316] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <CreditCard className="text-[#ff3c00]" size={20} />
                <h2
                  className="text-[24px] uppercase font-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPayment("razorpay")}
                  className={`checkout-payment ${
                    selectedPayment === "razorpay"
                      ? "border-[#ff3c00] bg-[#ff3c00]/10"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-bold">Razorpay</p>
                    <p className="text-sm text-white/40">
                      UPI, Cards, Wallets, Net Banking
                    </p>
                  </div>
                  {selectedPayment === "razorpay" && (
                    <Check className="text-[#ff3c00]" size={18} />
                  )}
                </button>

                <button
                  onClick={() => setSelectedPayment("cod")}
                  className={`checkout-payment ${
                    selectedPayment === "cod"
                      ? "border-[#ff3c00] bg-[#ff3c00]/10"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-sm text-white/40">
                      Pay when order arrives
                    </p>
                  </div>
                  {selectedPayment === "cod" && (
                    <Check className="text-[#ff3c00]" size={18} />
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="sticky top-8 h-fit">
            <div className="bg-[#131316] border border-white/8 rounded-3xl p-7">
              <h2
                className="text-[28px] font-black uppercase mb-6"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image || item.thumbnail}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover"
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

              <div className="space-y-3 border-t border-white/10 pt-5">
                <div className="checkout-row">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="checkout-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : fmt(shipping)}</span>
                </div>
                <div className="checkout-row">
                  <span>GST (18%)</span>
                  <span>{fmt(tax)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span
                    className="text-[22px] font-black uppercase"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[34px] font-black"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-7 h-16 rounded-2xl bg-[#ff3c00] hover:bg-[#ff5a26] transition-all duration-300 font-black uppercase tracking-[0.14em] flex items-center justify-center gap-3 shadow-2xl shadow-red-500/20"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Lock size={18} />
                Place Order
                <ArrowRight size={18} />
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-white/30 text-sm">
                <ShieldCheck size={16} />
                SSL Secure Checkout
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
