/**
 * MainNav.jsx — Solex | Professional Navbar v3 (Mobile-First)
 *
 * MOBILE FIXES & IMPROVEMENTS
 * ────────────────────────────
 * ✦ Full-screen mobile drawer (slides in from left, overlay backdrop)
 * ✦ Accordion sub-menus inside drawer (Collections, New Arrivals expand in-place)
 * ✦ Touch-friendly tap targets (min 44×44px on all interactive elements)
 * ✦ Right-side icon tray on mobile shows only Search + Cart + Hamburger
 * ✦ Dark mode, Currency, Notifications, Wishlist hidden in mobile → inside drawer
 * ✦ Bottom CTA login button always visible when logged out on mobile
 * ✦ Announcement bar hidden on mobile (avoids clutter)
 * ✦ Drawer closes on backdrop click or Escape key
 * ✦ Body scroll locked when drawer is open
 */

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, BrowserRouter } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Zap,
  Search,
  Heart,
  Bell,
  ChevronDown,
  Globe,
  ArrowRight,
  Flame,
  Sparkles,
  Tag,
  Sun,
  Moon,
  LogOut,
  Settings,
  Package,
  ChevronRight,
  UserPlus,
} from "lucide-react";

import SolexLogo from "../../../assets/images/NavLogoSolex.png";
import { useSelector } from "react-redux";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap";

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", to: "/", mega: false },
  { label: "Discover", to: "/discover", mega: false },
  {
    label: "Collections",
    to: "/collections",
    mega: true,
    columns: [
      {
        heading: "By Sport",
        icon: <Flame size={13} />,
        items: [
          { label: "Running", to: "/collections/running", badge: null },
          { label: "Basketball", to: "/collections/basketball", badge: "Hot" },
          { label: "Training", to: "/collections/training", badge: null },
          { label: "Lifestyle", to: "/collections/lifestyle", badge: null },
          { label: "Football", to: "/collections/football", badge: null },
        ],
      },
      {
        heading: "By Gender",
        icon: <Tag size={13} />,
        items: [
          { label: "Men", to: "/collections/men", badge: null },
          { label: "Women", to: "/collections/women", badge: "New" },
          { label: "Kids", to: "/collections/kids", badge: null },
          { label: "Unisex", to: "/collections/unisex", badge: null },
        ],
      },
      {
        heading: "Featured",
        icon: <Sparkles size={13} />,
        items: [
          {
            label: "Best Sellers",
            to: "/collections/best-sellers",
            badge: null,
          },
          { label: "Sale", to: "/collections/sale", badge: "50%" },
          { label: "Collaborations", to: "/collections/collab", badge: null },
        ],
      },
    ],
    promo: {
      label: "Shop All Collections",
      to: "/collections",
      tag: "200+ Styles",
    },
  },
  {
    label: "New Arrivals",
    to: "/new-arrivals",
    mega: true,
    columns: [
      {
        heading: "Just Dropped",
        icon: <Zap size={13} />,
        items: [
          { label: "This Week", to: "/new-arrivals/this-week", badge: "New" },
          { label: "This Month", to: "/new-arrivals/this-month", badge: null },
          {
            label: "Coming Soon",
            to: "/new-arrivals/coming-soon",
            badge: null,
          },
        ],
      },
      {
        heading: "Trending Now",
        icon: <Flame size={13} />,
        items: [
          { label: "SolexAir Pro", to: "/products/solexair-pro", badge: "🔥" },
          { label: "CloudRun X", to: "/products/cloudrun-x", badge: "New" },
          { label: "StreetEdge 2", to: "/products/streetedge-2", badge: null },
          { label: "HyperBoost", to: "/products/hyperboost", badge: null },
        ],
      },
    ],
    promo: {
      label: "See All New Arrivals",
      to: "/new-arrivals",
      tag: "Updated Weekly",
    },
  },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

// ─── Router detection ─────────────────────────────────────────────────────────
function useIsInsideRouter() {
  try {
    useLocation();
    return true;
  } catch {
    return false;
  }
}

export default function Solexnavbar(props) {
  const inside = useIsInsideRouter();
  return inside ? (
    <NavContent {...props} />
  ) : (
    <BrowserRouter>
      <NavContent {...props} />
    </BrowserRouter>
  );
}

// ─── Core ─────────────────────────────────────────────────────────────────────
function NavContent({
  wishCount = 0,
  notifCount = 0,
  isLoggedIn = false,
  userAvatar = "",
  userName = "Guest",
}) {
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null); // desktop mega
  const [mobileExpanded, setMobileExpanded] = useState(null); // mobile accordion
  const [currency, setCurrency] = useState("INR");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const lastScrollY = useRef(0);
  const searchInputRef = useRef(null);
  const dropdownTimer = useRef(null);

  // Mount animation
  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
    setProfileOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Scroll-aware hide/show + shadow
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setVisible(y <= 80 || y < lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setSearchOpen(false);
      setActiveDropdown(null);
      setProfileOpen(false);
      setCurrencyOpen(false);
      setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-focus search
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Google Fonts
  useEffect(() => {
    if (!document.querySelector("#solex-fonts")) {
      const link = Object.assign(document.createElement("link"), {
        id: "solex-fonts",
        rel: "stylesheet",
        href: FONT_LINK,
      });
      document.head.appendChild(link);
    }
  }, []);

  const openDropdown = (label) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };
  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };
  const keepDropdown = () => clearTimeout(dropdownTimer.current);
  const toggleMobile = (label) =>
    setMobileExpanded((p) => (p === label ? null : label));
  const currentSymbol =
    CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹";
  const cartCount = useSelector((state) =>
    state.cart.cartItems.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <>
      <style>{`
        :root {
          --nav-display: 'Barlow Condensed', Impact, sans-serif;
          --nav-body:    'DM Sans', sans-serif;
        }
        .snav * { font-family: var(--nav-body); }
        .snav-label { font-family: var(--nav-display) !important; letter-spacing: 0.06em; }
        @keyframes sNav-enter   { from { opacity:0; transform:translateY(-100%) } to { opacity:1; transform:translateY(0) } }
        @keyframes sDrop-down   { from { opacity:0; transform:translateY(-8px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes sDrawer-in   { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        @keyframes sFade-in     { from { opacity:0 } to { opacity:1 } }
        .snav-enter  { animation: sNav-enter  0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .sdrop       { animation: sDrop-down  0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .sdrawer     { animation: sDrawer-in  0.32s cubic-bezier(0.16,1,0.3,1) both; }
        .sfade       { animation: sFade-in    0.2s ease both; }
        /* Accordion height transition */
        .sacc { overflow:hidden; transition: max-height 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease; }
        .sacc-closed { max-height:0; opacity:0; }
        .sacc-open   { max-height:600px; opacity:1; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header
        className={[
          "snav fixed top-0 inset-x-0 z-50 transition-all duration-500 will-change-transform",
          "bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl",
          scrolled
            ? "shadow-[0_4px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.6)]"
            : "border-b border-zinc-100/80 dark:border-white/[0.05]",
          visible ? "translate-y-0" : "-translate-y-full",
          mounted ? "snav-enter" : "opacity-0",
        ].join(" ")}
      >
        {/* Announcement — desktop only */}
        <div className="hidden md:flex items-center justify-between bg-zinc-950 dark:bg-zinc-900 px-6 py-1.5 text-[10.5px] tracking-widest uppercase text-zinc-400 select-none">
          <span className="flex items-center gap-1.5">
            <Globe size={10} className="text-zinc-500" />
            India · {currentSymbol}
          </span>
          <span className="flex items-center gap-2">
            <Zap size={10} className="text-amber-400" />
            Free shipping over ₹2999 ·{" "}
            <span className="text-amber-400 font-semibold">SOLEX10</span>
            <Zap size={10} className="text-amber-400" />
          </span>
          <span className="flex items-center gap-3 text-zinc-500">
            <a href="/help" className="hover:text-white transition-colors">
              Help
            </a>
            <a href="/track" className="hover:text-white transition-colors">
              Track Order
            </a>
          </span>
        </div>

        {/* Main row */}
        <nav className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex h-16 sm:h-[60px] items-center justify-between gap-2">
            {/* LEFT — Logo */}
            <NavLink
              to="/"
              className="flex flex-col items-center align-text-bottom shrink-0 group focus:outline-none -mt-0.5"
            >
              <img
                src={SolexLogo}
                alt="Solex"
                className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className="text-[14px] font-bold text-zinc-900 dark:text-white block -ml-0.5 -mt-px"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Modern Performance Footwear
              </span>
            </NavLink>

            {/* CENTER — Desktop links only */}
            <ul className="hidden lg:flex items-center gap-0.5 h-full">
              {NAV_LINKS.map((link) => (
                <li
                  key={link.to}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => link.mega && openDropdown(link.label)}
                  onMouseLeave={() => link.mega && closeDropdown()}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      [
                        "snav-label relative flex items-center gap-1 px-3.5 py-1.5 text-[13.5px] font-bold uppercase",
                        "transition-colors duration-200 rounded-lg focus:outline-none select-none",
                        isActive
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white",
                        activeDropdown === link.label &&
                          "text-zinc-950 dark:text-white",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {link.mega && (
                          <ChevronDown
                            size={13}
                            className={[
                              "transition-transform duration-200 mt-px",
                              activeDropdown === link.label ? "rotate-180" : "",
                            ].join(" ")}
                          />
                        )}
                        <span
                          className={[
                            "absolute bottom-0 inset-x-3 h-[2px] rounded-full bg-amber-500",
                            "transition-transform duration-300 origin-center",
                            isActive ? "scale-x-100" : "scale-x-0",
                          ].join(" ")}
                        />
                      </>
                    )}
                  </NavLink>

                  {/* Mega dropdown */}
                  {link.mega && activeDropdown === link.label && (
                    <div
                      className="sdrop absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[580px]"
                      onMouseEnter={keepDropdown}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-zinc-100 dark:border-white/[0.06] overflow-hidden">
                        <div
                          className="grid gap-0 p-5"
                          style={{
                            gridTemplateColumns: `repeat(${link.columns.length},1fr)`,
                          }}
                        >
                          {link.columns.map((col) => (
                            <div
                              key={col.heading}
                              className="px-3 first:pl-1 last:pr-1"
                            >
                              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                                {col.icon}
                                {col.heading}
                              </p>
                              <ul className="space-y-0.5">
                                {col.items.map((item) => (
                                  <li key={item.to}>
                                    <NavLink
                                      to={item.to}
                                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.05] hover:text-zinc-950 dark:hover:text-white transition-colors duration-150"
                                    >
                                      <span>{item.label}</span>
                                      {item.badge && (
                                        <Badge label={item.badge} />
                                      )}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {link.promo && (
                          <div className="border-t border-zinc-100 dark:border-white/[0.06] px-6 py-3 flex items-center justify-between bg-zinc-50/60 dark:bg-white/[0.02]">
                            <NavLink
                              to={link.promo.to}
                              className="flex items-center gap-2 text-[12px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                            >
                              {link.promo.label} <ArrowRight size={13} />
                            </NavLink>
                            <span className="text-[10px] font-semibold tracking-wide uppercase text-zinc-400 bg-zinc-100 dark:bg-white/10 px-2.5 py-1 rounded-full">
                              {link.promo.tag}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* RIGHT — icon tray */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Search — all breakpoints */}
              <div className="relative flex items-center">
                {searchOpen && (
                  <div className="sfade absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-1.5 w-44 sm:w-56 z-10">
                    <Search size={14} className="text-zinc-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search shoes..."
                      className="bg-transparent text-[13px] text-zinc-900 dark:text-white placeholder-zinc-400 w-full focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
                <IconBtn
                  onClick={() => setSearchOpen((p) => !p)}
                  label="Search"
                >
                  {searchOpen ? <X size={19} /> : <Search size={19} />}
                </IconBtn>
              </div>

              {/* Dark mode — hidden on mobile (available in drawer) */}
              <IconBtn
                onClick={() => setDarkMode((p) => !p)}
                label="Toggle dark mode"
                className="hidden sm:flex"
              >
                {darkMode ? (
                  <Sun size={18} strokeWidth={1.8} />
                ) : (
                  <Moon size={18} strokeWidth={1.8} />
                )}
              </IconBtn>

              {/* Currency — desktop only */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setCurrencyOpen((p) => !p)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[12px] font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none min-h-[40px]"
                >
                  <Globe size={14} />
                  {currency}
                </button>
                {currencyOpen && (
                  <div className="sdrop absolute right-0 top-full mt-1 w-28 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-white/[0.06] overflow-hidden py-1 z-50">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setCurrencyOpen(false);
                        }}
                        className={[
                          "w-full text-left px-3.5 py-2 text-[12px] font-medium transition-colors",
                          c.code === currency
                            ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        {c.symbol} {c.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications — desktop only */}
              <IconBtn label="Notifications" className="hidden sm:flex">
                <Bell size={19} strokeWidth={1.8} />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
                )}
              </IconBtn>

              {/* Wishlist — desktop only */}
              <div className="hidden sm:block">
                <NavLink
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="relative flex items-center justify-center p-2.5 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none min-h-[40px] min-w-[40px]"
                >
                  <Heart size={19} strokeWidth={1.8} />
                  {wishCount > 0 && (
                    <CountBadge count={wishCount} color="bg-rose-500" />
                  )}
                </NavLink>
              </div>

              {/* Cart — all breakpoints */}
              <NavLink
                to="/cart"
                aria-label="Cart"
                className="relative flex items-center justify-center p-2.5 rounded-xl text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none min-h-[40px] min-w-[40px]"
              >
                <ShoppingCart size={19} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <CountBadge count={cartCount} color="bg-amber-500" />
                )}
              </NavLink>

              {/* Divider */}
              <div className="hidden lg:block w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

              {/* Profile / Login — desktop only */}
              {isLoggedIn ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 focus:outline-none min-h-[40px]"
                  >
                    <Avatar src={userAvatar} name={userName} size="sm" />
                    <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 max-w-[80px] truncate">
                      {userName}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-zinc-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {profileOpen && (
                    <div className="sdrop absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-white/[0.06] overflow-hidden py-1.5">
                      <ProfileItem
                        icon={<User size={14} />}
                        label="My Profile"
                        to="/account"
                      />
                      <ProfileItem
                        icon={<Package size={14} />}
                        label="My Orders"
                        to="/orders"
                      />
                      <ProfileItem
                        icon={<Heart size={14} />}
                        label="Wishlist"
                        to="/wishlist"
                      />
                      <ProfileItem
                        icon={<Settings size={14} />}
                        label="Settings"
                        to="/settings"
                      />
                      <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]" />
                      <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Login Button (Secondary) */}
                  <NavLink
                    to="/auth/login"
                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
    text-zinc-700 dark:text-zinc-300 
    hover:bg-zinc-100 dark:hover:bg-zinc-800 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400/40 
    active:scale-95 min-h-[40px]"
                  >
                    <User size={16} strokeWidth={2} />
                    Login
                  </NavLink>

                  {/* Register Button (Primary CTA) */}
                  <NavLink
                    to="/auth/register"
                    className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold 
    bg-amber-500 text-white 
    hover:bg-amber-600 
    shadow-sm hover:shadow-md 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400/50 
    active:scale-95 min-h-[40px]"
                  >
                    Register
                  </NavLink>
                </>
              )}

              {/* Hamburger — mobile + tablet */}
              <button
                onClick={() => setDrawerOpen((p) => !p)}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                aria-expanded={drawerOpen}
                className="lg:hidden flex items-center justify-center p-2.5 rounded-xl transition-colors duration-200 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none min-h-[40px] min-w-[40px]"
              >
                <span className="relative block w-5 h-5">
                  <Menu
                    size={20}
                    className={`absolute inset-0 transition-all duration-200 ${drawerOpen ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
                  />
                  <X
                    size={20}
                    className={`absolute inset-0 transition-all duration-200 ${drawerOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                  />
                </span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────────────────────────────────── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="sfade fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={[
          "fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[340px]",
          "bg-white dark:bg-[#0d0d0d] flex flex-col lg:hidden",
          "shadow-[4px_0_40px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_40px_rgba(0,0,0,0.7)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-white/[0.06] shrink-0">
          <NavLink
            to="/"
            className="focus:outline-none"
            onClick={() => setDrawerOpen(false)}
          >
            <img src={SolexLogo} alt="Solex" className="h-8 w-auto" />
          </NavLink>
          <div className="flex items-center gap-1">
            {/* Dark mode inside drawer */}
            <button
              onClick={() => setDarkMode((p) => !p)}
              className="flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px]"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-center p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors min-h-[40px] min-w-[40px]"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Search inside drawer */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3.5 py-2.5">
            <Search size={15} className="text-zinc-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shoes, brands..."
              className="bg-transparent text-[13px] text-zinc-900 dark:text-white placeholder-zinc-400 w-full focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable nav links */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          {/* User greeting */}
          {isLoggedIn && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Avatar src={userAvatar} name={userName} size="md" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                  {userName}
                </p>
                <NavLink
                  to="/account"
                  onClick={() => setDrawerOpen(false)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline"
                >
                  View Profile →
                </NavLink>
              </div>
            </div>
          )}

          <nav className="space-y-0.5 mt-1">
            {NAV_LINKS.map((link) => (
              <div key={link.to}>
                {link.mega ? (
                  /* Accordion item */
                  <>
                    <button
                      onClick={() => toggleMobile(link.label)}
                      className={[
                        "snav-label w-full flex items-center justify-between px-4 py-3.5 rounded-xl",
                        "text-[15px] font-bold tracking-wide uppercase transition-colors duration-200",
                        mobileExpanded === link.label
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white"
                          : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                      ].join(" ")}
                    >
                      {link.label}
                      <ChevronDown
                        size={16}
                        className={`text-zinc-400 transition-transform duration-300 ${mobileExpanded === link.label ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Accordion body */}
                    <div
                      className={`sacc ${mobileExpanded === link.label ? "sacc-open" : "sacc-closed"}`}
                    >
                      <div className="pb-1 pl-2">
                        {link.columns.map((col) => (
                          <div key={col.heading} className="mb-3">
                            <p className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                              {col.icon}
                              {col.heading}
                            </p>
                            {col.items.map((item) => (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setDrawerOpen(false)}
                                className={({ isActive }) =>
                                  [
                                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors duration-150",
                                    isActive
                                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white",
                                  ].join(" ")
                                }
                              >
                                <span>{item.label}</span>
                                {item.badge && <Badge label={item.badge} />}
                              </NavLink>
                            ))}
                          </div>
                        ))}
                        {/* Promo link */}
                        {link.promo && (
                          <NavLink
                            to={link.promo.to}
                            onClick={() => setDrawerOpen(false)}
                            className="flex items-center gap-2 mx-3 mt-1 mb-2 py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-[12.5px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                          >
                            <ArrowRight size={13} />
                            {link.promo.label}
                            <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                              {link.promo.tag}
                            </span>
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Simple link */
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      [
                        "snav-label flex items-center justify-between w-full px-4 py-3.5 rounded-xl",
                        "text-[15px] font-bold tracking-wide uppercase transition-colors duration-200",
                        isActive
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                          : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/60",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Secondary links */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.06] grid grid-cols-2 gap-2">
            <DrawerAction
              to="/wishlist"
              icon={<Heart size={15} />}
              label="Wishlist"
              count={wishCount}
              onClick={() => setDrawerOpen(false)}
            />
            <DrawerAction
              to="/cart"
              icon={<ShoppingCart size={15} />}
              label="Cart"
              count={cartCount}
              onClick={() => setDrawerOpen(false)}
            />
            <DrawerAction
              to="/orders"
              icon={<Package size={15} />}
              label="Orders"
              onClick={() => setDrawerOpen(false)}
            />
            <DrawerAction
              to="/settings"
              icon={<Settings size={15} />}
              label="Settings"
              onClick={() => setDrawerOpen(false)}
            />
          </div>

          {/* Currency selector inside drawer */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.06]">
            <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Currency
            </p>
            <div className="flex gap-2 flex-wrap">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
                    c.code === currency
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  ].join(" ")}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-zinc-100 dark:border-white/[0.06] shrink-0">
          {isLoggedIn ? (
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              <LogOut size={15} />
              Sign Out
            </button>
          ) : (
            <NavLink
              to="/auth/login"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[13.5px] font-bold hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors duration-200"
            >
              <User size={15} />
              Login / Create Account
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function IconBtn({ onClick, label, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        "relative flex items-center justify-center p-2.5 rounded-xl",
        "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100",
        "dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800",
        "transition-colors duration-200 focus:outline-none min-h-[40px] min-w-[40px]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CountBadge({ count, color }) {
  return (
    <span
      className={`absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5 flex items-center justify-center rounded-full ${color} text-white text-[9px] font-bold leading-none`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Badge({ label }) {
  const style =
    label === "Hot" || label === "🔥"
      ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
      : label === "New"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
  return (
    <span
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${style}`}
    >
      {label}
    </span>
  );
}

function Avatar({ src, name, size = "sm" }) {
  const sz = size === "md" ? "w-9 h-9 text-[14px]" : "w-7 h-7 text-[12px]";
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${sz} rounded-full object-cover ring-2 ring-amber-400/60`}
    />
  ) : (
    <div
      className={`${sz} rounded-full bg-amber-500 flex items-center justify-center text-white font-bold`}
    >
      {name?.[0]?.toUpperCase() ?? "U"}
    </div>
  );
}

function ProfileItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04] hover:text-zinc-950 dark:hover:text-white transition-colors"
    >
      <span className="text-zinc-400">{icon}</span>
      {label}
    </NavLink>
  );
}

function DrawerAction({ to, icon, label, count, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200 min-h-[44px]"
    >
      <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
      {label}
      {count > 0 && (
        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
          {count}
        </span>
      )}
    </NavLink>
  );
}
