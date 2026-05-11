/**
 * layouts/AdminLayout.jsx  (or pages/admin/AdminLayout.jsx)
 * Solex Admin — Master Layout Shell
 *
 * WHAT THIS FILE DOES
 * ───────────────────
 * Wraps every admin page with:
 *   AdminNavbar  — fixed top bar (z-40, h-16)
 *   AdminSidebar — fixed left panel (z-40, collapsible)
 *   <Outlet />   — your page content fills this area
 *   AdminFooter  — sits naturally at the bottom of the page
 *
 * STATE MANAGED HERE (lifted so Navbar ↔ Sidebar share it)
 * ─────────────────
 *   sidebarOpen      — mobile drawer open/closed
 *   sidebarCollapsed — desktop expand/collapse (persisted in localStorage)
 *
 * LAYOUT MATH
 * ───────────
 *   Navbar   : fixed, h-16 (64px), full width, z-40
 *   Sidebar  : fixed, top-0, left-0, full height, z-40
 *              width = 220px (expanded) | 60px (collapsed)
 *   Content  : margin-left shifts with sidebar on lg+
 *              padding-top = 64px (navbar height)
 *   Footer   : inside the content flow, pushed down by flex-col + flex-1
 *
 * ROUTER USAGE
 * ────────────
 * // App.jsx / router.jsx
 * import AdminLayout from "./layouts/AdminLayout";
 *
 * <Route path="/admin" element={<AdminLayout />}>
 *   <Route index          element={<AdminDashboard />} />
 *   <Route path="products"     element={<ProductsPage />} />
 *   <Route path="products/add" element={<AddProductPage />} />
 *   <Route path="orders"       element={<OrdersPage />} />
 *   <Route path="users"        element={<UsersPage />} />
 *   <Route path="categories"   element={<CategoriesPage />} />
 *   <Route path="analytics"    element={<AnalyticsPage />} />
 *   <Route path="settings"     element={<SettingsPage />} />
 * </Route>
 *
 * DEPENDENCIES
 * ────────────
 * ./components/admin/AdminNavbar.jsx
 * ./components/admin/AdminSidebar.jsx
 * ./components/admin/AdminFooter.jsx
 */

import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar  from "./Navbar/Adminnavbar";
import AdminSidebar from "./Sidebar/Adminsidebar";
import AdminFooter  from "./Footer/Adminfooter";

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED_W  = 220; // px — matches AdminSidebar lg:w-[220px]
const SIDEBAR_COLLAPSED_W =  60; // px — matches AdminSidebar lg:w-[60px]
const NAVBAR_H            =  64; // px — matches AdminNavbar h-16

// ─── Page title map (optional breadcrumb / document.title helper) ─────────────
const PAGE_TITLES = {
  "/admin":              "Dashboard",
  "/admin/products":     "Manage Products",
  "/admin/products/add": "Add Product",
  "/admin/orders":       "Orders",
  "/admin/users":        "Users",
  "/admin/categories":   "Categories",
  "/admin/analytics":    "Analytics",
  "/admin/settings":     "Settings",
};

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const location = useLocation();

  // ── Sidebar state ──────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("solex-admin-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  // ── Persist collapse preference ────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem("solex-admin-sidebar-collapsed", String(sidebarCollapsed));
    } catch { /* storage unavailable — silently ignore */ }
  }, [sidebarCollapsed]);

  // ── Auto-close mobile drawer on route change ───────────────────────────────
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── Lock body scroll when mobile drawer is open ────────────────────────────
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // ── Set document title per page ────────────────────────────────────────────
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] ?? "Admin";
    document.title = `${title} — Solex Admin`;
  }, [location.pathname]);

  // ── Navbar hamburger handler ───────────────────────────────────────────────
  // On mobile  (<lg): opens/closes the slide-in drawer
  // On desktop (≥lg): expands/collapses the sidebar width
  const handleNavbarToggle = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(p => !p);
    } else {
      setSidebarCollapsed(p => !p);
    }
  }, []);

  // ── Current sidebar pixel width (for desktop margin-left) ─────────────────
  const sidebarPixelW = sidebarCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Google Fonts (load once here for the entire admin) ─────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        /* Smooth sidebar push on desktop */
        .admin-content {
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Page entrance animation — applied to <main> children */
        @keyframes page-enter {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .page-enter {
          animation: page-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Scrollbar styling for the content area */
        .admin-scroll::-webkit-scrollbar        { width: 5px; }
        .admin-scroll::-webkit-scrollbar-track  { background: transparent; }
        .admin-scroll::-webkit-scrollbar-thumb  { background: #e2e8f0; border-radius: 999px; }
        .admin-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      {/* ────────────────────────────────────────────────────────────────────
          SIDEBAR — fixed, runs full viewport height
      ──────────────────────────────────────────────────────────────────── */}
      <AdminSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onCollapseToggle={() => setSidebarCollapsed(p => !p)}
      />

      {/* ────────────────────────────────────────────────────────────────────
          MAIN COLUMN — everything to the right of the sidebar
          margin-left on lg+ tracks sidebar width via inline style
          On mobile the sidebar is an overlay so no margin needed
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="admin-content flex flex-col min-h-screen lg:ml-0"
        style={{
          // Only apply margin on desktop; CSS class handles the transition
          marginLeft: `var(--sidebar-w, 0px)`,
        }}
      >
        {/*
          CSS custom property trick: update --sidebar-w via a <style> tag so
          the CSS transition (.admin-content) handles the animation without
          needing a requestAnimationFrame loop.
        */}
        <style>{`
          @media (min-width: 1024px) {
            :root { --sidebar-w: ${sidebarPixelW}px; }
          }
          @media (max-width: 1023px) {
            :root { --sidebar-w: 0px; }
          }
        `}</style>

        {/* ── NAVBAR — fixed top, full remaining width ────────────────────── */}
        <AdminNavbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleNavbarToggle}
        />

        {/* ── SCROLLABLE AREA below navbar ───────────────────────────────── */}
        <div
          className="flex flex-col flex-1 admin-scroll overflow-y-auto"
          style={{ paddingTop: NAVBAR_H }}
        >
          {/* ── Breadcrumb / page header bar ───────────────────────────── */}
          <PageHeaderBar pathname={location.pathname} />

          {/* ── Route content (Outlet) ─────────────────────────────────── */}
          <main
            className="flex-1 px-4 sm:px-6 py-6 page-enter"
            /*
              Re-trigger entrance animation on every navigation.
              Using `key` on main resets the animation when route changes.
            */
            key={location.pathname}
          >
            <Outlet context={{ sidebarCollapsed }} />
          </main>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}

// ─── PageHeaderBar ────────────────────────────────────────────────────────────
// Thin sub-header showing breadcrumbs, page title, and quick actions.
// Sits between the navbar and the Outlet content.
function PageHeaderBar({ pathname }) {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const pageTitle = PAGE_TITLES[pathname] ?? "Page";

  // Don't render for dashboard root (it has its own heading)
  if (pathname === "/admin" || pathname === "/admin/") return null;

  return (
    <div className="border-b border-slate-100 bg-white/70 backdrop-blur-sm px-4 sm:px-6 py-2.5 flex items-center gap-2 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] min-w-0">
        <a href="/admin" className="text-slate-400 hover:text-amber-600 transition-colors font-medium shrink-0">
          Dashboard
        </a>
        {segments.map((seg, i) => {
          const to = "/admin/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
          return (
            <span key={to} className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-200">/</span>
              {isLast ? (
                <span className="font-semibold text-slate-700 truncate">{label}</span>
              ) : (
                <a href={to} className="text-slate-400 hover:text-amber-600 transition-colors truncate font-medium">
                  {label}
                </a>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}