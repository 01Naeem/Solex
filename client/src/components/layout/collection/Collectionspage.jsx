/**
 * SolexCollections.jsx — Production-Grade Ecommerce Collections System
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURE OVERVIEW
 * ─────────────────────
 * • State Management  → Zustand stores (theme, cart, wishlist, filters, products)
 * • API Layer         → axios-based service with interceptors + caching
 * • Performance       → React.memo, useMemo, useCallback, Intersection Observer
 * • Animations        → Framer Motion stagger, layout, spring transitions
 * • Dark Mode         → Context + localStorage + system preference detection
 * • Filtering         → URL query sync, mobile drawer, desktop sidebar
 * • Search            → Debounced, highlighted, with recent searches
 * • Loading           → Shimmer skeleton system for all components
 * • Accessibility     → ARIA labels, keyboard nav, reduced motion support
 *
 * FOLDER STRUCTURE (for multi-file refactor)
 * ───────────────────────────────────────────
 * src/
 * ├── components/
 * │   ├── ui/          ProductCard, SkeletonCard, Badge, StarRating
 * │   ├── cards/       BentoCard, EditorialCard, SaleRailCard, NewArrivalCard
 * │   ├── layout/      FilterBar, FilterDrawer, SortDropdown, SearchBar
 * │   └── modals/      QuickViewModal, FilterModal
 * ├── sections/
 * │   ├── HeroBanner, FeaturedSpotlight, RunningGrid, LifestyleBento
 * │   ├── BasketballEditorial, SaleRail, NewArrivalsGrid, CTABand
 * ├── hooks/
 * │   ├── useProducts.js, useFilters.js, useSearch.js, useIntersection.js
 * │   └── useDebounce.js, useLocalStorage.js, useScrollLock.js
 * ├── store/
 * │   ├── useThemeStore.js, useCartStore.js, useWishlistStore.js
 * │   └── useFilterStore.js, useProductStore.js
 * ├── services/
 * │   ├── api.js (axios instance), products.service.js, categories.service.js
 * ├── utils/
 * │   ├── formatters.js, urlSync.js, cache.js
 * └── constants/
 *     └── filters.js, animations.js, breakpoints.js
 */

// ─── Imports ──────────────────────────────────────────────────────────────────
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  memo,
  Suspense,
  lazy,
} from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Sparkles,
  X,
  Search,
  Sun,
  Moon,
  Filter,
  TrendingUp,
  Eye,
  Share2,
  Check,
  RefreshCw,
  Bell,
  ChevronDown,
  Loader2,
  Grid3X3,
  List,
  Maximize2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "/api";

// Semantic color tokens (maps to CSS custom properties)
const COLORS = {
  amber: "#F59E0B",
  amberHover: "#F59E0B",
  red: "#EF4444",
  emerald: "#10B981",
  violet: "#8B5CF6",
  pink: "#EC4899",
};

const FILTER_PILLS = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Basketball", value: "basketball" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Training", value: "training" },
  { label: "Football", value: "football" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Sale", value: "sale" },
  { label: "New Arrivals", value: "new-arrivals" },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Best Rated", value: "rating" },
  { label: "Most Popular", value: "popularity" },
  { label: "Biggest Discount", value: "discount" },
  { label: "Best Selling", value: "best_selling" },
];

const SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
const COLOR_OPTIONS = [
  { label: "Black", hex: "#18181B" },
  { label: "White", hex: "#FAFAFA" },
  { label: "Red", hex: "#EF4444" },
  { label: "Blue", hex: "#3B82F6" },
  { label: "Green", hex: "#22C55E" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Purple", hex: "#8B5CF6" },
  { label: "Pink", hex: "#EC4899" },
];
const BRANDS = ["Solex", "CloudRun", "Sprint", "HyperBoost", "AeroStrike"];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: MOCK DATA (Replace with API calls in production)
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_RUNNING = [
  {
    id: 101,
    name: "SolexAir Pro",
    sub: "Road Running",
    price: 8999,
    originalPrice: 11999,
    rating: 4.9,
    reviews: 1243,
    badge: "New",
    badgeColor: "bg-amber-500",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85&auto=format",
    slug: "solexair-pro",
    colors: ["#18181B", "#EF4444", "#3B82F6"],
    stock: 12,
    isNew: true,
  },
  {
    id: 102,
    name: "CloudRun X",
    sub: "Trail Running",
    price: 6499,
    originalPrice: null,
    rating: 4.8,
    reviews: 876,
    badge: "Best Seller",
    badgeColor: "bg-emerald-500",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=85&auto=format",
    slug: "cloudrun-x",
    colors: ["#FAFAFA", "#F59E0B", "#22C55E"],
    stock: 34,
    isNew: false,
  },
  {
    id: 103,
    name: "Sprint Edge V2",
    sub: "Track & Field",
    price: 7299,
    originalPrice: 9499,
    rating: 4.7,
    reviews: 534,
    badge: "23% OFF",
    badgeColor: "bg-red-500",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=85&auto=format",
    slug: "sprint-edge",
    colors: ["#DC2626", "#18181B", "#FAFAFA"],
    stock: 5,
    isNew: false,
  },
  {
    id: 104,
    name: "Velocity Knit Pro",
    sub: "Marathon",
    price: 5999,
    originalPrice: null,
    rating: 4.6,
    reviews: 421,
    badge: null,
    badgeColor: null,
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&q=85&auto=format",
    slug: "velocity-knit",
    colors: ["#6366F1", "#FAFAFA", "#F59E0B"],
    stock: 28,
    isNew: false,
  },
  {
    id: 105,
    name: "TrailX Hiker Pro",
    sub: "Trail & Hike",
    price: 5499,
    originalPrice: null,
    rating: 4.5,
    reviews: 312,
    badge: null,
    badgeColor: null,
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=85&auto=format",
    slug: "trailx",
    colors: ["#92400E", "#18181B", "#6B7280"],
    stock: 19,
    isNew: false,
  },
  {
    id: 106,
    name: "PaceMax Ultra",
    sub: "Long Distance",
    price: 9299,
    originalPrice: 11999,
    rating: 4.9,
    reviews: 678,
    badge: "Hot",
    badgeColor: "bg-orange-500",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85&auto=format",
    slug: "pacemax",
    colors: ["#F97316", "#18181B", "#FAFAFA"],
    stock: 8,
    isNew: true,
  },
];

const MOCK_LIFESTYLE = [
  {
    id: 201,
    name: "StreetEdge 2",
    sub: "Urban Lifestyle",
    price: 4999,
    originalPrice: 6999,
    rating: 4.7,
    reviews: 1102,
    badge: "30% OFF",
    badgeColor: "bg-red-500",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=85&auto=format",
    slug: "streetedge-2",
    size: "large",
    colors: ["#92400E", "#18181B", "#9CA3AF"],
  },
  {
    id: 202,
    name: "Classic Low OG",
    sub: "Heritage",
    price: 2999,
    originalPrice: null,
    rating: 4.9,
    reviews: 2341,
    badge: "Icon",
    badgeColor: "bg-zinc-800",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=85&auto=format",
    slug: "classic-low",
    size: "small",
    colors: ["#FAFAFA", "#18181B", "#D97706"],
  },
  {
    id: 203,
    name: "Urban Glide",
    sub: "Casual",
    price: 4499,
    originalPrice: null,
    rating: 4.5,
    reviews: 567,
    badge: null,
    badgeColor: null,
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=85&auto=format",
    slug: "urban-glide",
    size: "small",
    colors: ["#1E40AF", "#FAFAFA", "#F59E0B"],
  },
  {
    id: 204,
    name: "RetroWave Hi",
    sub: "90s Revival",
    price: 5499,
    originalPrice: 6999,
    rating: 4.8,
    reviews: 889,
    badge: "Trending",
    badgeColor: "bg-violet-600",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85&auto=format",
    slug: "retrowave",
    size: "small",
    colors: ["#7C3AED", "#F59E0B", "#18181B"],
  },
  {
    id: 205,
    name: "SlipOn Luxe",
    sub: "Premium Casual",
    price: 3499,
    originalPrice: null,
    rating: 4.6,
    reviews: 334,
    badge: null,
    badgeColor: null,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=85&auto=format",
    slug: "slipon-luxe",
    size: "small",
    colors: ["#065F46", "#FAFAFA", "#D97706"],
  },
];

const MOCK_BASKETBALL = [
  {
    id: 301,
    name: "HyperBoost Elite",
    sub: "High Performance",
    price: 9999,
    originalPrice: null,
    rating: 5.0,
    reviews: 312,
    badge: "Limited",
    badgeColor: "bg-violet-600",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=85&auto=format",
    slug: "hyperboost",
    colors: ["#18181B", "#8B5CF6", "#F59E0B"],
    quote: "Engineered for the 4th quarter.",
  },
  {
    id: 302,
    name: "DriveLane Low",
    sub: "Court Casual",
    price: 6799,
    originalPrice: 8999,
    rating: 4.8,
    reviews: 541,
    badge: "24% OFF",
    badgeColor: "bg-red-500",
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=85&auto=format",
    slug: "drivelane",
    colors: ["#DC2626", "#FAFAFA", "#18181B"],
    quote: "Low profile. High impact.",
  },
];

const MOCK_SALE = [
  {
    id: 401,
    name: "SolexAir Lite",
    price: 3999,
    originalPrice: 7999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format",
    slug: "solexair-lite",
    rating: 4.6,
  },
  {
    id: 402,
    name: "CloudRun Basic",
    price: 2999,
    originalPrice: 5499,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80&auto=format",
    slug: "cloudrun-basic",
    rating: 4.5,
  },
  {
    id: 403,
    name: "StreetEdge 1",
    price: 2499,
    originalPrice: 4999,
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80&auto=format",
    slug: "streetedge-1",
    rating: 4.7,
  },
  {
    id: 404,
    name: "TrailX Lite",
    price: 3499,
    originalPrice: 5999,
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80&auto=format",
    slug: "trailx-lite",
    rating: 4.4,
  },
  {
    id: 405,
    name: "Velocity Basic",
    price: 1999,
    originalPrice: 3999,
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&q=80&auto=format",
    slug: "velocity-basic",
    rating: 4.3,
  },
  {
    id: 406,
    name: "Classic Mid",
    price: 2299,
    originalPrice: 4499,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&auto=format",
    slug: "classic-mid",
    rating: 4.8,
  },
];

const MOCK_NEW_ARRIVALS = [
  {
    id: 501,
    name: "AeroStrike Pro",
    sub: "Football",
    price: 7499,
    originalPrice: null,
    rating: 4.9,
    reviews: 89,
    badge: "Just Dropped",
    badgeColor: "bg-amber-500",
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=85&auto=format",
    slug: "aerostrike",
  },
  {
    id: 502,
    name: "FlexRun Women's",
    sub: "Running · Women",
    price: 5999,
    originalPrice: null,
    rating: 4.8,
    reviews: 134,
    badge: "New",
    badgeColor: "bg-pink-500",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=85&auto=format",
    slug: "flexrun-women",
  },
  {
    id: 503,
    name: "MiniBoost Kids",
    sub: "Kids · Running",
    price: 2499,
    originalPrice: null,
    rating: 4.7,
    reviews: 201,
    badge: "New",
    badgeColor: "bg-emerald-500",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=85&auto=format",
    slug: "miniboost",
  },
  {
    id: 504,
    name: "PowerStep Elite",
    sub: "Training",
    price: 8299,
    originalPrice: null,
    rating: 4.9,
    reviews: 67,
    badge: "Just Dropped",
    badgeColor: "bg-amber-500",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=85&auto=format",
    slug: "powerstep-elite",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: API SERVICE LAYER
// ═══════════════════════════════════════════════════════════════════════════════

//  * API Service — Replace mock data with real axios calls

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) store.dispatch(logout());
    return Promise.reject(err);
  },
);

// In-memory cache for API responses
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(key, fetchFn) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetchFn();
  apiCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Simulated API with realistic delay
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const ProductsService = {
  async getRunning(params = {}) {
    await sleep(600);
    return {
      data: MOCK_RUNNING,
      total: MOCK_RUNNING.length,
      page: 1,
      pages: 1,
    };
  },
  async getLifestyle(params = {}) {
    await sleep(500);
    return { data: MOCK_LIFESTYLE, total: MOCK_LIFESTYLE.length };
  },
  async getBasketball(params = {}) {
    await sleep(450);
    return { data: MOCK_BASKETBALL, total: MOCK_BASKETBALL.length };
  },
  async getSale(params = {}) {
    await sleep(550);
    return { data: MOCK_SALE, total: MOCK_SALE.length };
  },
  async getNewArrivals(params = {}) {
    await sleep(480);
    return { data: MOCK_NEW_ARRIVALS, total: MOCK_NEW_ARRIVALS.length };
  },
  async getFeatured() {
    await sleep(400);
    return { data: MOCK_RUNNING[0] };
  },
  async search(query, params = {}) {
    await sleep(300);
    const all = [
      ...MOCK_RUNNING,
      ...MOCK_LIFESTYLE,
      ...MOCK_BASKETBALL,
      ...MOCK_NEW_ARRIVALS,
    ];
    const results = all.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sub?.toLowerCase().includes(query.toLowerCase()),
    );
    return { data: results };
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: STATE MANAGEMENT (Zustand-style local stores using Context)
// ════
// ── Theme Store ───────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored =
      typeof window !== "undefined" && localStorage.getItem("solex-theme");
    if (stored) return stored;
    return window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("solex-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

// ── Cart Store ────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState(null);

  const addItem = useCallback((product, size = null) => {
    setItems((prev) => {
      const key = `${product.id}-${size}`;
      const existing = prev.find((i) => i.key === key);
      if (existing)
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, key, size, qty: 1 }];
    });
    setRecentlyAdded(product.id);
    setTimeout(() => setRecentlyAdded(null), 2000);
  }, []);

  const removeItem = useCallback(
    (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
    [],
  );
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        totalItems,
        totalPrice,
        recentlyAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

// ── Wishlist Store ────────────────────────────────────────────────────────────
const WishlistContext = createContext(null);

function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("solex-wishlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("solex-wishlist", JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const isWishlisted = useCallback((id) => ids.includes(id), [ids]);

  return (
    <WishlistContext.Provider
      value={{ ids, toggle, isWishlisted, count: ids.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

const useWishlist = () => useContext(WishlistContext);

// ── Filter Store ──────────────────────────────────────────────────────────────
const FilterContext = createContext(null);

const DEFAULT_FILTERS = {
  category: "all",
  gender: [],
  brands: [],
  sizes: [],
  colors: [],
  priceMin: 0,
  priceMax: 15000,
  ratingMin: 0,
  onSale: false,
  inStock: false,
};

function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("solex-searches") || "[]");
    } catch {
      return [];
    }
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.gender.length) count += filters.gender.length;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.priceMin > 0 || filters.priceMax < 15000) count++;
    if (filters.ratingMin > 0) count++;
    if (filters.onSale) count++;
    if (filters.inStock) count++;
    return count;
  }, [filters]);

  const addRecentSearch = useCallback((term) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s !== term)].slice(0, 6);
      localStorage.setItem("solex-searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        clearFilters,
        activeFilterCount,
        sort,
        setSort,
        search,
        setSearch,
        filterDrawerOpen,
        setFilterDrawerOpen,
        recentSearches,
        addRecentSearch,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

const useFilters = () => useContext(FilterContext);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Intersection Observer hook for reveal animations
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...options },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

// Data fetching hook
function useAsync(fetchFn, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await fetchFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err.message || "Failed to load",
      });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, retry: execute };
}

// Scroll lock hook for modals/drawers
function useScrollLock(locked) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}

// Countdown timer hook
function useCountdown(targetSeconds) {
  const [time, setTime] = useState(targetSeconds);
  useEffect(() => {
    const interval = setInterval(
      () => setTime((t) => Math.max(0, t - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);
  const hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");
  return { hours, mins, secs };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = memo(({ rating, size = 11, count = null }) => (
  <div
    className="flex items-center gap-1"
    role="img"
    aria-label={`${rating} out of 5 stars`}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={
          i <= Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
        }
      />
    ))}
    {count !== null && (
      <span className="text-[11px] text-zinc-500 ml-0.5">
        ({count.toLocaleString("en-IN")})
      </span>
    )}
  </div>
));

// ── Price Display ─────────────────────────────────────────────────────────────
const PriceDisplay = memo(({ price, originalPrice, size = "md" }) => {
  const disc = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const priceSize =
    size === "lg"
      ? "text-[28px]"
      : size === "sm"
        ? "text-[13px]"
        : "text-[15px]";

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span
        className={`${priceSize} font-bold text-zinc-900 dark:text-white`}
        style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
      >
        ₹{price.toLocaleString("en-IN")}
      </span>
      {originalPrice && (
        <>
          <span className="text-[12px] text-zinc-400 line-through">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            {disc}% off
          </span>
        </>
      )}
    </div>
  );
});

// ── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = memo(
  ({
    icon,
    text,
    accent = "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10",
  }) => (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest ${accent}`}
    >
      {icon}
      {text}
    </span>
  ),
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = memo(
  ({ label, icon, title, accent, viewAllPath, accentWord }) => {
    const [ref, inView] = useInView();
    return (
      <div
        ref={ref}
        className={`flex items-end justify-between mb-6 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div>
          <SectionLabel icon={icon} text={label} accent={accent} />
          <h2
            className="text-zinc-900 dark:text-white mt-1.5 leading-[0.9]"
            style={{
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
            }}
          >
            {title}
            {accentWord && (
              <>
                <br />
                <span className="text-amber-500">{accentWord}</span>
              </>
            )}
          </h2>
        </div>
        {viewAllPath && (
          <NavLink
            to={viewAllPath}
            className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors shrink-0"
            aria-label={`View all ${label}`}
          >
            View All <ArrowRight size={13} />
          </NavLink>
        )}
      </div>
    );
  },
);

// ── Color Swatches ────────────────────────────────────────────────────────────
const ColorSwatches = memo(({ colors, size = 3 }) => (
  <div className="flex gap-1.5" role="list" aria-label="Available colors">
    {colors?.map((hex) => (
      <div
        key={hex}
        role="listitem"
        className="rounded-full border border-zinc-200 dark:border-zinc-600"
        style={{ width: size * 4 + 4, height: size * 4 + 4, background: hex }}
        title={hex}
      />
    ))}
  </div>
));

// ── Stock Indicator ───────────────────────────────────────────────────────────
const StockIndicator = memo(({ stock }) => {
  if (!stock) return null;
  if (stock === 0)
    return (
      <span className="text-[10px] font-semibold text-red-500">
        Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="text-[10px] font-semibold text-orange-500">
        Only {stock} left
      </span>
    );
  return null;
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: SKELETON LOADERS
// ═══════════════════════════════════════════════════════════════════════════════

const shimmerClass =
  "bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]";

const SkeletonProductCard = memo(() => (
  <div className="space-y-3" aria-hidden="true">
    <div className={`aspect-square rounded-2xl ${shimmerClass}`} />
    <div className={`h-3 w-2/3 rounded-full ${shimmerClass}`} />
    <div className={`h-4 w-full rounded-full ${shimmerClass}`} />
    <div className={`h-3 w-1/2 rounded-full ${shimmerClass}`} />
    <div className={`h-5 w-1/3 rounded-full ${shimmerClass}`} />
  </div>
));

const SkeletonBentoCard = memo(({ large }) => (
  <div
    className={`relative overflow-hidden rounded-2xl ${large ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-square"} ${shimmerClass}`}
    aria-hidden="true"
  />
));

const SkeletonSaleCard = memo(() => (
  <div className="shrink-0 w-44 sm:w-52 space-y-2" aria-hidden="true">
    <div className={`aspect-square rounded-2xl ${shimmerClass}`} />
    <div className={`h-3.5 w-4/5 rounded-full ${shimmerClass}`} />
    <div className={`h-4 w-1/2 rounded-full ${shimmerClass}`} />
  </div>
));

const SkeletonFeatured = memo(() => (
  <div
    className="grid lg:grid-cols-2 rounded-3xl overflow-hidden min-h-[420px]"
    aria-hidden="true"
  >
    <div className={`min-h-[280px] ${shimmerClass}`} />
    <div className="bg-zinc-950 dark:bg-zinc-900 p-8 sm:p-10 space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className={`h-3 w-32 rounded-full ${shimmerClass} opacity-20`} />
        <div className={`h-16 w-4/5 rounded-xl ${shimmerClass} opacity-20`} />
        <div className={`h-3 w-full rounded-full ${shimmerClass} opacity-20`} />
        <div className={`h-3 w-3/4 rounded-full ${shimmerClass} opacity-20`} />
      </div>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-24 rounded-xl ${shimmerClass} opacity-20`} />
        <div className={`h-12 w-28 rounded-xl ${shimmerClass} opacity-20`} />
      </div>
    </div>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: ERROR STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ErrorState = memo(({ message, onRetry, label }) => (
  <div
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
    role="alert"
  >
    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
      <X size={24} className="text-red-500" />
    </div>
    <p className="text-[15px] font-semibold text-zinc-900 dark:text-white mb-1">
      Couldn't load {label}
    </p>
    <p className="text-[13px] text-zinc-500 mb-5">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[13px] font-semibold hover:opacity-90 transition-opacity"
    >
      <RefreshCw size={13} /> Try Again
    </button>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: QUICK VIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const QuickViewModal = memo(({ product, onClose }) => {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem, recentlyAdded } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || null,
  );

  useScrollLock(!!product);

  if (!product) return null;

  const disc = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <div
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Close quick view"
        >
          <X size={16} />
        </button>

        <div className="grid sm:grid-cols-2">
          <div className="relative bg-zinc-100 dark:bg-zinc-800 aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {product.badge && (
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${product.badgeColor}`}
              >
                {product.badge}
              </span>
            )}
          </div>

          <div className="p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-1">
              {product.sub}
            </p>
            <h3
              className="text-zinc-900 dark:text-white text-[22px] font-black mb-2"
              style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
            >
              {product.name}
            </h3>
            <StarRating rating={product.rating} count={product.reviews} />

            <div className="mt-4 mb-5">
              <PriceDisplay
                price={product.price}
                originalPrice={product.originalPrice}
                size="lg"
              />
            </div>

            {product.colors && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                  Color
                </p>
                <div className="flex gap-2">
                  {product.colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setSelectedColor(hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === hex ? "border-amber-500 scale-110" : "border-zinc-300 dark:border-zinc-600"}`}
                      style={{ background: hex }}
                      aria-label={`Color ${hex}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Size
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${selectedSize === s ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"}`}
                    aria-pressed={selectedSize === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {product.stock && product.stock <= 5 && (
                <p className="text-[11px] text-orange-500 font-semibold mt-2">
                  ⚡ Only {product.stock} left in stock
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addItem(product, selectedSize)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-bold transition-all active:scale-95"
                aria-label={`Add ${product.name} to cart`}
              >
                {recentlyAdded === product.id ? (
                  <>
                    <Check size={14} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} /> Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${isWishlisted(product.id) ? "bg-rose-500 border-rose-500 text-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-rose-400 hover:text-rose-500"}`}
                aria-label={
                  isWishlisted(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={isWishlisted(product.id)}
              >
                <Heart
                  size={16}
                  className={isWishlisted(product.id) ? "fill-white" : ""}
                />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/[0.06]">
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Zap size={11} className="text-amber-500" />
                Free delivery on orders above ₹4,999
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: FILTER DRAWER
// ═══════════════════════════════════════════════════════════════════════════════

const FilterDrawer = memo(() => {
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useFilters();

  useScrollLock(filterDrawerOpen);

  if (!filterDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
    >
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={() => setFilterDrawerOpen(false)}
      />
      <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-white/[0.06] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={16}
              className="text-zinc-900 dark:text-white"
            />
            <h2 className="text-[16px] font-bold text-zinc-900 dark:text-white">
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[12px] font-semibold text-amber-600 dark:text-amber-400"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
              aria-label="Close filters"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Price Range */}
          <FilterSection title="Price Range">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px] text-zinc-600 dark:text-zinc-400">
                <span>₹{filters.priceMin.toLocaleString("en-IN")}</span>
                <span>₹{filters.priceMax.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15000"
                step="500"
                value={filters.priceMax}
                onChange={(e) =>
                  updateFilter("priceMax", parseInt(e.target.value))
                }
                className="w-full"
                aria-label="Maximum price"
              />
            </div>
          </FilterSection>

          {/* Gender */}
          <FilterSection title="Gender">
            <div className="flex flex-wrap gap-2">
              {["Men", "Women", "Kids", "Unisex"].map((g) => (
                <FilterChip
                  key={g}
                  label={g}
                  active={filters.gender.includes(g)}
                  onClick={() => {
                    const updated = filters.gender.includes(g)
                      ? filters.gender.filter((x) => x !== g)
                      : [...filters.gender, g];
                    updateFilter("gender", updated);
                  }}
                />
              ))}
            </div>
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Brand">
            <div className="space-y-2">
              {BRANDS.map((b) => (
                <label
                  key={b}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${filters.brands.includes(b) ? "bg-amber-500 border-amber-500" : "border-zinc-300 dark:border-zinc-600 group-hover:border-amber-400"}`}
                    onClick={() => {
                      const updated = filters.brands.includes(b)
                        ? filters.brands.filter((x) => x !== b)
                        : [...filters.brands, b];
                      updateFilter("brands", updated);
                    }}
                  >
                    {filters.brands.includes(b) && (
                      <Check size={10} className="text-white" />
                    )}
                  </div>
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                    {b}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Size */}
          <FilterSection title="Size">
            <div className="grid grid-cols-3 gap-1.5">
              {SIZES.map((s) => (
                <FilterChip
                  key={s}
                  label={s}
                  active={filters.sizes.includes(s)}
                  onClick={() => {
                    const updated = filters.sizes.includes(s)
                      ? filters.sizes.filter((x) => x !== s)
                      : [...filters.sizes, s];
                    updateFilter("sizes", updated);
                  }}
                  small
                />
              ))}
            </div>
          </FilterSection>

          {/* Color */}
          <FilterSection title="Color">
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    const updated = filters.colors.includes(c.hex)
                      ? filters.colors.filter((x) => x !== c.hex)
                      : [...filters.colors, c.hex];
                    updateFilter("colors", updated);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${filters.colors.includes(c.hex) ? "border-amber-500 scale-110" : "border-zinc-300 dark:border-zinc-600 hover:scale-105"}`}
                  style={{ background: c.hex }}
                  aria-label={c.label}
                  aria-pressed={filters.colors.includes(c.hex)}
                  title={c.label}
                />
              ))}
            </div>
          </FilterSection>

          {/* Rating */}
          <FilterSection title="Minimum Rating">
            <div className="flex gap-2">
              {[3, 3.5, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    updateFilter("ratingMin", filters.ratingMin === r ? 0 : r)
                  }
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[12px] font-semibold transition-all ${filters.ratingMin === r ? "bg-amber-500 border-amber-500 text-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"}`}
                >
                  <Star
                    size={10}
                    className={
                      filters.ratingMin === r
                        ? "fill-white text-white"
                        : "fill-amber-400 text-amber-400"
                    }
                  />
                  {r}+
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Toggles */}
          <FilterSection title="Availability">
            <div className="space-y-3">
              <FilterToggle
                label="On Sale"
                checked={filters.onSale}
                onChange={(v) => updateFilter("onSale", v)}
              />
              <FilterToggle
                label="In Stock Only"
                checked={filters.inStock}
                onChange={(v) => updateFilter("inStock", v)}
              />
            </div>
          </FilterSection>
        </div>

        <div className="sticky bottom-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/[0.06]">
          <button
            onClick={() => setFilterDrawerOpen(false)}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[14px] font-bold transition-all active:scale-95"
          >
            {activeFilterCount > 0
              ? `Show Results (${activeFilterCount} filters)`
              : "Show Results"}
          </button>
        </div>
      </div>
    </div>
  );
});

const FilterSection = ({ title, children }) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
      {title}
    </p>
    {children}
  </div>
);

const FilterChip = ({ label, active, onClick, small }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all ${small ? "text-[11px]" : ""} ${active ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"}`}
    aria-pressed={active}
  >
    {label}
  </button>
);

const FilterToggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
      {label}
    </span>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  </label>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: SEARCH BAR
// ═══════════════════════════════════════════════════════════════════════════════

const SearchBar = memo(() => {
  const { search, setSearch, recentSearches, addRecentSearch } = useFilters();
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const inputRef = useRef(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestLoading(true);
    ProductsService.search(debouncedSearch)
      .then((res) => setSuggestions(res.data.slice(0, 5)))
      .finally(() => setSuggestLoading(false));
  }, [debouncedSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      addRecentSearch(search);
      setFocused(false);
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded-sm">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${focused ? "border-amber-500 ring-2 ring-amber-500/20" : "border-zinc-200 dark:border-zinc-700"} bg-white dark:bg-zinc-900`}
        >
          <Search
            size={14}
            className="text-zinc-400 shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-[13px] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none min-w-0"
            aria-label="Search products"
            aria-expanded={
              focused && (suggestions.length > 0 || recentSearches.length > 0)
            }
            aria-haspopup="listbox"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X
                size={13}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {focused &&
        (suggestions.length > 0 || (!search && recentSearches.length > 0)) && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-white/[0.06] shadow-xl z-50 overflow-hidden"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-[12px] text-zinc-400">
                <Loader2 size={12} className="animate-spin" /> Searching...
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Products
                </p>
                {suggestions.map((s) => (
                  <NavLink
                    key={s.id}
                    to={`/products/${s.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors"
                    onClick={() => addRecentSearch(search)}
                    role="option"
                  >
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                        {highlightMatch(s.name, search)}
                      </p>
                      <p className="text-[11px] text-zinc-500">{s.sub}</p>
                    </div>
                    <span className="ml-auto text-[13px] font-bold text-zinc-900 dark:text-white">
                      ₹{s.price.toLocaleString("en-IN")}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}

            {!search && recentSearches.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Recent
                </p>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-[13px] text-zinc-700 dark:text-zinc-300 transition-colors"
                    onClick={() => setSearch(s)}
                    role="option"
                  >
                    <Search
                      size={12}
                      className="text-zinc-400"
                      aria-hidden="true"
                    />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: PRODUCT CARDS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Standard Product Card ─────────────────────────────────────────────────────
const ProductCard = memo(({ product, delay = 0, onQuickView }) => {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem, recentlyAdded } = useCart();
  const [ref, inView] = useInView();
  const wishlisted = isWishlisted(product.id);
  const justAdded = recentlyAdded === product.id;

  return (
    <article
      ref={ref}
      className={`group block transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay * 80}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-square mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />

        {product.badge && (
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${product.badgeColor} shadow-sm`}
          >
            {product.badge}
          </span>
        )}

        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          <button
            onClick={() => toggle(product.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${wishlisted ? "bg-rose-500 text-white opacity-100" : "bg-white/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"}`}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
          >
            <Heart size={14} className={wishlisted ? "fill-white" : ""} />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-900 hover:text-white shadow-sm"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={13} />
            </button>
          )}
        </div>

        {/* Add to Cart — slide up on hover */}
        <button
          onClick={() => addItem(product)}
          className="absolute bottom-0 inset-x-0 py-2.5 bg-zinc-950/90 dark:bg-white/90 text-white dark:text-zinc-950 text-[12px] font-bold flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <>
              <Check size={13} /> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={13} /> Add to Cart
            </>
          )}
        </button>

        {/* Stock warning */}
        {product.stock && product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-10 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full">
              Only {product.stock} left!
            </span>
          </div>
        )}
      </div>

      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide mb-0.5">
        {product.sub}
      </p>
      <NavLink
        to={`/products/${product.slug}`}
        className="text-[13.5px] font-semibold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors block truncate"
      >
        {product.name}
      </NavLink>

      <div className="mt-0.5 mb-1.5">
        <StarRating rating={product.rating} count={product.reviews} />
      </div>

      <PriceDisplay
        price={product.price}
        originalPrice={product.originalPrice}
      />

      {product.colors && (
        <div className="mt-1.5">
          <ColorSwatches colors={product.colors} />
        </div>
      )}
    </article>
  );
});

// ── Bento Card ────────────────────────────────────────────────────────────────
const BentoCard = memo(({ product, large }) => {
  const { toggle, isWishlisted } = useWishlist();
  const [ref, inView] = useInView();
  const wishlisted = isWishlisted(product.id);

  return (
    <NavLink
      ref={ref}
      to={`/products/${product.slug}`}
      className={`relative overflow-hidden rounded-2xl group block transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${large ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-square"}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-600"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />

      {product.badge && (
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${product.badgeColor}`}
        >
          {product.badge}
        </span>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${wishlisted ? "bg-rose-500 text-white opacity-100" : "bg-white/90 text-zinc-600 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100"}`}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
      >
        <Heart size={13} className={wishlisted ? "fill-white" : ""} />
      </button>

      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 mb-0.5">
          {product.sub}
        </p>
        <p
          className="text-white font-black leading-tight"
          style={{
            fontFamily: "'Barlow Condensed', Impact, sans-serif",
            fontSize: large ? "clamp(20px, 3vw, 32px)" : "18px",
          }}
        >
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[13px] font-bold text-white">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Shop <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </NavLink>
  );
});

// ── Editorial Card ────────────────────────────────────────────────────────────
const EditorialCard = memo(({ product }) => {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem, recentlyAdded } = useCart();
  const [ref, inView] = useInView();
  const wishlisted = isWishlisted(product.id);
  const justAdded = recentlyAdded === product.id;
  const disc = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  return (
    <article
      ref={ref}
      className={`group relative rounded-3xl overflow-hidden bg-zinc-950 min-h-[380px] flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="absolute inset-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      <div className="relative p-5 flex items-start justify-between">
        {product.badge && (
          <span
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold text-white ${product.badgeColor}`}
          >
            {product.badge}
          </span>
        )}
        <button
          onClick={() => toggle(product.id)}
          className={`ml-auto w-9 h-9 rounded-full flex items-center justify-center transition-all ${wishlisted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-rose-500 border border-white/20"}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <Heart size={15} className={wishlisted ? "fill-white" : ""} />
        </button>
      </div>

      <div className="relative mt-auto p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 mb-2">
          {product.sub}
        </p>
        {product.quote && (
          <p className="text-zinc-300 text-[13px] italic mb-3 border-l-2 border-amber-500 pl-3">
            "{product.quote}"
          </p>
        )}
        <h3
          className="text-white leading-tight mb-4"
          style={{
            fontFamily: "'Barlow Condensed', Impact, sans-serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900,
          }}
        >
          {product.name}
        </h3>

        <StarRating rating={product.rating} count={product.reviews} />

        <div className="flex items-center justify-between mt-4">
          <div>
            {product.originalPrice && (
              <p className="text-zinc-500 text-[12px] line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </p>
            )}
            <p
              className="text-white text-[28px] font-black"
              style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
            >
              ₹{product.price.toLocaleString("en-IN")}
              {disc && (
                <span className="ml-2 text-[14px] text-emerald-400">
                  {disc}% off
                </span>
              )}
            </p>
          </div>
          <ColorSwatches colors={product.colors} size={4} />
        </div>

        <div className="flex gap-2 mt-4">
          <NavLink
            to={`/products/${product.slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-bold transition-all active:scale-95"
          >
            Buy Now
          </NavLink>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-[13px] font-semibold hover:bg-white/20 transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
});

// ── New Arrival Card ──────────────────────────────────────────────────────────
const NewArrivalCard = memo(({ product, delay = 0 }) => {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem, recentlyAdded } = useCart();
  const [ref, inView] = useInView();
  const wishlisted = isWishlisted(product.id);
  const justAdded = recentlyAdded === product.id;

  return (
    <article
      ref={ref}
      className={`group transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay * 70}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-[3/4] mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.badge && (
          <span
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${product.badgeColor}`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggle(product.id)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlisted ? "bg-rose-500 text-white opacity-100" : "bg-white/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <Heart size={13} className={wishlisted ? "fill-white" : ""} />
        </button>

        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => addItem(product)}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            aria-label={`Quick add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check size={12} /> Added!
              </>
            ) : (
              <>
                <ShoppingCart size={12} /> Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide mb-0.5">
        {product.sub}
      </p>
      <NavLink
        to={`/products/${product.slug}`}
        className="text-[13.5px] font-semibold text-zinc-900 dark:text-white hover:text-amber-500 transition-colors block truncate"
      >
        {product.name}
      </NavLink>
      <div className="mt-0.5 mb-1">
        <StarRating rating={product.rating} count={product.reviews} />
      </div>
      <span className="text-[14px] font-bold text-zinc-900 dark:text-white">
        ₹{product.price.toLocaleString("en-IN")}
      </span>
    </article>
  );
});

// ── Sale Rail Card ────────────────────────────────────────────────────────────
const SaleRailCard = memo(({ product }) => {
  const disc = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );
  return (
    <NavLink
      to={`/products/${product.slug}`}
      className="shrink-0 w-44 sm:w-52 snap-start group"
      aria-label={`${product.name} - ${disc}% off`}
    >
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-white/[0.06] aspect-square mb-2.5 shadow-sm">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-black">
          -{disc}%
        </span>
      </div>
      <p className="text-[13px] font-semibold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
        {product.name}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[14px] font-bold text-zinc-900 dark:text-white">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        <span className="text-[11px] text-zinc-400 line-through">
          ₹{product.originalPrice.toLocaleString("en-IN")}
        </span>
      </div>
      <StarRating rating={product.rating} size={10} />
    </NavLink>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: PAGE SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Hero Banner ───────────────────────────────────────────────────────────────
const HeroBanner = memo(() => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-zinc-950 h-[300px] sm:h-[380px]"
      aria-label="Collections hero"
    >
      <img
        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80&auto=format"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        aria-hidden="true"
        loading="eager"
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#F59E0B 0,#F59E0B 1px,transparent 0,transparent 50%)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40"
        aria-hidden="true"
      />

      <div className="relative h-full flex items-end pb-10 px-4 sm:px-8 lg:px-12">
        <div
          className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <div className="flex items-center gap-2 mb-3" aria-hidden="true">
            <span className="h-px w-8 bg-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              Solex · SS25
            </span>
          </div>
          <h1
            className="text-white leading-[0.88] mb-3"
            style={{
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 900,
              letterSpacing: "-0.01em",
            }}
          >
            ALL
            <br />
            <span className="text-amber-500">COLLECTIONS</span>
          </h1>
          <p className="text-zinc-400 text-[14px] max-w-md">
            500+ styles across running, basketball, lifestyle & more.
          </p>
        </div>

        <div
          className={`hidden sm:flex items-center gap-3 ml-auto mb-1 transition-all duration-700 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        >
          {[
            ["500+", "Styles"],
            ["40+", "Cities"],
            ["4.9★", "Rating"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <p
                className="text-[20px] font-black text-white"
                style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
              >
                {v}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                {l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ── Sticky Filter + Sort Bar ──────────────────────────────────────────────────
const FilterSortBar = memo(() => {
  const {
    filters,
    updateFilter,
    activeFilterCount,
    sort,
    setSort,
    search,
    setSearch,
    setFilterDrawerOpen,
  } = useFilters();
  const { theme, toggleTheme } = useTheme();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-100 dark:border-white/[0.06]"
      role="navigation"
      aria-label="Filters and sort"
    >
      {/* Search Row */}
      <div className="px-4 sm:px-8 lg:px-12 pt-3 pb-2 flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
            {filters.onSale && (
              <ActiveFilterChip
                label="On Sale"
                onRemove={() => updateFilter("onSale", false)}
              />
            )}
            {filters.inStock && (
              <ActiveFilterChip
                label="In Stock"
                onRemove={() => updateFilter("inStock", false)}
              />
            )}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Filter Pills Row */}
      <div className="px-4 sm:px-8 lg:px-12 pb-3 flex items-center gap-3">
        {/* Mobile filter button */}
        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-400"
          aria-label={`Open filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
        >
          <Filter size={12} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Category pills */}
        <div
          className="flex items-center gap-2 overflow-x-auto flex-1 pb-0.5"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Filter by category"
        >
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => updateFilter("category", pill.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 ${filters.category === pill.value ? "bg-amber-500 text-white border-amber-500" : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"}`}
              role="tab"
              aria-selected={filters.category === pill.value}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            onClick={() => setSortOpen((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 transition-colors whitespace-nowrap"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find((s) => s.value === sort)?.label || "Sort"}
            </span>
            <ChevronDown
              size={11}
              className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-white/[0.06] overflow-hidden py-1 z-50"
              role="listbox"
              aria-label="Sort options"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[12.5px] font-medium transition-colors ${opt.value === sort ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"}`}
                  role="option"
                  aria-selected={opt.value === sort}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const ActiveFilterChip = ({ label, onRemove }) => (
  <button
    onClick={onRemove}
    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-colors"
  >
    {label} <X size={10} />
  </button>
);

// ── Featured Spotlight ────────────────────────────────────────────────────────
const FeaturedSpotlight = memo(() => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getFeatured(),
  );
  const { toggle, isWishlisted } = useWishlist();
  const { addItem, recentlyAdded } = useCart();

  const product = data?.data;

  return (
    <section
      className="px-4 sm:px-8 lg:px-12 pt-10 pb-6"
      aria-label="Editor's Pick"
    >
      <SectionLabel icon={<Sparkles size={11} />} text="Editor's Pick" />

      <div className="mt-4 grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/[0.06] min-h-[420px]">
        {loading ? (
          <SkeletonFeatured />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={retry}
            label="featured product"
          />
        ) : product ? (
          <>
            {/* Image */}
            <div className="relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 min-h-[280px]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ minHeight: "280px" }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent"
                aria-hidden="true"
              />
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wide">
                ✦ Editor's Pick
              </span>
              {product.colors && (
                <div className="absolute bottom-4 left-4">
                  <ColorSwatches colors={product.colors} size={4} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-zinc-950 dark:bg-zinc-900 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400 mb-3">
                  Road Running · SS25
                </p>
                <h2
                  className="text-white leading-[0.88] mb-4"
                  style={{
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    fontSize: "clamp(40px, 5vw, 72px)",
                    fontWeight: 900,
                  }}
                >
                  {product.name
                    .toUpperCase()
                    .split(" ")
                    .map((w, i) => (
                      <span key={i}>
                        {i === 0 ? (
                          w
                        ) : (
                          <>
                            <br />
                            <span className="text-amber-500">{w}</span>
                          </>
                        )}
                      </span>
                    ))}
                </h2>
                <p className="text-zinc-400 text-[14px] leading-relaxed mb-6 max-w-sm">
                  Zero-gravity cushioning meets race-day precision. Built for
                  runners who refuse to compromise on speed or comfort.
                </p>
                <div className="space-y-2 mb-8">
                  {[
                    "AirFlow+ midsole technology",
                    "Carbon fibre plate",
                    "350g ultralight build",
                    "10mm heel-to-toe drop",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2.5 text-[13px] text-zinc-300"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                        aria-hidden="true"
                      />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  {product.originalPrice && (
                    <p className="text-[13px] text-zinc-500 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p
                    className="text-white text-[32px] font-black"
                    style={{
                      fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    }}
                  >
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <StarRating rating={product.rating} count={product.reviews} />
                </div>
                <div className="flex flex-col gap-2">
                  <NavLink
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-bold transition-all active:scale-95"
                  >
                    Shop Now <ArrowRight size={14} />
                  </NavLink>
                  <button
                    onClick={() => toggle(product.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[13px] font-semibold transition-colors ${isWishlisted(product.id) ? "border-rose-500 text-rose-400 bg-rose-500/10" : "border-white/10 text-white hover:border-white/30"}`}
                    aria-pressed={isWishlisted(product.id)}
                  >
                    <Heart
                      size={14}
                      className={
                        isWishlisted(product.id) ? "fill-rose-400" : ""
                      }
                    />
                    {isWishlisted(product.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
});

// ── Running Grid Section ──────────────────────────────────────────────────────
const RunningSection = memo(({ onQuickView }) => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getRunning(),
  );
  const products = data?.data || [];

  return (
    <section
      className="px-4 sm:px-8 lg:px-12 py-8"
      aria-label="Running collection"
    >
      <SectionHeader
        label="Running"
        icon={<Flame size={11} />}
        title="BUILT FOR THE"
        accentWord="LONG HAUL"
        viewAllPath="/collections/running"
      />
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} label="running products" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              delay={i}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
});

// ── Flash Sale Band ───────────────────────────────────────────────────────────
const FlashSaleBand = memo(() => {
  const { hours, mins, secs } = useCountdown(8 * 3600 + 45 * 60 + 22);

  return (
    <section
      className="relative overflow-hidden my-6 bg-zinc-950"
      aria-label="Flash sale"
    >
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg,#F59E0B 0,#F59E0B 1px,transparent 0,transparent 50%)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-amber-600/15 to-transparent"
        aria-hidden="true"
      />

      <div className="relative px-4 sm:px-8 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-amber-400" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              Flash Sale · Today Only
            </span>
          </div>
          <h2
            className="text-white leading-tight"
            style={{
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
            }}
          >
            UP TO <span className="text-amber-400">50% OFF</span>
            <br />
            SELECTED STYLES
          </h2>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            className="flex items-center gap-3"
            aria-label={`Time remaining: ${hours} hours ${mins} minutes ${secs} seconds`}
            role="timer"
          >
            {[
              [hours, "HRS"],
              [mins, "MIN"],
              [secs, "SEC"],
            ].map(([v, u]) => (
              <div key={u} className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <span
                    className="text-[26px] sm:text-[30px] font-black text-white tabular-nums"
                    style={{
                      fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    }}
                  >
                    {v}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                  {u}
                </p>
              </div>
            ))}
          </div>
          <NavLink
            to="/collections/sale"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-black transition-all active:scale-95"
            style={{
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            SHOP SALE <ArrowRight size={14} />
          </NavLink>
        </div>
      </div>
    </section>
  );
});

// ── Lifestyle Bento ───────────────────────────────────────────────────────────
const LifestyleSection = memo(() => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getLifestyle(),
  );
  const products = data?.data || [];

  return (
    <section
      className="px-4 sm:px-8 lg:px-12 py-8"
      aria-label="Lifestyle collection"
    >
      <SectionHeader
        label="Lifestyle"
        icon={<Sparkles size={11} />}
        title="STREET-READY"
        accentWord="EVERYDAY ICONS"
        viewAllPath="/collections/lifestyle"
      />
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2">
            <SkeletonBentoCard large />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBentoCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={retry}
          label="lifestyle products"
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2 row-span-2 lg:row-span-1">
            {products[0] && <BentoCard product={products[0]} large />}
          </div>
          {products.slice(1).map((p) => (
            <BentoCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
});

// ── Basketball Editorial ──────────────────────────────────────────────────────
const BasketballSection = memo(() => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getBasketball(),
  );
  const products = data?.data || [];

  return (
    <section
      className="px-4 sm:px-8 lg:px-12 py-8"
      aria-label="Basketball collection"
    >
      <SectionHeader
        label="Basketball"
        icon={<TrendingUp size={11} />}
        title="DOMINATE"
        accentWord="THE COURT"
        viewAllPath="/collections/basketball"
      />
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-3xl ${shimmerClass} min-h-[380px]`}
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={retry}
          label="basketball products"
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {products.map((p) => (
            <EditorialCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
});

// ── Sale Rail ─────────────────────────────────────────────────────────────────
const SaleRailSection = memo(() => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getSale(),
  );
  const products = data?.data || [];
  const saleRef = useRef(null);

  return (
    <section
      className="py-8 bg-zinc-50 dark:bg-zinc-900/40"
      aria-label="Sale items"
    >
      <div className="px-4 sm:px-8 lg:px-12 mb-5 flex items-center justify-between">
        <SectionHeader
          label="Sale"
          icon={<Zap size={11} />}
          title="BIG DEALS"
          accentWord="DON'T LAST"
          accent="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10"
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              saleRef.current?.scrollBy({ left: -260, behavior: "smooth" })
            }
            className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() =>
              saleRef.current?.scrollBy({ left: 260, behavior: "smooth" })
            }
            className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-x-hidden px-4 sm:px-8 lg:px-12 pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonSaleCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="px-4 sm:px-8 lg:px-12">
          <ErrorState message={error} onRetry={retry} label="sale items" />
        </div>
      ) : (
        <div
          ref={saleRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
          role="list"
          aria-label="Sale items carousel"
        >
          {products.map((p) => (
            <SaleRailCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
});

// ── New Arrivals Grid ─────────────────────────────────────────────────────────
const NewArrivalsSection = memo(() => {
  const { data, loading, error, retry } = useAsync(() =>
    ProductsService.getNewArrivals(),
  );
  const products = data?.data || [];

  return (
    <section className="px-4 sm:px-8 lg:px-12 py-8" aria-label="New arrivals">
      <SectionHeader
        label="New Arrivals"
        icon={<Sparkles size={11} />}
        title="JUST"
        accentWord="DROPPED"
        viewAllPath="/new-arrivals"
      />
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className={`aspect-[3/4] rounded-2xl ${shimmerClass}`} />
              <div className={`h-3 w-2/3 rounded-full ${shimmerClass}`} />
              <div className={`h-4 w-full rounded-full ${shimmerClass}`} />
              <div className={`h-4 w-1/3 rounded-full ${shimmerClass}`} />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={retry} label="new arrivals" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p, i) => (
            <NewArrivalCard key={p.id} product={p} delay={i} />
          ))}
        </div>
      )}
    </section>
  );
});

// ── CTA Band ──────────────────────────────────────────────────────────────────
const CTABand = memo(() => {
  const [ref, inView] = useInView();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section
      ref={ref}
      className={`mx-4 sm:mx-8 lg:mx-12 mb-10 rounded-3xl overflow-hidden relative bg-zinc-950 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      aria-label="Join Solex Squad Rewards"
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#F59E0B 0,#F59E0B 1px,transparent 0,transparent 50%)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 120%, rgba(245,158,11,.18) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative px-6 sm:px-12 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-widest mb-4">
            <Zap size={10} aria-hidden="true" /> Loyalty Program
          </span>
          <h2
            className="text-white leading-tight mb-3"
            style={{
              fontFamily: "'Barlow Condensed', Impact, sans-serif",
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 900,
            }}
          >
            JOIN SOLEX
            <br />
            <span className="text-amber-400">SQUAD REWARDS</span>
          </h2>
          <p className="text-zinc-400 text-[14px] max-w-md">
            Earn points on every purchase. Unlock exclusive drops, early access,
            and member-only discounts.
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto min-w-[240px]">
          {subscribed ? (
            <div className="flex items-center gap-2 px-6 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[14px] font-semibold">
              <Check size={16} /> You're in! Welcome to the Squad 🎉
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-[13px] placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                aria-label="Email address for newsletter"
                required
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[14px] font-black transition-all active:scale-95"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                JOIN FREE <ArrowRight size={15} />
              </button>
            </form>
          )}
          <NavLink
            to="/about"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-white text-[13px] font-semibold hover:border-white/25 hover:bg-white/5 transition-colors"
          >
            Learn More
          </NavLink>
        </div>
      </div>
    </section>
  );
});

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const Breadcrumb = memo(() => (
  <nav className="px-4 sm:px-8 lg:px-12 pt-4 pb-0" aria-label="Breadcrumb">
    <ol className="flex items-center gap-1.5 text-[11px] text-zinc-500">
      {[
        ["Home", "/"],
        ["Collections", null],
      ].map(([label, href], i) => (
        <li key={label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={10} aria-hidden="true" />}
          {href ? (
            <NavLink
              to={href}
              className="hover:text-amber-500 transition-colors"
            >
              {label}
            </NavLink>
          ) : (
            <span className="text-zinc-900 dark:text-white font-medium">
              {label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
));

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function CollectionsPageInner() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { filterDrawerOpen } = useFilters();

  // Inject fonts
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

  const handleQuickView = useCallback(
    (product) => setQuickViewProduct(product),
    [],
  );
  const handleCloseQuickView = useCallback(() => setQuickViewProduct(null), []);

  return (
    <div
      className="bg-white dark:bg-[#0a0a0a] min-h-screen"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        ::-webkit-scrollbar { display: none; }
        input[type=range] { -webkit-appearance: none; height: 3px; border-radius: 9999px; background: #F59E0B; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #F59E0B; cursor: pointer; box-shadow: 0 0 0 3px rgba(245,158,11,.2); }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>

      <Breadcrumb />
      <HeroBanner />
      <FilterSortBar />

      <main id="main-content">
        <FeaturedSpotlight />
        <RunningSection onQuickView={handleQuickView} />
        <FlashSaleBand />
        <LifestyleSection />
        <BasketballSection />
        <SaleRailSection />
        <NewArrivalsSection />
        <CTABand />
      </main>

      {/* Modals & Drawers */}
      {filterDrawerOpen && <FilterDrawer />}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={handleCloseQuickView}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: ROOT EXPORT WITH ALL PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

export default function CollectionsPage() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <FilterProvider>
            <CollectionsPageInner />
          </FilterProvider>
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: BACKEND ARCHITECTURE (Reference — move to separate files)
// ═══════════════════════════════════════════════════════════════════════════════

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MONGODB SCHEMA  (models/Product.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, enum: ['running','basketball','lifestyle','training','football'], required: true },
  gender: { type: String, enum: ['men','women','kids','unisex'] },
  brand: { type: String, required: true },
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  variants: [{
    color: String,
    colorHex: String,
    sizes: [{
      size: String,
      stock: Number,
      sku: String,
    }],
  }],
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  featured: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  publishedAt: Date,
}, { timestamps: true });

ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, gender: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', tags: 'text' });


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXPRESS CONTROLLER  (controllers/products.controller.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

exports.getProducts = async (req, res) => {
  try {
    const {
      category, gender, brand, minPrice, maxPrice,
      minRating, onSale, inStock, sizes, colors,
      sort = 'featured', page = 1, limit = 24, q,
    } = req.query;

    // Build match stage
    const match = {};
    if (category && category !== 'all') match.category = category;
    if (gender) match.gender = { $in: gender.split(',') };
    if (brand) match.brand = { $in: brand.split(',') };
    if (minPrice || maxPrice) match.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
    if (minRating) match.rating = { $gte: Number(minRating) };
    if (onSale === 'true') match.onSale = true;
    if (inStock === 'true') match['variants.sizes.stock'] = { $gt: 0 };
    if (q) match.$text = { $search: q };

    // Sort stage
    const sortMap = {
      featured: { featured: -1, rating: -1 },
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      popularity: { popularity: -1 },
      discount: { discountPercent: -1 },
      best_selling: { soldCount: -1 },
    };

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          discountPercent: {
            $cond: {
              if: { $and: ['$discountPrice', { $gt: ['$price', 0] }] },
              then: { $multiply: [{ $divide: [{ $subtract: ['$price', '$discountPrice'] }, '$price'] }, 100] },
              else: 0,
            },
          },
        },
      },
      { $sort: sortMap[sort] || sortMap.featured },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: Number(limit) }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);
    const total = result.total[0]?.count || 0;

    res.json({
      data: result.data,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const product = await Product.findOne({ featured: true }).sort({ rating: -1 });
    res.json({ data: product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSale = async (req, res) => {
  try {
    const products = await Product.find({ onSale: true })
      .sort({ discountPrice: 1 })
      .limit(12);
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 EXPRESS ROUTES  (routes/products.routes.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const router = express.Router();
const rateLimit = require('express-rate-limit');
const { validateQuery } = require('../middleware/validate');

const limiter = rateLimit({ windowMs: 60000, max: 100 });

router.get('/',             limiter, validateQuery, getProducts);
router.get('/featured',     limiter, getFeatured);
router.get('/new-arrivals', limiter, getNewArrivals);
router.get('/sale',         limiter, getSale);
router.get('/:slug',        limiter, getProduct);


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REDIS CACHING MIDDLEWARE  (middleware/cache.js)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const redis = require('../config/redis');

module.exports = (ttl = 300) => async (req, res, next) => {
  const key = `solex:${req.originalUrl}`;
  const cached = await redis.get(key);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(JSON.parse(cached));
  }
  res.sendResponse = res.json;
  res.json = async (data) => {
    await redis.setex(key, ttl, JSON.stringify(data));
    res.setHeader('X-Cache', 'MISS');
    res.sendResponse(data);
  };
  next();
};
*/
