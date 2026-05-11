/**
 * components/admin/products/ProductFilters.jsx
 * Solex Admin — Product search, filter, sort controls
 */
import { useRef } from "react";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";

const CATEGORIES = ["All", "Sneakers", "Running", "Casual", "Formal", "Sports"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First"     },
  { value: "oldest",     label: "Oldest First"     },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc",   label: "Name: A → Z"      },
  { value: "stock_asc",  label: "Stock: Low → High" },
];

export default function ProductFilters({ filters, onChange, resultCount, darkMode: dm }) {
  const searchRef = useRef(null);

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const cls = {
    input: [
      "px-3.5 py-2 rounded-xl text-[13px] border outline-none transition-all duration-200",
      "focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400",
      dm
        ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 hover:border-zinc-700"
        : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 hover:border-zinc-300",
    ].join(" "),
    select: [
      "pl-3.5 pr-9 py-2 rounded-xl text-[13px] border outline-none appearance-none transition-all duration-200",
      "focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400",
      dm
        ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:border-zinc-700"
        : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300",
    ].join(" "),
  };

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"}`}>
      <div className="flex flex-col lg:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`} />
          <input
            ref={searchRef}
            type="text"
            value={filters.search}
            onChange={e => set("search", e.target.value)}
            placeholder="Search products by name, SKU..."
            className={`${cls.input} pl-9 pr-9 w-full`}
          />
          {filters.search && (
            <button
              onClick={() => set("search", "")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${dm ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-700"}`}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category */}
        <div className="relative">
          <select value={filters.category} onChange={e => set("category", e.target.value)} className={`${cls.select} min-w-[140px]`}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>

        {/* Stock status */}
        <div className="relative">
          <select value={filters.stock} onChange={e => set("stock", e.target.value)} className={`${cls.select} min-w-[140px]`}>
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (&lt;10)</option>
            <option value="out">Out of Stock</option>
          </select>
          <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>

        {/* Status */}
        <div className="relative">
          <select value={filters.status} onChange={e => set("status", e.target.value)} className={`${cls.select} min-w-[130px]`}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>

        {/* Sort */}
        <div className="relative">
          <select value={filters.sort} onChange={e => set("sort", e.target.value)} className={`${cls.select} min-w-[170px]`}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`} />
        </div>
      </div>

      {/* Active filters + result count */}
      {(filters.search || filters.category !== "All" || filters.stock !== "all" || filters.status !== "all") && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`text-[11.5px] font-medium ${dm ? "text-zinc-500" : "text-zinc-400"}`}>
            {resultCount} result{resultCount !== 1 ? "s" : ""} ·
          </span>
          {filters.search && <FilterChip label={`"${filters.search}"`} onRemove={() => set("search", "")} dm={dm} />}
          {filters.category !== "All"  && <FilterChip label={filters.category} onRemove={() => set("category", "All")} dm={dm} />}
          {filters.stock !== "all"     && <FilterChip label={filters.stock === "in" ? "In Stock" : filters.stock === "low" ? "Low Stock" : "Out of Stock"} onRemove={() => set("stock", "all")} dm={dm} />}
          {filters.status !== "all"    && <FilterChip label={filters.status === "active" ? "Active" : "Draft"} onRemove={() => set("status", "all")} dm={dm} />}
          <button
            onClick={() => onChange({ search: "", category: "All", stock: "all", status: "all", sort: "newest" })}
            className="text-[11.5px] font-semibold text-red-500 hover:text-red-400 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove, dm }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold border ${dm ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"}`}>
      {label}
      <button onClick={onRemove} className="text-zinc-400 hover:text-red-500 transition-colors">
        <X size={10} />
      </button>
    </span>
  );
}