/**
 * App.jsx — Solex
 *
 * Added routes:
 *   /payment/success  → PaymentSuccess
 *   /payment/failed   → PaymentFailed
 *
 * Everything else untouched.
 */

import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/Homepage.jsx";
import MainLayout from "./components/layout/Mainlayout.jsx";
import CollectionsPage from "./components/layout/collection/Collectionspage.jsx";
import AdminDashboard from "./pages/home/Admindashboard.jsx";
import AdminLayout from "./components/layout/Adminlayout.jsx";
import AddProductForm from "./components/forms/ProductForm/AddProductForm.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import SignupForm from "./components/forms/LoginForm/Signupform.jsx";
import Loginform from "./components/forms/LoginForm/Loginform.jsx";
import CartPage from "./pages/cart/CartPage.jsx";
import CheckoutPage from "./pages/checkout/CheckoutPage.jsx";
import PaymentPage from "./pages/checkout/PaymentPage.jsx";

// ── NEW: Payment result pages ────────────────────────────────────────────────
import PaymentSuccess from "./pages/payments/PaymentSuccess.jsx";
import PaymentFailed from "./pages/payments/PaymentFailed.jsx";

let darkMode = false;

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="auth/register" element={<SignupForm />} />
          <Route path="auth/login" element={<Loginform />} />
          <Route path="cart/checkout" element={<CheckoutPage />} />
          <Route path="cart/checkout/payment" element={<PaymentPage />} />

          {/* Payment result pages — outside checkout flow */}
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/failed" element={<PaymentFailed />} />
        </Route>
      </Routes>

      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route
            path="products/add"
            element={<AddProductForm darkMode={darkMode} />}
          />
          <Route
            path="products"
            element={<AdminProducts darkMode={darkMode} />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
