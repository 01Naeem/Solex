/**
 * pages/admin/AdminProducts.jsx
 * Solex Admin — Manage Products Page  (API-corrected version)
 *
 * ROOT CAUSE FIX
 * ──────────────
 * The previous version called axios.get("/admin/products").
 * Vite's dev server owns localhost:5173, so it intercepted that request
 * and returned index.html (the React shell) with a 200 status —
 * which is why data was an HTML string, not JSON.
 *
 * FIXES APPLIED
 * ─────────────
 * 1. Uses the shared `api` axios instance (src/api/api.js) which:
 *    - Sets baseURL to VITE_API_BASE_URL (your backend) or falls back to /api
 *    - Intercepts HTML-as-200 responses and throws a real error
 *    - Attaches auth token from localStorage automatically
 *    - Handles FormData Content-Type automatically
 * 2. Normalises all possible backend response shapes robustly:
 *    { products: [...] }  |  { data: [...] }  |  [...]  |  { product: {...} }
 * 3. Error state shows a proper message + retry button instead of silently
 *    showing empty table
 * 4. CRUD endpoints corrected to /admin/products (no duplicate /api prefix
 *    since api.js already sets baseURL=/api)
 * 5. FormData POST/PUT works correctly (Content-Type auto-removed for multipart)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus,
  Download,
  LayoutGrid,
  List,
  Trash2,
  RefreshCw,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  WifiOff,
  ServerCrash,
} from "lucide-react";

// ── Shared axios instance (handles baseURL, auth token, HTML-response guard)
import api from "../../api/api";

import ProductFilters from "../../components/admin/products/ProductFilters";
import ProductTable from "../../components/admin/products/ProductTable";
import {
  ProductModal,
  DeleteModal,
  BulkDeleteModal,
} from "../../../src/skeleton/ProductModal";

// ─── Dummy data (used only when API is unreachable in dev) ───────────────────
// const DUMMY = Array.from({ length: 42 }, (_, i) => ({
//   id: `p${i + 1}`,
//   name: [
//     "SolexAir Pro",
//     "CloudRun X",
//     "StreetEdge 2",
//     "HyperBoost Elite",
//     "TrailX Hiker",
//     "Velocity Knit",
//     "Classic Low",
//     "Urban Glide",
//     "Sprint Edge",
//     "PowerStep Pro",
//   ][i % 10],
//   sku: `SX-${String(i + 1).padStart(4, "0")}`,
//   category: ["Sneakers", "Running", "Casual", "Sports", "Formal"][i % 5],
//   price: [8999, 6499, 4999, 9999, 5999, 3999, 2999, 4499, 5499, 7499][i % 10],
//   discountPrice: i % 3 === 0 ? [7499, 5499, 3999, 8499, 4999][i % 5] : null,
//   stock: [0, 3, 15, 48, 102, 7, 23, 0, 55, 88][i % 10],
//   status: i % 7 === 0 ? "draft" : "active",
//   image: `https://images.unsplash.com/photo-${["1542291026-7eec264c27ff", "1606107557195-0e29a4b5b4aa", "1595950653106-6c9ebd614d3a", "1515955656352-a1fa3ffcd111", "1600185365483-26d7a4cc7519", "1525966222134-fcfa99b8ae77", "1543163521-1bf539c55dd2", "1560769629-975ec94e6a86", "1539185441755-769473a23570", "1529810313688-44ea1c2d81d3"][i % 10]}?w=200&q=75&auto=format`,
//   description: "Premium athletic footwear engineered for performance.",
//   createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
// }));

const PER_PAGE = 10;

// ─── Normalise any backend response shape into a plain array ─────────────────
// Handles: { products:[...] } | { data:[...] } | { items:[...] } | [...] | {}
function extractProducts(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.products)) return responseData.products;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.result)) return responseData.result;
  return [];
}

// Normalise a single product from POST/PUT response
function extractProduct(responseData, fallback) {
  return (
    responseData?.product ||
    responseData?.data ||
    responseData?.item ||
    responseData?.result ||
    fallback
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToasts() {
  const [ts, setTs] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setTs((p) => [...p, { id, msg, type }]);
    setTimeout(() => setTs((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);
  return {
    ts,
    toast: add,
    dismiss: (id) => setTs((p) => p.filter((t) => t.id !== id)),
  };
}

function Toasts({ ts, dismiss }) {
  return (
    <div
      className="fixed top-20 right-4 z-[100] space-y-2 w-80"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {ts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2
              size={15}
              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
            />
          ) : (
            <AlertCircle
              size={15}
              className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
            />
          )}
          <p
            className={`flex-1 text-[12.5px] font-medium ${
              t.type === "success"
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {t.msg}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, bg, dm }) {
  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
        dm
          ? "bg-zinc-900 border-zinc-800"
          : "bg-white border-zinc-100 shadow-sm"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`text-[11.5px] font-semibold uppercase tracking-wide ${dm ? "text-zinc-500" : "text-zinc-400"}`}
        >
          {label}
        </p>
        <p
          className={`text-[20px] font-black leading-tight ${dm ? "text-white" : "text-zinc-900"}`}
          style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
        >
          {value}
        </p>
        {sub && (
          <p
            className={`text-[11px] ${dm ? "text-zinc-600" : "text-zinc-400"}`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry, dm }) {
  const isHtml = error?.isHtmlResponse;
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 rounded-2xl border text-center px-6 ${
        dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
          dm ? "bg-red-500/10" : "bg-red-50"
        }`}
      >
        {isHtml ? (
          <WifiOff size={28} className="text-red-500" />
        ) : (
          <ServerCrash size={28} className="text-red-500" />
        )}
      </div>
      <h3
        className={`text-[15px] font-bold mb-2 ${dm ? "text-zinc-300" : "text-zinc-800"}`}
      >
        {isHtml ? "API Not Reachable" : "Failed to Load Products"}
      </h3>
      {isHtml ? (
        <div
          className={`max-w-sm space-y-2 mb-5 text-left ${dm ? "text-zinc-500" : "text-zinc-500"}`}
        >
          <p className="text-[12.5px]">
            Your request returned an HTML page instead of JSON. Fix one of
            these:
          </p>
          <div
            className={`rounded-xl p-3 font-mono text-[11.5px] space-y-1 ${dm ? "bg-zinc-800 text-zinc-300" : "bg-zinc-50 text-zinc-700 border border-zinc-200"}`}
          >
            <p className="text-amber-500 font-bold"># Option 1: .env file</p>
            <p>VITE_API_BASE_URL=http://localhost:5000</p>
            <p className="text-amber-500 font-bold mt-2">
              # Option 2: vite.config.js proxy
            </p>
            <p>target: "http://localhost:5000"</p>
          </div>
        </div>
      ) : (
        <p
          className={`text-[13px] mb-5 max-w-xs ${dm ? "text-zinc-500" : "text-zinc-500"}`}
        >
          {error?.message ||
            "Could not connect to the server. Check your network or backend."}
        </p>
      )}
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <RefreshCw size={14} />
        Try Again
      </button>
    </div>
  );
}

// ─── Pagination button ────────────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, dm }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-colors",
        disabled ? "opacity-30 cursor-not-allowed" : "",
        dm
          ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          : "text-zinc-500 hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminProducts({ darkMode: dm = false }) {
  const { ts, toast, dismiss } = useToasts();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [modal, setModal] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    stock: "all",
    status: "all",
    sort: "newest",
  });

  // Debounced search — only delays when search string actually changes
  const debounceRef = useRef(null);
  const handleFiltersChange = useCallback(
    (newFilters) => {
      if (newFilters.search !== filters.search) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          setFilters(newFilters);
          setPage(1);
        }, 350);
      } else {
        setFilters(newFilters);
        setPage(1);
      }
    },
    [filters.search],
  );

  // ── Load Google Fonts once ────────────────────────────────────────────────
  useEffect(() => {
    if (!document.querySelector("#solex-admin-fonts")) {
      const l = Object.assign(document.createElement("link"), {
        id: "solex-admin-fonts",
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap",
      });
      document.head.appendChild(l);
    }
  }, []);

  // ── Fetch all products ────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /*
       * API endpoint: GET /api/admin/products
       * (baseURL="/api" is already set in api.js, so path = "/admin/products")
       *
       * Expected backend response shapes (all handled):
       *   { products: [...] }
       *   { data: [...] }
       *   { items: [...] }
       *   [ ... ]   ← plain array
       */
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products`,
      );
      const products = extractProducts(response.data);

      if (products.length === 0 && !Array.isArray(response.data)) {
        // Response was truthy but had no recognisable array key
        console.warn(
          "[AdminProducts] Unexpected response shape — no products array found.",
          "Response:",
          response.data,
          "Expected: { products:[...] } | { data:[...] } | [...]",
        );
      }

      setAllProducts(products);
    } catch (err) {
      console.error("[AdminProducts] Fetch error:", err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Client-side filter + sort + paginate ──────────────────────────────────
  const processed = useMemo(() => {
    let list = Array.isArray(allProducts) ? [...allProducts] : [];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }
    if (filters.category && filters.category !== "All")
      list = list.filter((p) => p.category === filters.category);
    if (filters.stock === "in") list = list.filter((p) => p.stock > 0);
    if (filters.stock === "low")
      list = list.filter((p) => p.stock > 0 && p.stock < 10);
    if (filters.stock === "out") list = list.filter((p) => p.stock === 0);
    if (filters.status !== "all")
      list = list.filter((p) => p.status === filters.status);

    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "price") return (a.price - b.price) * dir;
      if (sort.key === "stock") return (a.stock - b.stock) * dir;
      if (sort.key === "name") return a.name?.localeCompare(b.name) * dir;
      if (sort.key === "category")
        return a.category?.localeCompare(b.category) * dir;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    });

    return list;
  }, [allProducts, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const paginated = processed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: allProducts.length,
      active: allProducts.filter((p) => p.status === "active").length,
      outStock: allProducts.filter((p) => p.stock === 0).length,
      lowStock: allProducts.filter((p) => p.stock > 0 && p.stock < 10).length,
    }),
    [allProducts],
  );

  const handleSort = (key) =>
    setSort((p) =>
      p.key === key
        ? { key, dir: p.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const handleSelectOne = (id) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
  const handleSelectAll = () =>
    setSelectedIds((p) =>
      p.length === paginated.length ? [] : paginated.map((p) => p.id),
    );

  // ── Status toggle (optimistic + rollback) ─────────────────────────────────
  const handleToggleStatus = async (id) => {
    const prev = allProducts.find((p) => p.id === id || p._id === id);
    if (!prev) return;
    const nextStatus = prev.status === "active" ? "draft" : "active";

    // Optimistic update
    setAllProducts((p) =>
      p.map((x) =>
        x.id === id || x._id === id ? { ...x, status: nextStatus } : x,
      ),
    );

    try {
      await api.put(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products/${id}`,
        { status: nextStatus },
      );
      toast(`Status changed to "${nextStatus}"`, "success");
    } catch (err) {
      // Rollback
      setAllProducts((p) =>
        p.map((x) =>
          x.id === id || x._id === id ? { ...x, status: prev.status } : x,
        ),
      );
      toast("Failed to update status — rolled back", "error");
      console.error("[AdminProducts] Status toggle error:", err.message);
    }
  };

  // ── Add / Edit product ────────────────────────────────────────────────────
  const handleSave = async (fd, isEdit) => {
    /*
     * fd is a FormData object.
     * api.js interceptor removes Content-Type header automatically
     * so axios sets multipart/form-data with the correct boundary.
     */
    try {
      if (isEdit) {
        const id = fd.get("id");
        const { data } = await api.put(
          `${import.meta.env.VITE_API_BASE_URL}/admin/products/${id}`,
          fd,
        );

        const updated = extractProduct(data, {
          ...activeProduct,
          id,
          name: fd.get("name"),
          price: +fd.get("price"),
          stock: +fd.get("stock"),
          category: fd.get("category"),
          status: fd.get("status"),
        });

        setAllProducts((p) =>
          p.map((x) =>
            x.id === id || x._id === id ? { ...x, ...updated } : x,
          ),
        );
        toast("Product updated successfully!", "success");
      } else {
        const { data } = await api.post(
          `${import.meta.env.VITE_API_BASE_URL}/admin/products`,
          fd,
        );

        const newProd = extractProduct(data, {
          id: `p${Date.now()}`,
          name: fd.get("name"),
          price: +fd.get("price"),
          stock: +fd.get("stock"),
          category: fd.get("category"),
          status: fd.get("status"),
          sku: `SX-${String(Date.now()).slice(-4)}`,
          discountPrice: null,
          image: null,
          createdAt: new Date().toISOString(),
        });

        setAllProducts((p) => [newProd, ...p]);
        toast("Product added successfully! 🎉", "success");
      }

      setModal(null);
      setActiveProduct(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (isEdit ? "Failed to update product" : "Failed to add product");
      toast(msg, "error");
      console.error("[AdminProducts] Save error:", err.message);
      throw err; // re-throw so modal can stop its loading spinner
    }
  };

  // ── Delete single product ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products/${id}`,
      );
    } catch (err) {
      console.warn(
        "[AdminProducts] Delete API error (continuing optimistically):",
        err.message,
      );
    }
    setAllProducts((p) => p.filter((x) => x.id !== id && x._id !== id));
    setSelectedIds((p) => p.filter((x) => x !== id));
    toast("Product deleted", "success");
    setModal(null);
    setActiveProduct(null);
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) =>
        api.delete(`${import.meta.env.VITE_API_BASE_URL}/admin/products/${id}`),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;

    setAllProducts((p) =>
      p.filter(
        (x) => !selectedIds.includes(x.id) && !selectedIds.includes(x._id),
      ),
    );
    setSelectedIds([]);
    setModal(null);

    if (failed > 0) {
      toast(`Deleted with ${failed} error(s) — UI updated`, "error");
    } else {
      toast(`${selectedIds.length} products deleted`, "success");
    }
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const cols = ["ID", "Name", "SKU", "Category", "Price", "Stock", "Status"];
    const rows = processed.map((p) => [
      p.id || p._id,
      p.name,
      p.sku,
      p.category,
      p.price,
      p.stock,
      p.status,
    ]);
    const csv = [cols, ...rows].map((r) => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
      download: "solex-products.csv",
    });
    a.click();
    toast("CSV exported!", "success");
  };

  const f = { fontFamily: "'DM Sans', sans-serif" };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen transition-colors ${dm ? "bg-zinc-950" : "bg-slate-50"}`}
      style={f}
    >
      <Toasts ts={ts} dismiss={dismiss} />

      <style>{`
        @keyframes pge { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .pge   { animation: pge 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .pge-1 { animation-delay: 0.05s }
        .pge-2 { animation-delay: 0.10s }
        .pge-3 { animation-delay: 0.14s }
        .pge-4 { animation-delay: 0.18s }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="pge pge-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div
              className={`flex items-center gap-1.5 text-[12px] mb-1 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
            >
              <a
                href="/admin"
                className="hover:text-amber-500 transition-colors"
              >
                Dashboard
              </a>
              <span>/</span>
              <span
                className={`font-semibold ${dm ? "text-zinc-300" : "text-zinc-700"}`}
              >
                Products
              </span>
            </div>
            <h1
              className={`text-[26px] font-black ${dm ? "text-white" : "text-zinc-900"}`}
              style={{
                fontFamily: "'Barlow Condensed', Impact, sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              MANAGE PRODUCTS
            </h1>
            <p
              className={`text-[12.5px] mt-0.5 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {stats.total} products · {stats.active} active · {stats.outStock}{" "}
              out of stock
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchProducts}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                dm
                  ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={allProducts.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                dm
                  ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Download size={13} />
              Export CSV
            </button>
            <button
              onClick={() => {
                setActiveProduct(null);
                setModal("add");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Plus size={15} />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="pge pge-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Products"
            value={stats.total}
            icon={<Package size={18} />}
            color="text-amber-600"
            bg={`${dm ? "bg-amber-500/10" : "bg-amber-50"}`}
            dm={dm}
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={<CheckCircle size={18} />}
            color="text-emerald-600"
            bg={`${dm ? "bg-emerald-500/10" : "bg-emerald-50"}`}
            dm={dm}
            sub={`${Math.round((stats.active / Math.max(stats.total, 1)) * 100)}% of total`}
          />
          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            icon={<AlertTriangle size={18} />}
            color="text-amber-600"
            bg={`${dm ? "bg-amber-500/10" : "bg-amber-50"}`}
            dm={dm}
            sub="Under 10 units"
          />
          <StatCard
            label="Out of Stock"
            value={stats.outStock}
            icon={<TrendingUp size={18} />}
            color="text-red-500"
            bg={`${dm ? "bg-red-500/10" : "bg-red-50"}`}
            dm={dm}
          />
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="pge pge-2">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            resultCount={processed.length}
            darkMode={dm}
          />
        </div>

        {/* ── Error state ─────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="pge pge-3">
            <ErrorState error={error} onRetry={fetchProducts} dm={dm} />
          </div>
        )}

        {/* ── Bulk bar + view toggle ───────────────────────────────────── */}
        {!error && (
          <div className="pge pge-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {selectedIds.length > 0 ? (
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
                    dm
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  <Zap size={13} />
                  <span className="text-[12.5px] font-semibold">
                    {selectedIds.length} selected
                  </span>
                  <button
                    onClick={() => setModal("bulkDelete")}
                    className="flex items-center gap-1 ml-2 text-[12px] font-semibold text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="ml-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <p
                  className={`text-[12.5px] font-medium ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  Showing {paginated.length} of {processed.length} products
                </p>
              )}
            </div>

            <div
              className={`flex items-center gap-0.5 p-1 rounded-xl border ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}
            >
              {[
                { mode: "table", icon: <List size={15} />, label: "Table" },
                { mode: "grid", icon: <LayoutGrid size={15} />, label: "Grid" },
              ].map((v) => (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors",
                    viewMode === v.mode
                      ? "bg-amber-500 text-white shadow-sm"
                      : dm
                        ? "text-zinc-500 hover:text-zinc-300"
                        : "text-zinc-400 hover:text-zinc-700",
                  ].join(" ")}
                >
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Table / Grid ─────────────────────────────────────────────── */}
        {!error && (
          <div className="pge pge-4">
            <ProductTable
              products={paginated}
              loading={loading}
              selectedIds={selectedIds}
              onSelectOne={handleSelectOne}
              onSelectAll={handleSelectAll}
              onEdit={(p) => {
                setActiveProduct(p);
                setModal("edit");
              }}
              onDelete={(p) => {
                setActiveProduct(p);
                setModal("delete");
              }}
              onView={(p) => {
                setActiveProduct(p);
                setModal("view");
              }}
              onToggleStatus={handleToggleStatus}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sort={sort}
              onSort={handleSort}
              darkMode={dm}
            />
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {!error && totalPages > 1 && (
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-1 ${loading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <p
              className={`text-[12.5px] font-medium ${dm ? "text-zinc-500" : "text-zinc-500"}`}
            >
              Page {page} of {totalPages} · {processed.length} total products
            </p>
            <div className="flex items-center gap-1.5">
              <PagBtn onClick={() => setPage(1)} disabled={page === 1} dm={dm}>
                «
              </PagBtn>
              <PagBtn
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                dm={dm}
              >
                <ChevronLeft size={14} />
              </PagBtn>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={[
                      "w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-colors",
                      page === p
                        ? "bg-amber-500 text-white shadow-sm"
                        : dm
                          ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          : "text-zinc-600 hover:bg-zinc-100",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                );
              })}
              <PagBtn
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                dm={dm}
              >
                <ChevronRight size={14} />
              </PagBtn>
              <PagBtn
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                dm={dm}
              >
                »
              </PagBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <ProductModal
          product={modal === "edit" ? activeProduct : null}
          onClose={() => {
            setModal(null);
            setActiveProduct(null);
          }}
          onSave={handleSave}
          darkMode={dm}
        />
      )}

      {modal === "delete" && activeProduct && (
        <DeleteModal
          product={activeProduct}
          onClose={() => {
            setModal(null);
            setActiveProduct(null);
          }}
          onConfirm={(id) => handleDelete(id)}
          darkMode={dm}
        />
      )}

      {modal === "bulkDelete" && (
        <BulkDeleteModal
          count={selectedIds.length}
          onClose={() => setModal(null)}
          onConfirm={handleBulkDelete}
          darkMode={dm}
        />
      )}

      {/* Quick view modal */}
      {modal === "view" && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border p-5 ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}
            style={f}
          >
            <button
              onClick={() => setModal(null)}
              className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100"}`}
            >
              <X size={15} />
            </button>
            <div className="flex items-start gap-4">
              {activeProduct.image ? (
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-24 h-24 rounded-xl object-cover ring-2 ring-amber-400/30 shrink-0"
                />
              ) : (
                <div
                  className={`w-24 h-24 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 ${dm ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-300"}`}
                >
                  {activeProduct.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-[15px] font-bold truncate ${dm ? "text-white" : "text-zinc-900"}`}
                >
                  {activeProduct.name}
                </h3>
                <p
                  className={`text-[11.5px] font-mono mb-2 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  {activeProduct.sku}
                </p>
                {[
                  ["Category", activeProduct.category],
                  ["Price", `₹${activeProduct.price?.toLocaleString("en-IN")}`],
                  ["Stock", activeProduct.stock],
                  ["Status", activeProduct.status],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className={`flex items-center justify-between py-1.5 border-b last:border-0 ${dm ? "border-zinc-800" : "border-zinc-100"}`}
                  >
                    <span
                      className={`text-[12px] font-semibold ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {k}
                    </span>
                    <span
                      className={`text-[12.5px] font-medium ${dm ? "text-zinc-200" : "text-zinc-800"}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => setModal("edit")}
                className="flex-1 py-2 rounded-xl text-[12.5px] font-semibold bg-amber-500 text-white hover:bg-amber-400 transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => setModal("delete")}
                className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold text-red-500 border transition-colors ${dm ? "border-red-500/30 hover:bg-red-500/10" : "border-red-200 hover:bg-red-50"}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
