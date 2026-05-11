/**
 * components/admin/products/ProductTable.jsx
 * Solex Admin — Products table / grid with bulk select, skeleton, status toggle
 */
import { useState } from "react";
import {
  Edit2, Trash2, Eye, MoreVertical, ArrowUpDown,
  CheckSquare, Square, Package, TrendingUp, TrendingDown,
  AlertTriangle, LayoutGrid, List, ChevronUp, ChevronDown as ChevronDownIcon,
} from "lucide-react";

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow({ dm }) {
  const pulse = `animate-pulse rounded ${dm ? "bg-zinc-800" : "bg-zinc-100"}`;
  return (
    <tr>
      <td className="px-4 py-3.5"><div className={`${pulse} w-4 h-4`} /></td>
      <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className={`${pulse} w-11 h-11 rounded-xl shrink-0`} /><div className="space-y-1.5"><div className={`${pulse} h-3 w-36`} /><div className={`${pulse} h-2.5 w-20`} /></div></div></td>
      <td className="px-4 py-3.5"><div className={`${pulse} h-3 w-20`} /></td>
      <td className="px-4 py-3.5"><div className={`${pulse} h-3 w-16`} /></td>
      <td className="px-4 py-3.5"><div className={`${pulse} h-3 w-12`} /></td>
      <td className="px-4 py-3.5"><div className={`${pulse} h-5 w-16 rounded-full`} /></td>
      <td className="px-4 py-3.5"><div className="flex gap-1.5"><div className={`${pulse} w-7 h-7 rounded-lg`} /><div className={`${pulse} w-7 h-7 rounded-lg`} /><div className={`${pulse} w-7 h-7 rounded-lg`} /></div></td>
    </tr>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ dm }) {
  const pulse = `animate-pulse rounded-xl ${dm ? "bg-zinc-800" : "bg-zinc-100"}`;
  return (
    <div className={`rounded-2xl border p-4 ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}>
      <div className={`${pulse} aspect-square w-full rounded-xl mb-3`} />
      <div className={`${pulse} h-3.5 w-3/4 mb-2`} />
      <div className={`${pulse} h-3 w-1/2 mb-3`} />
      <div className="flex justify-between"><div className={`${pulse} h-4 w-16`} /><div className={`${pulse} h-5 w-12 rounded-full`} /></div>
    </div>
  );
}

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ qty, dm }) {
  if (qty === 0)  return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${dm ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-600"}`}><AlertTriangle size={9} />Out</span>;
  if (qty < 10)  return <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${dm ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"}`}><TrendingDown size={9} />{qty} low</span>;
  return <span className={`text-[13px] font-semibold ${dm ? "text-zinc-300" : "text-zinc-700"}`}>{qty}</span>;
}

// ─── Status toggle pill ───────────────────────────────────────────────────────
function StatusPill({ status, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 hover:scale-105 ${
        status === "active"
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-zinc-400"}`} />
      {status === "active" ? "Active" : "Draft"}
    </button>
  );
}

// ─── Product image with fallback ──────────────────────────────────────────────
function ProductThumb({ image, name, dm }) {
  return image
    ? <img src={image} alt={name} className="w-11 h-11 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-700" />
    : <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-black ${dm ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400"}`}>{name?.slice(0,2).toUpperCase()}</div>;
}

// ─── Sort header button ───────────────────────────────────────────────────────
function SortHeader({ label, sortKey, currentSort, onSort, dm }) {
  const isActive = currentSort?.key === sortKey;
  const dir = currentSort?.dir;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
        isActive ? "text-amber-500" : dm ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-700"
      }`}
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp    size={8} className={isActive && dir === "asc"  ? "opacity-100" : "opacity-30"} />
        <ChevronDownIcon size={8} className={isActive && dir === "desc" ? "opacity-100" : "opacity-30"} />
      </span>
    </button>
  );
}

// ─── Action menu ─────────────────────────────────────────────────────────────
function ActionMenu({ product, onEdit, onDelete, onView, dm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"}`}
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl border overflow-hidden z-20 py-1 ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}>
            {[
              { icon: <Eye size={13} />,   label: "View",   fn: () => { onView(product); setOpen(false); }, color: "" },
              { icon: <Edit2 size={13} />, label: "Edit",   fn: () => { onEdit(product); setOpen(false); }, color: "" },
              { icon: <Trash2 size={13}/>, label: "Delete", fn: () => { onDelete(product); setOpen(false); }, color: "text-red-500" },
            ].map(a => (
              <button key={a.label} onClick={a.fn}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                  a.color || (dm ? "text-zinc-300 hover:bg-zinc-800" : "text-zinc-700 hover:bg-zinc-50")
                } ${a.color ? (dm ? "hover:bg-red-500/10" : "hover:bg-red-50") : ""}`}
              >
                <span className={a.color || (dm ? "text-zinc-500" : "text-zinc-400")}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN TABLE COMPONENT ─────────────────────────────────────────────────────
export default function ProductTable({
  products, loading, selectedIds, onSelectOne, onSelectAll,
  onEdit, onDelete, onView, onToggleStatus,
  viewMode, onViewModeChange, sort, onSort, darkMode: dm,
}) {
  const allSelected = products.length > 0 && products.every(p => selectedIds.includes(p.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (loading && products.length === 0) {
    return viewMode === "grid"
      ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{Array(10).fill(0).map((_, i) => <SkeletonCard key={i} dm={dm} />)}</div>
      : (
        <div className={`rounded-2xl border overflow-hidden ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"}`}>
          <table className="w-full"><tbody>{Array(8).fill(0).map((_, i) => <SkeletonRow key={i} dm={dm} />)}</tbody></table>
        </div>
      );
  }

  if (!loading && products.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${dm ? "bg-zinc-800" : "bg-zinc-100"}`}>
          <Package size={28} className={dm ? "text-zinc-600" : "text-zinc-400"} />
        </div>
        <p className={`text-[15px] font-bold mb-1 ${dm ? "text-zinc-400" : "text-zinc-700"}`}>No products found</p>
        <p className={`text-[13px] ${dm ? "text-zinc-600" : "text-zinc-400"}`}>Try adjusting your search or filter</p>
      </div>
    );
  }

  // ── GRID VIEW ────────────────────────────────────────────────────────────
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map(p => (
          <div
            key={p.id}
            className={`rounded-2xl border overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedIds.includes(p.id)
                ? dm ? "border-amber-500/60 bg-amber-500/5" : "border-amber-400 bg-amber-50/30"
                : dm ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-100 hover:border-zinc-200"
            }`}
          >
            {/* Checkbox overlay */}
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className={`w-full h-full flex items-center justify-center text-2xl font-black ${dm ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-300"}`}>{p.name?.slice(0,2).toUpperCase()}</div>
                }
              </div>
              <button
                onClick={() => onSelectOne(p.id)}
                className={`absolute top-2 left-2 transition-opacity ${selectedIds.includes(p.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {selectedIds.includes(p.id)
                  ? <CheckSquare size={18} className="text-amber-500 drop-shadow" />
                  : <Square size={18} className={`${dm ? "text-white" : "text-white"} drop-shadow`} />
                }
              </button>
              <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <StatusPill status={p.status} onToggle={() => onToggleStatus(p.id)} />
              </div>
            </div>
            <div className="p-3">
              <p className={`text-[13px] font-semibold truncate mb-0.5 ${dm ? "text-zinc-200" : "text-zinc-900"}`}>{p.name}</p>
              <p className={`text-[11px] mb-2 ${dm ? "text-zinc-500" : "text-zinc-400"}`}>{p.category}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[14px] font-bold ${dm ? "text-white" : "text-zinc-900"}`}>₹{p.price?.toLocaleString("en-IN")}</span>
                <StockBadge qty={p.stock} dm={dm} />
              </div>
              <div className={`flex items-center gap-1.5 mt-2.5 pt-2.5 border-t ${dm ? "border-zinc-800" : "border-zinc-100"}`}>
                <button onClick={() => onView(p)} className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors ${dm ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"}`}>View</button>
                <button onClick={() => onEdit(p)} className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors ${dm ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"}`}>Edit</button>
                <button onClick={() => onDelete(p)} className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-semibold text-red-500 transition-colors ${dm ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── TABLE VIEW ───────────────────────────────────────────────────────────
  return (
    <div className={`rounded-2xl border overflow-hidden ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className={`border-b ${dm ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50/80 border-zinc-100"}`}>
              {/* Select all */}
              <th className="px-4 py-3.5 w-10">
                <button onClick={onSelectAll} className={dm ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-700"}>
                  {allSelected
                    ? <CheckSquare size={15} className="text-amber-500" />
                    : someSelected
                      ? <div className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-500/20" />
                      : <Square size={15} />
                  }
                </button>
              </th>
              <th className="px-4 py-3.5 text-left">
                <SortHeader label="Product" sortKey="name" currentSort={sort} onSort={onSort} dm={dm} />
              </th>
              <th className="px-4 py-3.5 text-left">
                <SortHeader label="Category" sortKey="category" currentSort={sort} onSort={onSort} dm={dm} />
              </th>
              <th className="px-4 py-3.5 text-left">
                <SortHeader label="Price" sortKey="price" currentSort={sort} onSort={onSort} dm={dm} />
              </th>
              <th className="px-4 py-3.5 text-left">
                <SortHeader label="Stock" sortKey="stock" currentSort={sort} onSort={onSort} dm={dm} />
              </th>
              <th className="px-4 py-3.5 text-left">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${dm ? "text-zinc-500" : "text-zinc-400"}`}>Status</span>
              </th>
              <th className="px-4 py-3.5 text-left">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${dm ? "text-zinc-500" : "text-zinc-400"}`}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${dm ? "divide-zinc-800" : "divide-zinc-50"}`}>
            {products.map(p => (
              <tr
                key={p.id}
                className={`group transition-colors duration-100 ${
                  selectedIds.includes(p.id)
                    ? dm ? "bg-amber-500/8" : "bg-amber-50/40"
                    : dm ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50/60"
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3.5">
                  <button onClick={() => onSelectOne(p.id)} className={dm ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-700"}>
                    {selectedIds.includes(p.id)
                      ? <CheckSquare size={15} className="text-amber-500" />
                      : <Square size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    }
                  </button>
                </td>
                {/* Product */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <ProductThumb image={p.image} name={p.name} dm={dm} />
                    <div className="min-w-0">
                      <p className={`text-[13.5px] font-semibold truncate max-w-[200px] ${dm ? "text-zinc-100" : "text-zinc-900"}`}>{p.name}</p>
                      <p className={`text-[11px] font-mono ${dm ? "text-zinc-600" : "text-zinc-400"}`}>{p.sku}</p>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="px-4 py-3.5">
                  <span className={`text-[12.5px] font-medium px-2.5 py-1 rounded-lg ${dm ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}>{p.category}</span>
                </td>
                {/* Price */}
                <td className="px-4 py-3.5">
                  <div>
                    <p className={`text-[13.5px] font-bold ${dm ? "text-zinc-100" : "text-zinc-900"}`}>₹{p.price?.toLocaleString("en-IN")}</p>
                    {p.discountPrice && (
                      <p className={`text-[11px] line-through ${dm ? "text-zinc-600" : "text-zinc-400"}`}>₹{p.discountPrice?.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                </td>
                {/* Stock */}
                <td className="px-4 py-3.5"><StockBadge qty={p.stock} dm={dm} /></td>
                {/* Status */}
                <td className="px-4 py-3.5"><StatusPill status={p.status} onToggle={() => onToggleStatus(p.id)} /></td>
                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"}`}><Eye size={13} /></button>
                    <button onClick={() => onEdit(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-blue-400" : "text-zinc-400 hover:bg-blue-50 hover:text-blue-600"}`}><Edit2 size={13} /></button>
                    <button onClick={() => onDelete(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-red-500/10 hover:text-red-400" : "text-zinc-400 hover:bg-red-50 hover:text-red-500"}`}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}