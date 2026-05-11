/**
 * pages/admin/AdminDashboard.jsx
 * Solex Admin — Dashboard Homepage
 *
 * Includes:
 * - Stat cards with trend indicators
 * - Sales line chart (pure CSS/SVG, no chart lib needed)
 * - Orders bar chart (pure SVG)
 * - Category donut chart (SVG)
 * - Recent orders table with status badges
 * - Top selling products
 * - Loading skeleton state
 * - Full AdminNavbar + AdminSidebar + AdminFooter layout
 */

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  DollarSign, Eye, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  RefreshCw, Download, Filter, ChevronRight, Star, Circle,
} from "lucide-react";


// ─── Dummy Data ───────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    label:    "Total Revenue",
    value:    "₹24,81,340",
    change:   "+18.2%",
    positive: true,
    icon:     <DollarSign size={18} />,
    color:    "from-amber-400 to-orange-500",
    bg:       "bg-amber-50",
    text:     "text-amber-600",
    sub:      "vs last month",
  },
  {
    label:    "Total Orders",
    value:    "3,842",
    change:   "+12.5%",
    positive: true,
    icon:     <ShoppingCart size={18} />,
    color:    "from-blue-400 to-indigo-500",
    bg:       "bg-blue-50",
    text:     "text-blue-600",
    sub:      "vs last month",
  },
  {
    label:    "Total Users",
    value:    "18,294",
    change:   "+8.1%",
    positive: true,
    icon:     <Users size={18} />,
    color:    "from-emerald-400 to-teal-500",
    bg:       "bg-emerald-50",
    text:     "text-emerald-600",
    sub:      "new registrations",
  },
  {
    label:    "Products",
    value:    "512",
    change:   "-2.4%",
    positive: false,
    icon:     <Package size={18} />,
    color:    "from-violet-400 to-purple-500",
    bg:       "bg-violet-50",
    text:     "text-violet-600",
    sub:      "active listings",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SALES_DATA = [42, 58, 51, 73, 68, 91, 84, 102, 95, 118, 109, 134];

const ORDERS_DATA = [
  { month: "Jul", count: 284 },
  { month: "Aug", count: 341 },
  { month: "Sep", count: 298 },
  { month: "Oct", count: 412 },
  { month: "Nov", count: 389 },
  { month: "Dec", count: 501 },
];

const ORDER_STATUS_DATA = [
  { label: "Delivered",  value: 58, color: "#10B981" },
  { label: "Processing", value: 22, color: "#F59E0B" },
  { label: "Shipped",    value: 13, color: "#3B82F6" },
  { label: "Cancelled",  value: 7,  color: "#EF4444" },
];

const RECENT_ORDERS = [
  { id: "ORD-2841", user: "Arjun Mehta",   product: "SolexAir Pro",  status: "Delivered",  amount: "₹8,999",  date: "Dec 18, 2025", avatar: "AM" },
  { id: "ORD-2840", user: "Priya Sharma",  product: "CloudRun X",    status: "Processing", amount: "₹6,499",  date: "Dec 18, 2025", avatar: "PS" },
  { id: "ORD-2839", user: "Rohan Das",     product: "StreetEdge 2",  status: "Shipped",    amount: "₹4,999",  date: "Dec 17, 2025", avatar: "RD" },
  { id: "ORD-2838", user: "Meera Nair",    product: "HyperBoost",    status: "Delivered",  amount: "₹9,999",  date: "Dec 17, 2025", avatar: "MN" },
  { id: "ORD-2837", user: "Vikram Patel",  product: "TrailX Hiker",  status: "Cancelled",  amount: "₹5,999",  date: "Dec 16, 2025", avatar: "VP" },
  { id: "ORD-2836", user: "Sneha Iyer",    product: "Classic Low",   status: "Delivered",  amount: "₹2,999",  date: "Dec 16, 2025", avatar: "SI" },
  { id: "ORD-2835", user: "Karan Singh",   product: "Velocity Knit", status: "Shipped",    amount: "₹3,999",  date: "Dec 15, 2025", avatar: "KS" },
];

const TOP_PRODUCTS = [
  { rank: 1, name: "SolexAir Pro",   category: "Running",    sold: 1243, revenue: "₹11.2L", rating: 4.9, trend: "up",   img: "SA" },
  { rank: 2, name: "CloudRun X",     category: "Running",    sold: 876,  revenue: "₹5.7L",  rating: 4.8, trend: "up",   img: "CR" },
  { rank: 3, name: "StreetEdge 2",   category: "Lifestyle",  sold: 654,  revenue: "₹3.3L",  rating: 4.7, trend: "down", img: "SE" },
  { rank: 4, name: "HyperBoost",     category: "Basketball", sold: 312,  revenue: "₹3.1L",  rating: 5.0, trend: "up",   img: "HB" },
  { rank: 5, name: "TrailX Hiker",   category: "Training",   sold: 287,  revenue: "₹1.7L",  rating: 4.6, trend: "up",   img: "TH" },
];

const STATUS_CONFIG = {
  Delivered:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Processing: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  Shipped:    { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  Cancelled:  { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
};

const AVATAR_COLORS = [
  "from-violet-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-cyan-500",
  "from-fuchsia-400 to-purple-500",
  "from-lime-400 to-green-500",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const size = 140, cx = 70, cy = 70, r = 52, strokeW = 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const dasharray = (d.value / 100) * circ;
    const seg = { ...d, dasharray, dashoffset: -offset * circ / 100, offset };
    offset += d.value;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {segments.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dasharray} ${circ - s.dasharray}`}
          strokeDashoffset={s.dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={r - strokeW / 2 - 4} fill="white" />
    </svg>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data, months }) {
  const W = 560, H = 140, pad = { t: 10, b: 24, l: 8, r: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...data) * 1.1;
  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * innerW,
    y: pad.t + innerH - (v / max) * innerH,
  }));
  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `C ${pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2} ${pts[i - 1].y}, ${p.x - (pts[i].x - pts[i - 1].x) / 2} ${p.y}, ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H - pad.b} L ${pts[0].x} ${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * (1 - f)} y2={pad.t + innerH * (1 - f)}
          stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#F59E0B" stroke="white" strokeWidth="2" />
      ))}
      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="DM Sans, sans-serif">
          {months[i]}
        </text>
      ))}
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
          <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
            {d.count}
          </span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-300 transition-all duration-500 hover:from-orange-500 hover:to-amber-400 cursor-pointer"
            style={{ height: `${(d.count / max) * 100}%` }}
          />
          <span className="text-[10px] text-slate-400 font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("solex-admin-sidebar-collapsed") === "true"
  );
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("month");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const sidebarW = sidebarCollapsed ? 60 : 220;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes admin-fade-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .afu { animation: admin-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .afu-1 { animation-delay: 0.05s }
        .afu-2 { animation-delay: 0.10s }
        .afu-3 { animation-delay: 0.15s }
        .afu-4 { animation-delay: 0.20s }
        .afu-5 { animation-delay: 0.25s }
        .afu-6 { animation-delay: 0.30s }
      `}</style>

      {/* Right side — shifts based on sidebar */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarW : 0 }}
      >

        {/* Page content */}
        <main className="flex-1 pt-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="afu flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-[22px] font-black text-slate-900"
                  style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", letterSpacing: "0.02em" }}>
                  DASHBOARD
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5">Welcome back, Admin. Here's what's happening.</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Period selector */}
                <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                  {["week", "month", "year"].map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={[
                        "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors capitalize",
                        period === p ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                  <Download size={13} />Export
                </button>
              </div>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
                : STAT_CARDS.map((card, i) => (
                  <div
                    key={card.label}
                    className={`afu afu-${i + 1} bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 group cursor-default`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.text} transition-transform duration-200 group-hover:scale-110`}>
                        {card.icon}
                      </div>
                      <span className={`flex items-center gap-0.5 text-[11.5px] font-bold px-2 py-0.5 rounded-full ${
                        card.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>
                        {card.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {card.change}
                      </span>
                    </div>
                    <p className="text-[22px] font-black text-slate-900 leading-tight"
                      style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}>
                      {card.value}
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">{card.label}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                ))
              }
            </div>

            {/* ── Charts Row ──────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Sales Line Chart — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm afu afu-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">Sales Overview</h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">Revenue trend across all months</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <TrendingUp size={11} />+18.2% YoY
                    </span>
                  </div>
                </div>
                {loading
                  ? <Skeleton className="h-40" />
                  : <LineChart data={SALES_DATA} months={MONTHS} />
                }
              </div>

              {/* Donut chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm afu afu-6">
                <div className="mb-4">
                  <h3 className="text-[14px] font-bold text-slate-900">Order Status</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Distribution this month</p>
                </div>
                {loading ? (
                  <Skeleton className="h-40" />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <DonutChart data={ORDER_STATUS_DATA} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[20px] font-black text-slate-900"
                          style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}>
                          3,842
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Total</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                      {ORDER_STATUS_DATA.map(d => (
                        <div key={d.label} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-[11.5px] text-slate-600 font-medium">{d.label}</span>
                          <span className="ml-auto text-[11.5px] font-bold text-slate-900">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Orders Bar Chart + Top Products ─────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Bar chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm afu afu-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">Orders by Month</h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">Last 6 months</p>
                  </div>
                </div>
                {loading ? <Skeleton className="h-36" /> : <BarChart data={ORDERS_DATA} />}
              </div>

              {/* Top products */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm afu afu-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">Top Selling Products</h3>
                    <p className="text-[12px] text-slate-400 mt-0.5">By units sold this month</p>
                  </div>
                  <a href="/admin/products" className="text-[12px] text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-1">
                    View all <ChevronRight size={13} />
                  </a>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {TOP_PRODUCTS.map((p, i) => (
                      <div key={p.rank} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        {/* Rank */}
                        <span className="w-5 text-[11px] font-bold text-slate-400 shrink-0 text-center">{p.rank}</span>
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm`}>
                          {p.img}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.category}</p>
                        </div>
                        {/* Stars */}
                        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[11.5px] font-semibold text-slate-700">{p.rating}</span>
                        </div>
                        {/* Sold */}
                        <div className="hidden md:block text-right shrink-0">
                          <p className="text-[13px] font-bold text-slate-900">{p.sold.toLocaleString()}</p>
                          <p className="text-[10.5px] text-slate-400">units</p>
                        </div>
                        {/* Revenue */}
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-slate-900">{p.revenue}</p>
                          <div className={`flex items-center justify-end gap-0.5 text-[10.5px] font-semibold ${p.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                            {p.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            trend
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Recent Orders Table ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden afu afu-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Recent Orders</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Latest 7 transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                    <Filter size={12} />Filter
                  </button>
                  <a href="/admin/orders" className="flex items-center gap-1 text-[12px] text-amber-600 font-semibold hover:text-amber-700 px-3 py-1.5">
                    View all <ChevronRight size={13} />
                  </a>
                </div>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        {["Order ID", "Customer", "Product", "Status", "Amount", "Date", ""].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {RECENT_ORDERS.map((order, i) => {
                        const sc = STATUS_CONFIG[order.status];
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                            <td className="px-5 py-3.5">
                              <span className="text-[12.5px] font-semibold text-amber-600">{order.id}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                                  {order.avatar}
                                </div>
                                <span className="text-[13px] font-medium text-slate-900 whitespace-nowrap">{order.user}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[12.5px] text-slate-600 whitespace-nowrap">{order.product}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[13px] font-bold text-slate-900">{order.amount}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[12px] text-slate-500 whitespace-nowrap">{order.date}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700">
                                <MoreHorizontal size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}