/**
 * SolexSidebar.jsx — Solex | Shop Filter Sidebar v2
 *
 * WHAT'S NEW IN v2
 * ────────────────
 * ✦ Completely redesigned visual style — refined, editorial, premium feel
 * ✦ Animated filter sections with staggered entry on mount
 * ✦ Multi-select active filter chips with individual remove & "Clear All"
 * ✦ Sport filters with icon badges per category
 * ✦ Gender pill selectors with smooth active state
 * ✦ UK Size grid — styled like Nike/Adidas size selector
 * ✦ Color swatches with tooltip labels on hover
 * ✦ Price: 4 preset range cards + live custom range slider with thumb label
 * ✦ Featured Brands section with styled brand cards + count pill
 * ✦ Recently Viewed — product cards with image placeholder, name, price
 * ✦ Promo banner — animated gradient with countdown feel
 * ✦ Desktop: sticky left panel (top-offset for fixed navbar)
 * ✦ Mobile: full-height slide-in drawer from left with backdrop
 * ✦ Body scroll lock when mobile drawer open
 * ✦ Full light + dark mode matching Solex navbar (Barlow Condensed + DM Sans)
 *
 * EXPORTS
 * ───────
 * default  → SolexSidebar
 * named    → SidebarToggleBtn, DEFAULT_FILTERS
 *
 * USAGE
 * ─────
 * import SolexSidebar, { SidebarToggleBtn, DEFAULT_FILTERS } from "./SolexSidebar";
 *
 * const [open, setOpen]       = useState(false);
 * const [filters, setFilters] = useState(DEFAULT_FILTERS);
 *
 * <SolexSidebar
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   recentlyViewed={[{ id, name, price, image, to }]}
 * />
 * <SidebarToggleBtn onClick={() => setOpen(p=>!p)} activeCount={n} />
 */

import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Tag,
  Zap,
  RotateCcw,
  Flame,
  Wind,
  Dumbbell,
  Heart,
  Footprints,
  CircleDot,
  Trophy,
  Clock,
  ArrowRight,
} from "lucide-react";

// ─── Font injection ───────────────────────────────────────────────────────────
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SPORTS = [
  { label: "Running", icon: <Wind size={13} />, count: 48 },
  { label: "Basketball", icon: <CircleDot size={13} />, count: 32 },
  { label: "Training", icon: <Dumbbell size={13} />, count: 27 },
  { label: "Lifestyle", icon: <Heart size={13} />, count: 54 },
  { label: "Football", icon: <Flame size={13} />, count: 19 },
  { label: "Tennis", icon: <Trophy size={13} />, count: 12 },
];

const GENDERS = ["Men", "Women", "Kids", "Unisex"];

const SIZES = [
  "5",
  "6",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "12",
];

const COLORS = [
  { label: "Jet Black", value: "black", hex: "#18181B" },
  { label: "Pure White", value: "white", hex: "#F4F4F5", border: true },
  { label: "Crimson", value: "red", hex: "#DC2626" },
  { label: "Ocean Blue", value: "blue", hex: "#2563EB" },
  { label: "Forest", value: "green", hex: "#16A34A" },
  { label: "Amber", value: "amber", hex: "#D97706" },
  { label: "Coral", value: "coral", hex: "#F97316" },
  { label: "Rose", value: "pink", hex: "#DB2777" },
  { label: "Storm Grey", value: "grey", hex: "#6B7280" },
  { label: "Mocha", value: "brown", hex: "#78350F" },
  { label: "Navy", value: "navy", hex: "#1E3A5F" },
  { label: "Sage", value: "sage", hex: "#6B7C5E" },
];

const PRICE_PRESETS = [
  { label: "Under ₹999", min: 0, max: 999, tag: "Budget" },
  { label: "₹999 – ₹2,999", min: 999, max: 2999, tag: "Value" },
  { label: "₹2,999 – ₹5,999", min: 2999, max: 5999, tag: "Premium" },
  { label: "Above ₹5,999", min: 5999, max: 20000, tag: "Luxury" },
];

const BRANDS = [
  {
    name: "SolexAir",
    tagline: "Lightweight series",
    count: 24,
    accent: "#F59E0B",
  },
  {
    name: "CloudRun",
    tagline: "Performance running",
    count: 18,
    accent: "#3B82F6",
  },
  {
    name: "StreetEdge",
    tagline: "Urban lifestyle",
    count: 15,
    accent: "#EF4444",
  },
  { name: "HyperBoost", tagline: "Pro training", count: 11, accent: "#10B981" },
  { name: "TrailX", tagline: "Off-road series", count: 9, accent: "#8B5CF6" },
];

const RATINGS = [5, 4, 3];

export const DEFAULT_FILTERS = {
  sports: [],
  genders: [],
  sizes: [],
  colors: [],
  brands: [],
  rating: null,
  priceMin: 0,
  priceMax: 10000,
};

// ─── Default recently viewed (demo) ──────────────────────────────────────────
const DEMO_RECENT = [
  {
    id: 1,
    name: "SolexAir Pro X",
    price: 4999,
    to: "/products/solexair-pro",
    image: null,
  },
  {
    id: 2,
    name: "CloudRun Elite",
    price: 3499,
    to: "/products/cloudrun-x",
    image: null,
  },
  {
    id: 3,
    name: "StreetEdge 2.0",
    price: 2999,
    to: "/products/streetedge-2",
    image: null,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SolexSidebar({
  open = false,
  onClose = () => {},
  filters = DEFAULT_FILTERS,
  onFiltersChange = () => {},
  recentlyViewed = DEMO_RECENT,
}) {
  const [expanded, setExpanded] = useState({
    sport: true,
    gender: true,
    size: false,
    color: false,
    price: true,
    brand: true,
    rating: false,
    recent: true,
  });
  const [hoveredColor, setHoveredColor] = useState(null);
  const [customPrice, setCustomPrice] = useState(false);

  // Inject fonts
  useEffect(() => {
    if (!document.querySelector("#solex-sb-fonts")) {
      const l = Object.assign(document.createElement("link"), {
        id: "solex-sb-fonts",
        rel: "stylesheet",
        href: FONT_URL,
      });
      document.head.appendChild(l);
    }
  }, []);

  // Lock body scroll on mobile drawer open
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const toggleArr = useCallback(
    (key, value) => {
      const arr = filters[key] ?? [];
      onFiltersChange({
        ...filters,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      });
    },
    [filters, onFiltersChange],
  );

  const setField = useCallback(
    (key, val) => onFiltersChange({ ...filters, [key]: val }),
    [filters, onFiltersChange],
  );

  const clearAll = () => onFiltersChange({ ...DEFAULT_FILTERS });

  // Active filter count
  const activeCount =
    filters.sports.length +
    filters.genders.length +
    filters.sizes.length +
    filters.colors.length +
    filters.brands.length +
    (filters.rating ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 10000 ? 1 : 0);

  // All active chips
  const chips = [
    ...filters.sports.map((v) => ({ key: "sports", value: v })),
    ...filters.genders.map((v) => ({ key: "genders", value: v })),
    ...filters.sizes.map((v) => ({ key: "sizes", value: `UK ${v}`, raw: v })),
    ...filters.colors.map((v) => ({
      key: "colors",
      value: COLORS.find((c) => c.value === v)?.label ?? v,
      raw: v,
    })),
    ...filters.brands.map((v) => ({ key: "brands", value: v })),
    ...(filters.rating
      ? [{ key: "rating", value: `${filters.rating}★ & up` }]
      : []),
    ...(filters.priceMin > 0 || filters.priceMax < 10000
      ? [
          {
            key: "price",
            value: `₹${filters.priceMin.toLocaleString("en-IN")} – ₹${filters.priceMax.toLocaleString("en-IN")}`,
          },
        ]
      : []),
  ];

  const removeChip = (chip) => {
    if (chip.key === "rating") return setField("rating", null);
    if (chip.key === "price")
      return onFiltersChange({ ...filters, priceMin: 0, priceMax: 10000 });
    toggleArr(chip.key, chip.raw ?? chip.value);
  };

  // ── Inner content shared between desktop panel & mobile drawer
  const content = (
    <div
      className="flex flex-col h-full"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-white/[0.07] shrink-0 bg-white dark:bg-[#0d0d0d]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={14} className="text-white" />
          </div>
          <span
            className="text-[16px] font-black tracking-[0.1em] uppercase text-zinc-900 dark:text-white"
            style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
          >
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
            >
              <RotateCcw size={11} strokeWidth={2.5} />
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors duration-150"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ── Active chips ────────────────────────────────────────────── */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-zinc-100 dark:border-white/[0.07] bg-zinc-50/70 dark:bg-zinc-900/50 shrink-0">
          {chips.map((chip, i) => (
            <button
              key={`${chip.key}-${chip.value}-${i}`}
              onClick={() => removeChip(chip)}
              className="group flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:border-red-300 hover:text-red-500 dark:hover:border-red-500/50 dark:hover:text-red-400 transition-all duration-150 shadow-sm"
            >
              {chip.value}
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-zinc-100 dark:bg-zinc-700 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                <X size={8} strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-[#0d0d0d]">
        {/* SPORT */}
        <Section
          title="Sport"
          sectionKey="sport"
          expanded={expanded}
          onToggle={toggle}
          count={filters.sports.length}
        >
          <div className="space-y-1">
            {SPORTS.map(({ label, icon, count }) => {
              const active = filters.sports.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleArr("sports", label)}
                  className={[
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group",
                    active
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-transparent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={[
                        "flex items-center justify-center w-6 h-6 rounded-lg transition-colors",
                        active
                          ? "bg-amber-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700",
                      ].join(" ")}
                    >
                      {icon}
                    </span>
                    {label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                      {count}
                    </span>
                    <span
                      className={[
                        "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
                        active
                          ? "bg-amber-500 border-amber-500"
                          : "border-zinc-300 dark:border-zinc-600",
                      ].join(" ")}
                    >
                      {active && (
                        <span className="w-2 h-1.5 rounded-sm bg-white" />
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* GENDER */}
        <Section
          title="Gender"
          sectionKey="gender"
          expanded={expanded}
          onToggle={toggle}
          count={filters.genders.length}
        >
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((g) => {
              const active = filters.genders.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleArr("genders", g)}
                  className={[
                    "py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 border",
                    active
                      ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-sm"
                      : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                  ].join(" ")}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </Section>

        {/* SIZE */}
        <Section
          title="Size (UK)"
          sectionKey="size"
          expanded={expanded}
          onToggle={toggle}
          count={filters.sizes.length}
        >
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => {
              const active = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleArr("sizes", s)}
                  className={[
                    "w-[calc(25%-6px)] min-w-[44px] h-10 rounded-xl text-[12.5px] font-bold transition-all duration-150 border",
                    active
                      ? "bg-zinc-950 dark:bg-amber-500 text-white border-zinc-950 dark:border-amber-500 shadow-sm scale-105"
                      : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600 mt-2.5">
            * UK sizes shown.{" "}
            <NavLink
              to="/size-guide"
              className="text-amber-500 hover:underline"
            >
              Size guide →
            </NavLink>
          </p>
        </Section>

        {/* COLOR */}
        <Section
          title="Color"
          sectionKey="color"
          expanded={expanded}
          onToggle={toggle}
          count={filters.colors.length}
        >
          <div className="flex flex-wrap gap-2.5 mb-2">
            {COLORS.map(({ label, value, hex, border }) => {
              const active = filters.colors.includes(value);
              return (
                <div key={value} className="relative">
                  <button
                    title={label}
                    onClick={() => toggleArr("colors", value)}
                    onMouseEnter={() => setHoveredColor(value)}
                    onMouseLeave={() => setHoveredColor(null)}
                    className={[
                      "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                      border
                        ? "border-2 border-zinc-200 dark:border-zinc-600"
                        : "",
                      active
                        ? "ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-[#0d0d0d] scale-115"
                        : "hover:scale-110",
                    ].join(" ")}
                    style={{ backgroundColor: hex }}
                  >
                    {active && (
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${value === "white" ? "bg-zinc-800" : "bg-white"} shadow`}
                      />
                    )}
                  </button>
                  {/* Tooltip */}
                  {hoveredColor === value && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] font-medium rounded-md whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      {label}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filters.colors.length > 0 && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-1">
              {filters.colors.length} color
              {filters.colors.length > 1 ? "s" : ""} selected
            </p>
          )}
        </Section>

        {/* PRICE */}
        <Section
          title="Price Range"
          sectionKey="price"
          expanded={expanded}
          onToggle={toggle}
          count={filters.priceMin > 0 || filters.priceMax < 10000 ? 1 : 0}
        >
          <div className="space-y-2 mb-4">
            {PRICE_PRESETS.map(({ label, min, max, tag }) => {
              const active =
                filters.priceMin === min && filters.priceMax === max;
              return (
                <button
                  key={label}
                  onClick={() =>
                    active
                      ? onFiltersChange({
                          ...filters,
                          priceMin: 0,
                          priceMax: 10000,
                        })
                      : onFiltersChange({
                          ...filters,
                          priceMin: min,
                          priceMax: max,
                        })
                  }
                  className={[
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 border",
                    active
                      ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400"
                      : "border-zinc-150 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                  ].join(" ")}
                >
                  <span>{label}</span>
                  <span
                    className={[
                      "text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                      active
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500",
                    ].join(" ")}
                  >
                    {tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom range toggle */}
          <button
            onClick={() => setCustomPrice((p) => !p)}
            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-500 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors mb-3"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${customPrice ? "rotate-180" : ""}`}
            />
            Custom range
          </button>

          {customPrice && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px] font-semibold">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  ₹{filters.priceMin.toLocaleString("en-IN")}
                </span>
                <span className="text-zinc-400">–</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  ₹{filters.priceMax.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={500}
                value={filters.priceMax}
                onChange={(e) => setField("priceMax", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="range"
                min={0}
                max={filters.priceMax}
                step={500}
                value={filters.priceMin}
                onChange={(e) => setField("priceMin", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}
        </Section>

        {/* BRANDS */}
        <Section
          title="Featured Brands"
          sectionKey="brand"
          expanded={expanded}
          onToggle={toggle}
          count={filters.brands.length}
        >
          <div className="space-y-2">
            {BRANDS.map(({ name, tagline, count, accent }) => {
              const active = filters.brands.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleArr("brands", name)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 border text-left",
                    active
                      ? "bg-zinc-950 dark:bg-zinc-800 border-zinc-800 dark:border-zinc-600"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                  ].join(" ")}
                >
                  {/* Brand logo circle */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: active ? accent : "#374151" }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-semibold truncate ${active ? "text-white" : "text-zinc-800 dark:text-zinc-200"}`}
                    >
                      {name}
                    </p>
                    <p
                      className={`text-[11px] truncate ${active ? "text-zinc-400" : "text-zinc-400 dark:text-zinc-600"}`}
                    >
                      {tagline}
                    </p>
                  </div>
                  <span
                    className={[
                      "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      active
                        ? "text-white/80 bg-white/10"
                        : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-500",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* RATING */}
        <Section
          title="Min. Rating"
          sectionKey="rating"
          expanded={expanded}
          onToggle={toggle}
          count={filters.rating ? 1 : 0}
        >
          <div className="space-y-1.5">
            {RATINGS.map((r) => {
              const active = filters.rating === r;
              return (
                <button
                  key={r}
                  onClick={() => setField("rating", active ? null : r)}
                  className={[
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 border",
                    active
                      ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < r
                              ? "fill-amber-400 text-amber-400"
                              : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                          }
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[12.5px] font-medium ${active ? "text-amber-700 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}
                    >
                      & above
                    </span>
                  </div>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <Section
            title="Recently Viewed"
            sectionKey="recent"
            expanded={expanded}
            onToggle={toggle}
          >
            <div className="space-y-2.5">
              {recentlyViewed.slice(0, 4).map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to ?? "#"}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  {/* Image / placeholder */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Footprints
                        size={18}
                        className="text-zinc-400 dark:text-zinc-600"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[12px] font-bold text-zinc-900 dark:text-white mt-0.5">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors shrink-0"
                  />
                </NavLink>
              ))}
            </div>
          </Section>
        )}

        {/* PROMO BANNER */}
        <div className="mx-3 mb-4 mt-1">
          <div
            className="relative rounded-2xl overflow-hidden p-4"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 50%, #0a0a0a 100%)",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
              style={{
                background: "#F59E0B",
                transform: "translate(20%,-20%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-xl opacity-20 pointer-events-none"
              style={{
                background: "#EF4444",
                transform: "translate(-20%,20%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <Zap size={9} className="text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                    Flash Sale
                  </span>
                </div>
              </div>

              <p
                className="text-[26px] font-black text-white leading-none mb-0.5"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                UP TO 50% OFF
              </p>
              <p className="text-[11.5px] text-zinc-400 mb-3 leading-relaxed">
                Selected styles. Limited time.
                <br />
                New deals every 24 hours.
              </p>

              <NavLink
                to="/collections/sale"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[12.5px] font-bold transition-all duration-200 hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <Tag size={13} />
                Shop the Sale
                <ArrowRight size={12} />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sticky panel ────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[268px] shrink-0 self-start sticky top-[100px] max-h-[calc(100vh-112px)] rounded-2xl border border-zinc-100 dark:border-white/[0.06] overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
        {content}
      </aside>

      {/* ── Mobile drawer backdrop ──────────────────────────────────────── */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Mobile drawer panel ─────────────────────────────────────────── */}
      <aside
        className={[
          "fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[320px] lg:hidden",
          "shadow-[6px_0_48px_rgba(0,0,0,0.2)] dark:shadow-[6px_0_48px_rgba(0,0,0,0.8)]",
          "transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {content}
      </aside>
    </>
  );
}

// ─── Sidebar Toggle Button ────────────────────────────────────────────────────
export function SidebarToggleBtn({
  open = false,
  onClick = () => {},
  activeCount = 0,
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={[
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-200",
        activeCount > 0
          ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white hover:bg-amber-500 dark:hover:bg-amber-400 hover:border-amber-500 dark:hover:border-amber-400"
          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      <SlidersHorizontal size={15} />
      Filters
      {activeCount > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-black leading-none">
          {activeCount}
        </span>
      )}
    </button>
  );
}

// ─── Section accordion wrapper ────────────────────────────────────────────────
function Section({
  title,
  sectionKey,
  expanded,
  onToggle,
  children,
  count = 0,
}) {
  const isOpen = expanded[sectionKey];
  return (
    <div className="border-b border-zinc-100 dark:border-white/[0.06]">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[12px] font-black uppercase tracking-[0.1em] text-zinc-800 dark:text-zinc-100"
            style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
          >
            {title}
          </span>
          {count > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={[
            "text-zinc-400 transition-transform duration-250",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
