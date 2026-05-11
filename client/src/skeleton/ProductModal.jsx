/**
 * src/skeleton/ProductModal.jsx  — Production-Grade v3
 *
 * ARCHITECTURE
 * ────────────
 * • Multi-tab layout: General | Pricing | Variants | Shipping & SEO
 * • Pinned header + tab bar + pinned footer — only tab body scrolls
 * • Features field: chip-style input (like Signup form pattern — type + Enter)
 * • Full dark-mode parity on every element
 * • Keyboard: Escape closes
 * • Accessible: aria-labels, focus rings, disabled states
 * • Responsive: stacks gracefully on mobile (<640px)
 * • Tab error indicators — red dot on tab if that tab has a validation error
 * • Auto-jumps to first tab with error on failed submit
 * • Margin preview card in Pricing tab (live profit / margin / markup)
 * • SEO live search snippet preview in Shipping & SEO tab
 * • FormData output matches existing handleSave() signature — zero upstream changes
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Save,
  Loader2,
  Package,
  DollarSign,
  Layers,
  Truck,
  Info,
  Hash,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Plus,
  Check,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// ─── Google Fonts (load once) ─────────────────────────────────────────────────
function useGoogleFonts() {
  useEffect(() => {
    if (!document.getElementById("pm-fonts")) {
      const l = document.createElement("link");
      l.id = "pm-fonts";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";
      document.head.appendChild(l);
    }
  }, []);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const tk = {
  input: (dm, err) =>
    [
      "w-full rounded-xl border text-[13px] font-medium px-3.5 py-2.5 outline-none",
      "transition-all duration-150",
      "focus:ring-2 focus:border-amber-400",
      err
        ? "border-red-400 bg-red-50/30 focus:ring-red-300/40"
        : dm
          ? "bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-amber-500/30 focus:bg-zinc-800"
          : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-amber-400/30",
    ].join(" "),
  label: (dm) =>
    `block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${dm ? "text-zinc-500" : "text-zinc-400"}`,
  errTxt: "text-red-500 text-[11px] mt-1 font-medium",
  select: (dm) =>
    [
      "w-full rounded-xl border text-[13px] font-medium px-3.5 py-2.5 pr-9 outline-none appearance-none",
      "transition-all duration-150 focus:ring-2 focus:border-amber-400",
      dm
        ? "bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:ring-amber-500/30"
        : "bg-white border-zinc-200 text-zinc-900 focus:ring-amber-400/30",
    ].join(" "),
  textarea: (dm) =>
    [
      "w-full rounded-xl border text-[13px] font-medium px-3.5 py-2.5 outline-none resize-none",
      "transition-all duration-150 focus:ring-2 focus:border-amber-400",
      dm
        ? "bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-amber-500/30"
        : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-amber-400/30",
    ].join(" "),
};

const CATEGORIES = [
  "Sneakers",
  "Running",
  "Casual",
  "Sports",
  "Formal",
  "Sandals",
  "Boots",
  "Loafers",
  "Accessories",
];
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];
const SIZE_PRESETS = {
  EU: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  UK: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  US: ["5", "6", "7", "8", "9", "10", "11", "12", "13"],
  Apparel: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
};
const COLOR_MAP = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  black: "#18181b",
  white: "#f9fafb",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  grey: "#71717a",
  gray: "#71717a",
  navy: "#1e3a5f",
  brown: "#92400e",
  beige: "#d4b896",
  maroon: "#7f1d1d",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  lime: "#84cc16",
  rose: "#f43f5e",
};
const TABS = [
  { id: "general", label: "General", icon: Info },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "variants", label: "Variants", icon: Layers },
  { id: "shipping", label: "Shipping & SEO", icon: Truck },
];
const TAB_FIELDS = {
  general: ["name", "sku"],
  pricing: ["price", "discountPrice", "stock", "costPrice"],
  variants: [],
  shipping: [],
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, dm, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className={tk.label(dm)}>
          {label}
          {required && <span className="text-amber-500 ml-0.5">*</span>}
        </label>
        {hint && (
          <span
            className={`text-[10.5px] normal-case tracking-normal font-normal ${dm ? "text-zinc-600" : "text-zinc-400"}`}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && <p className={tk.errTxt}>{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Sel({ dm, value, onChange, options }) {
  return (
    <div className="relative">
      <select className={tk.select(dm)} value={value} onChange={onChange}>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <ChevronDown
        size={13}
        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`}
      />
    </div>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────────
function StatusBar({ value, onChange, dm }) {
  const active = {
    active:
      "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20",
    draft: "bg-zinc-500 border-zinc-500 text-white shadow-md",
    archived:
      "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20",
  };
  const inactive = dm
    ? "border-transparent text-zinc-500 hover:text-zinc-300"
    : "border-transparent text-zinc-400 hover:text-zinc-600";

  return (
    <div
      className={`flex gap-1.5 p-1.5 rounded-xl border ${dm ? "bg-zinc-800/60 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}
    >
      {STATUSES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className={`flex-1 py-2 rounded-lg text-[12px] font-bold capitalize border transition-all duration-150 ${value === s.value ? active[s.value] : inactive}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Features chip input ──────────────────────────────────────────────────────
function FeaturesInput({ values = [], onChange, dm }) {
  const [draft, setDraft] = useState("");
  const ref = useRef(null);

  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Backspace" && !draft && values.length)
      onChange(values.slice(0, -1));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="e.g. Breathable mesh upper"
          className={`${tk.input(dm, false)} flex-1`}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!draft.trim()}
          className={[
            "shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
            draft.trim()
              ? "bg-amber-500 border-amber-500 text-white hover:bg-amber-400 shadow-sm"
              : dm
                ? "bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed",
          ].join(" ")}
        >
          <Plus size={15} />
        </button>
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((feat, i) => (
            <span
              key={i}
              className={[
                "group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg",
                "text-[11.5px] font-semibold border transition-all",
                dm
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-amber-500/40"
                  : "bg-amber-50 border-amber-200/70 text-amber-800 hover:border-amber-400",
              ].join(" ")}
            >
              <Check
                size={10}
                className={dm ? "text-amber-400" : "text-amber-600"}
              />
              {feat}
              <button
                type="button"
                onClick={() => remove(i)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-all ${dm ? "text-zinc-600 hover:text-red-400 hover:bg-zinc-700" : "text-amber-400 hover:text-red-500 hover:bg-red-50"}`}
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p
          className={`text-[11px] italic ${dm ? "text-zinc-600" : "text-zinc-400"}`}
        >
          No features yet — type one above and press Enter or click +
        </p>
      )}
    </div>
  );
}

// ─── Tag / color input ────────────────────────────────────────────────────────
function TagInput({
  values = [],
  onChange,
  placeholder,
  dm,
  colorMode = false,
}) {
  const [draft, setDraft] = useState("");
  const ref = useRef(null);

  const commit = () => {
    const v = draft.trim().toLowerCase();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  const remove = (v) => onChange(values.filter((x) => x !== v));
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Backspace" && !draft && values.length)
      remove(values[values.length - 1]);
  };

  return (
    <div
      className={[
        "min-h-[44px] rounded-xl border px-2.5 py-1.5",
        "flex flex-wrap gap-1.5 items-center cursor-text",
        "transition-all duration-150 focus-within:ring-2 focus-within:ring-amber-400/40 focus-within:border-amber-400",
        dm ? "bg-zinc-800/80 border-zinc-700" : "bg-white border-zinc-200",
      ].join(" ")}
      onClick={() => ref.current?.focus()}
    >
      {values.map((v) => {
        const hex = colorMode && COLOR_MAP[v.toLowerCase()];
        return (
          <span
            key={v}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11.5px] font-semibold border ${dm ? "bg-zinc-700 border-zinc-600 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-700"}`}
            style={
              hex
                ? { backgroundColor: hex + "22", borderColor: hex + "55" }
                : {}
            }
          >
            {hex && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                style={{ background: hex }}
              />
            )}
            {v}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
              className={`transition-colors hover:text-red-500 ml-0.5 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
            >
              <X size={9} />
            </button>
          </span>
        );
      })}
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ""}
        className={`flex-1 min-w-[100px] bg-transparent text-[13px] font-medium outline-none ${dm ? "text-zinc-100 placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
      />
    </div>
  );
}

// ─── Size selector ────────────────────────────────────────────────────────────
function SizeSelector({ selected = [], onChange, dm }) {
  const [group, setGroup] = useState("EU");
  const ALL_PRESET = Object.values(SIZE_PRESETS).flat();
  const toggle = (s) =>
    onChange(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
    );

  return (
    <div className="space-y-2.5">
      <div
        className={`flex gap-1 p-1 rounded-xl border ${dm ? "bg-zinc-800/60 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}
      >
        {Object.keys(SIZE_PRESETS).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={[
              "flex-1 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all",
              group === g
                ? "bg-amber-500 text-white shadow-sm"
                : dm
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-600",
            ].join(" ")}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SIZE_PRESETS[group].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={[
              "px-2.5 py-1 rounded-lg text-[11.5px] font-bold border transition-all duration-150",
              selected.includes(s)
                ? "bg-amber-500 border-amber-500 text-white shadow-sm scale-105"
                : dm
                  ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-amber-400/60 hover:text-amber-600",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div
          className={`flex items-center justify-between text-[11px] font-medium ${dm ? "text-zinc-500" : "text-zinc-400"}`}
        >
          <span>
            {selected.length} selected: {selected.join(", ")}
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-red-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div>
        <p
          className={`text-[10.5px] font-semibold mb-1.5 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
        >
          Custom sizes (type + Enter)
        </p>
        <TagInput
          values={selected.filter((s) => !ALL_PRESET.includes(s))}
          onChange={(custom) => {
            const preset = selected.filter((s) => ALL_PRESET.includes(s));
            onChange([...preset, ...custom]);
          }}
          placeholder="47, 48, XXXL…"
          dm={dm}
        />
      </div>
    </div>
  );
}

// ─── Image upload ─────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, dm }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const handle = (file) => {
    if (!file?.type?.startsWith("image/")) return;
    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={[
        "relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5",
        "cursor-pointer transition-all duration-200 group overflow-hidden",
        value ? "h-44" : "h-36",
        drag
          ? dm
            ? "border-amber-400 bg-amber-500/10"
            : "border-amber-400 bg-amber-50"
          : dm
            ? "border-zinc-700 bg-zinc-800/40 hover:border-amber-500/50 hover:bg-zinc-800/60"
            : "border-zinc-200 bg-zinc-50/80 hover:border-amber-400/60 hover:bg-amber-50/30",
      ].join(" ")}
    >
      {value ? (
        <>
          <img
            src={value}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60 group-hover:opacity-75 transition-opacity"
          />
          <div className="relative z-10 flex flex-col items-center gap-1.5 pointer-events-none">
            <div
              className={`p-2 rounded-xl backdrop-blur-md ${dm ? "bg-zinc-900/70" : "bg-white/80"}`}
            >
              <ImagePlus
                size={16}
                className={dm ? "text-zinc-300" : "text-zinc-600"}
              />
            </div>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-lg backdrop-blur-md ${dm ? "bg-zinc-900/70 text-zinc-300" : "bg-white/85 text-zinc-600"}`}
            >
              Click or drag to replace
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${dm ? "bg-zinc-700/60 border-zinc-600 group-hover:border-amber-500/40" : "bg-white border-zinc-200 group-hover:border-amber-400/50"}`}
          >
            <ImagePlus
              size={18}
              className={dm ? "text-zinc-500" : "text-zinc-400"}
            />
          </div>
          <div className="text-center">
            <p
              className={`text-[12.5px] font-semibold ${dm ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Click or drag image here
            </p>
            <p
              className={`text-[11px] mt-0.5 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
            >
              PNG, JPG, WEBP — max 5 MB
            </p>
          </div>
        </>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </div>
  );
}

// ─── Tab progress bar ─────────────────────────────────────────────────────────
function TabProgress({ tabs, current, dm }) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`h-1 rounded-full transition-all duration-300 ${t.id === current ? "w-6 bg-amber-500" : dm ? "w-2 bg-zinc-700" : "w-2 bg-zinc-200"}`}
        />
      ))}
    </div>
  );
}

// ─── MAIN: ProductModal ───────────────────────────────────────────────────────
export function ProductModal({
  product,
  onClose,
  onSave,
  darkMode: dm = false,
}) {
  useGoogleFonts();
  const isEdit = !!product;

  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "Sneakers",
    status: product?.status ?? "active",
    description: product?.description ?? "",
    features: Array.isArray(product?.features)
      ? product.features
      : typeof product?.features === "string"
        ? product.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    price: product?.price ?? "",
    discountPrice: product?.discountPrice ?? "",
    costPrice: product?.costPrice ?? "",
    stock: product?.stock ?? "",
    colors: product?.colors ?? [],
    sizes: product?.sizes ?? [],
    tags: product?.tags ?? [],
    weight: product?.weight ?? "",
    dimL: product?.dimensions?.l ?? "",
    dimW: product?.dimensions?.w ?? "",
    dimH: product?.dimensions?.h ?? "",
    metaTitle: product?.metaTitle ?? "",
    metaDescription: product?.metaDescription ?? "",
    imageUrl: product?.image ?? "",
    imageFile: null,
  });

  const set = useCallback((k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => {
      const n = { ...p };
      delete n[k];
      return n;
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || isNaN(+form.price) || +form.price < 0)
      e.price = "Enter a valid price";
    if (form.stock === "" || isNaN(+form.stock) || +form.stock < 0)
      e.stock = "Enter a valid stock quantity";
    if (form.discountPrice && +form.discountPrice >= +form.price)
      e.discountPrice = "Sale price must be below the regular price";
    if (form.costPrice && +form.costPrice > +form.price)
      e.costPrice = "Cost should not exceed selling price";
    return e;
  };

  const tabHasErr = (tabId, errs) =>
    (TAB_FIELDS[tabId] || []).some((f) => errs[f]);

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const first = TABS.find((t) => tabHasErr(t.id, e));
      if (first) setTab(first.id);
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      if (isEdit) fd.append("id", product.id ?? product._id);
      fd.append("name", form.name.trim());
      fd.append("sku", form.sku.trim().toUpperCase());
      fd.append("category", form.category);
      fd.append("status", form.status);
      fd.append("description", form.description);
      fd.append("features", JSON.stringify(form.features));
      fd.append("price", form.price);
      fd.append("discountPrice", form.discountPrice || "");
      fd.append("costPrice", form.costPrice || "");
      fd.append("stock", form.stock);
      fd.append("colors", JSON.stringify(form.colors));
      fd.append("sizes", JSON.stringify(form.sizes));
      fd.append("tags", JSON.stringify(form.tags));
      fd.append("weight", form.weight || "");
      fd.append(
        "dimensions",
        JSON.stringify({ l: form.dimL, w: form.dimW, h: form.dimH }),
      );
      fd.append("metaTitle", form.metaTitle);
      fd.append("metaDescription", form.metaDescription);
      if (form.imageFile) fd.append("image", form.imageFile);
      await onSave(fd, isEdit);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const tabIdx = TABS.findIndex((t) => t.id === tab);
  const canNext = tabIdx < TABS.length - 1;
  const canPrev = tabIdx > 0;

  // ── Section card helper (used inside tabs) ──────────────────────────────────
  const Card = ({ children }) => (
    <div
      className={`rounded-xl border p-4 space-y-3.5 ${dm ? "bg-zinc-800/40 border-zinc-700" : "bg-zinc-50/80 border-zinc-200"}`}
    >
      {children}
    </div>
  );

  const CardHeader = ({ icon: Icon, title }) => (
    <div
      className={`flex items-center gap-2 pb-2 border-b ${dm ? "border-zinc-700" : "border-zinc-200/80"}`}
    >
      <Icon size={13} className="text-amber-500" />
      <span
        className={`text-[11px] font-black uppercase tracking-widest ${dm ? "text-zinc-400" : "text-zinc-500"}`}
      >
        {title}
      </span>
    </div>
  );

  // ── Render active tab ───────────────────────────────────────────────────────
  const renderTab = () => {
    switch (tab) {
      /* ───────────── GENERAL ───────────── */
      case "general":
        return (
          <div className="space-y-4">
            {/* Image */}
            <Field
              label="Product Image"
              dm={dm}
              hint="PNG / JPG / WEBP · max 5 MB"
            >
              <ImageUpload
                value={form.imageUrl}
                onChange={(f, u) => {
                  set("imageFile", f);
                  set("imageUrl", u);
                }}
                dm={dm}
              />
            </Field>

            {/* Name */}
            <Field label="Product Name" required dm={dm} error={errors.name}>
              <input
                className={tk.input(dm, errors.name)}
                placeholder="e.g. SolexAir Pro Max"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoFocus
              />
            </Field>

            {/* SKU + Category */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU" required dm={dm} error={errors.sku}>
                <input
                  className={tk.input(dm, errors.sku)}
                  placeholder="SX-0001"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                />
              </Field>
              <Field label="Category" dm={dm}>
                <Sel
                  dm={dm}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  options={CATEGORIES}
                />
              </Field>
            </div>

            {/* Status */}
            <Field label="Visibility Status" dm={dm}>
              <StatusBar
                value={form.status}
                onChange={(v) => set("status", v)}
                dm={dm}
              />
            </Field>

            {/* Description */}
            <Field label="Description" dm={dm} hint="Shown on product page">
              <textarea
                rows={3}
                className={tk.textarea(dm)}
                placeholder="Describe the product in 1–3 sentences…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>

            {/* Features */}
            <Card>
              <CardHeader icon={Check} title="Key Features" />
              <p
                className={`text-[11px] ${dm ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Add bullet-point features displayed on the product page. Press
                Enter or click + to add each one.
              </p>
              <FeaturesInput
                values={form.features}
                onChange={(v) => set("features", v)}
                dm={dm}
              />
            </Card>
          </div>
        );

      /* ───────────── PRICING ───────────── */
      case "pricing":
        return (
          <div className="space-y-4">
            {/* Info banner */}
            <div
              className={`rounded-xl border p-3.5 flex items-start gap-3 ${dm ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200/70"}`}
            >
              <DollarSign
                size={15}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <p
                className={`text-[12px] font-medium leading-relaxed ${dm ? "text-zinc-400" : "text-zinc-600"}`}
              >
                Set the selling price and optional sale price. Cost price is
                private — used only for internal margin calculations.
              </p>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="MRP / Selling Price (₹)"
                required
                dm={dm}
                error={errors.price}
              >
                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    className={`${tk.input(dm, errors.price)} pl-7`}
                    placeholder="8,999"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                  />
                </div>
              </Field>
              <Field
                label="Sale Price (₹)"
                dm={dm}
                error={errors.discountPrice}
                hint="Optional"
              >
                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    className={`${tk.input(dm, errors.discountPrice)} pl-7`}
                    placeholder="6,999"
                    value={form.discountPrice}
                    onChange={(e) => set("discountPrice", e.target.value)}
                  />
                </div>
              </Field>
            </div>

            {/* Cost + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Cost Price (₹)"
                dm={dm}
                error={errors.costPrice}
                hint="Private"
              >
                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    className={`${tk.input(dm, errors.costPrice)} pl-7`}
                    placeholder="4,500"
                    value={form.costPrice}
                    onChange={(e) => set("costPrice", e.target.value)}
                  />
                </div>
              </Field>
              <Field
                label="Stock Quantity"
                required
                dm={dm}
                error={errors.stock}
              >
                <input
                  type="number"
                  min="0"
                  className={tk.input(dm, errors.stock)}
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>
            </div>

            {/* Live margin preview */}
            {form.price &&
              form.costPrice &&
              +form.price > 0 &&
              +form.costPrice > 0 && (
                <Card>
                  <CardHeader icon={DollarSign} title="Margin Preview" />
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      {
                        label: "Profit",
                        value: `₹${(+form.price - +form.costPrice).toLocaleString("en-IN")}`,
                      },
                      {
                        label: "Margin",
                        value: `${Math.round(((+form.price - +form.costPrice) / +form.price) * 100)}%`,
                      },
                      {
                        label: "Markup",
                        value: `${Math.round(((+form.price - +form.costPrice) / +form.costPrice) * 100)}%`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p
                          className={`text-[20px] font-black ${dm ? "text-amber-400" : "text-amber-600"}`}
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                          }}
                        >
                          {value}
                        </p>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
          </div>
        );

      /* ───────────── VARIANTS ───────────── */
      case "variants":
        return (
          <div className="space-y-5">
            {/* Colors */}
            <Card>
              <CardHeader icon={Info} title="Colors" />
              <p
                className={`text-[11px] ${dm ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Type a color name and press Enter or comma. Recognized names get
                automatic color dots.
              </p>
              <TagInput
                values={form.colors}
                onChange={(v) => set("colors", v)}
                placeholder="red, blue, black, navy…"
                dm={dm}
                colorMode
              />
            </Card>

            {/* Sizes */}
            <Card>
              <CardHeader icon={Layers} title="Sizes" />
              <SizeSelector
                selected={form.sizes}
                onChange={(v) => set("sizes", v)}
                dm={dm}
              />
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader icon={Hash} title="Product Tags" />
              <p
                className={`text-[11px] ${dm ? "text-zinc-600" : "text-zinc-400"}`}
              >
                Tags help with filtering, search, and collections. Type + Enter
                to add.
              </p>
              <TagInput
                values={form.tags}
                onChange={(v) => set("tags", v)}
                placeholder="summer, sale, new-arrival, bestseller…"
                dm={dm}
              />
            </Card>
          </div>
        );

      /* ───────────── SHIPPING & SEO ───────────── */
      case "shipping":
        return (
          <div className="space-y-5">
            {/* Package */}
            <Card>
              <CardHeader icon={Truck} title="Package Details" />
              <Field label="Weight (grams)" dm={dm}>
                <input
                  type="number"
                  min="0"
                  className={tk.input(dm, false)}
                  placeholder="450"
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["dimL", "Length (cm)", "30"],
                  ["dimW", "Width (cm)", "20"],
                  ["dimH", "Height (cm)", "15"],
                ].map(([k, lbl, ph]) => (
                  <Field key={k} label={lbl} dm={dm}>
                    <input
                      type="number"
                      min="0"
                      className={tk.input(dm, false)}
                      placeholder={ph}
                      value={form[k]}
                      onChange={(e) => set(k, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader icon={Hash} title="SEO / Meta" />
              <Field
                label="Meta Title"
                dm={dm}
                hint={`${form.metaTitle.length}/60`}
              >
                <input
                  maxLength={60}
                  className={tk.input(dm, false)}
                  placeholder={
                    form.name || "Product page title for search engines"
                  }
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                />
              </Field>
              <Field
                label="Meta Description"
                dm={dm}
                hint={`${form.metaDescription.length}/160`}
              >
                <textarea
                  rows={3}
                  maxLength={160}
                  className={tk.textarea(dm)}
                  placeholder="Brief description for search engine snippets…"
                  value={form.metaDescription}
                  onChange={(e) => set("metaDescription", e.target.value)}
                />
              </Field>

              {/* Live search preview */}
              {(form.metaTitle || form.name) && (
                <div
                  className={`rounded-xl p-3.5 border ${dm ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"}`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    Search Preview
                  </p>
                  <p className="text-blue-500 text-[13.5px] font-medium leading-snug truncate">
                    {form.metaTitle || form.name}
                  </p>
                  <p
                    className={`text-[11.5px] mt-0.5 line-clamp-2 ${dm ? "text-zinc-500" : "text-zinc-500"}`}
                  >
                    {form.metaDescription ||
                      form.description ||
                      "No description provided."}
                  </p>
                </div>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const font = { fontFamily: "'DM Sans', sans-serif" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={font}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />

      {/* ── Shell ────────────────────────────────────────────────────────── */}
      <div
        className={[
          "relative w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col",
          "max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-2.5rem)]",
          dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200/80",
        ].join(" ")}
        style={{
          boxShadow: dm
            ? "0 25px 60px rgba(0,0,0,0.75)"
            : "0 25px 60px rgba(0,0,0,0.16)",
        }}
      >
        {/* ── HEADER + TAB BAR ─────────────────────────────────────────── */}
        <div
          className={`shrink-0 border-b ${dm ? "border-zinc-800" : "border-zinc-100"}`}
        >
          {/* Title row */}
          <div className="flex items-start justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dm ? "bg-amber-500/10" : "bg-amber-50"}`}
              >
                <Package size={16} className="text-amber-500" />
              </div>
              <div>
                <h2
                  className={`text-[16px] font-black leading-none ${dm ? "text-white" : "text-zinc-900"}`}
                  style={{
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isEdit ? "EDIT PRODUCT" : "NEW PRODUCT"}
                </h2>
                <p
                  className={`text-[11px] mt-0.5 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  {isEdit
                    ? `Editing · ${product.name}`
                    : "Complete all sections for best results"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <TabProgress tabs={TABS} current={tab} dm={dm} />
              <button
                onClick={onClose}
                aria-label="Close"
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100"}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex px-3">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              const hasErr = tabHasErr(t.id, errors);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    "relative flex items-center gap-1.5 px-3 py-2.5 text-[11.5px] font-bold",
                    "border-b-2 -mb-px transition-all duration-150",
                    active
                      ? `border-amber-500 ${dm ? "text-amber-400" : "text-amber-600"}`
                      : `border-transparent ${dm ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`,
                  ].join(" ")}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{t.label}</span>
                  {hasErr && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-2 right-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-5 py-4">
          {renderTab()}
          <div className="h-1" />
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div
          className={[
            "shrink-0 flex items-center justify-between gap-3 px-5 py-3.5 border-t backdrop-blur-sm",
            dm
              ? "border-zinc-800 bg-zinc-900/90"
              : "border-zinc-100 bg-white/95",
          ].join(" ")}
        >
          {/* Left: back + step counter */}
          <div className="flex items-center gap-2">
            {canPrev && (
              <button
                type="button"
                onClick={() => setTab(TABS[tabIdx - 1].id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-colors ${dm ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"}`}
              >
                <ArrowLeft size={12} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <span
              className={`text-[11px] font-medium ${dm ? "text-zinc-600" : "text-zinc-400"}`}
            >
              {tabIdx + 1} / {TABS.length}
            </span>
          </div>

          {/* Right: cancel + next/save */}
          <div className="flex items-center gap-2">
            {Object.keys(errors).length > 0 && (
              <span className="text-[10.5px] text-red-500 font-semibold hidden sm:block">
                Fix highlighted errors
              </span>
            )}
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold border transition-colors disabled:opacity-50 ${dm ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}
            >
              Cancel
            </button>

            {canNext ? (
              <button
                type="button"
                onClick={() => setTab(TABS[tabIdx + 1].id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_18px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Next <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12.5px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_10px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_18px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isEdit ? "Save Changes" : "Create Product"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
export function DeleteModal({
  product,
  onClose,
  onConfirm,
  darkMode: dm = false,
}) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm(product.id ?? product._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}
        style={{
          boxShadow: dm
            ? "0 25px 60px rgba(0,0,0,0.75)"
            : "0 25px 60px rgba(0,0,0,0.16)",
        }}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100"}`}
        >
          <X size={14} />
        </button>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto ${dm ? "bg-red-500/10" : "bg-red-50"}`}
        >
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        <h3
          className={`text-[18px] font-black text-center mb-1 ${dm ? "text-white" : "text-zinc-900"}`}
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          DELETE PRODUCT
        </h3>
        <p
          className={`text-[12.5px] text-center mb-1 ${dm ? "text-zinc-400" : "text-zinc-500"}`}
        >
          Are you sure you want to delete
        </p>
        <p
          className={`text-[13.5px] font-bold text-center mb-4 truncate px-4 ${dm ? "text-zinc-200" : "text-zinc-800"}`}
        >
          "{product.name}"
        </p>
        <p
          className={`text-[11.5px] text-center mb-5 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
        >
          This will permanently remove the product and cannot be undone.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${dm ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-red-500 text-white hover:bg-red-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-[0_2px_10px_rgba(239,68,68,0.3)]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BULK DELETE MODAL ────────────────────────────────────────────────────────
export function BulkDeleteModal({
  count,
  onClose,
  onConfirm,
  darkMode: dm = false,
}) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans',sans-serif" }}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 ${dm ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"}`}
        style={{
          boxShadow: dm
            ? "0 25px 60px rgba(0,0,0,0.75)"
            : "0 25px 60px rgba(0,0,0,0.16)",
        }}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100"}`}
        >
          <X size={14} />
        </button>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto ${dm ? "bg-red-500/10" : "bg-red-50"}`}
        >
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        <h3
          className={`text-[18px] font-black text-center mb-1 ${dm ? "text-white" : "text-zinc-900"}`}
          style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          BULK DELETE
        </h3>
        <p
          className={`text-[12.5px] text-center mb-5 ${dm ? "text-zinc-400" : "text-zinc-500"}`}
        >
          Permanently delete{" "}
          <span
            className={`font-bold ${dm ? "text-zinc-200" : "text-zinc-800"}`}
          >
            {count} product{count !== 1 ? "s" : ""}
          </span>
          ? This cannot be undone.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${dm ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-red-500 text-white hover:bg-red-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-[0_2px_10px_rgba(239,68,68,0.3)]"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete {count}
          </button>
        </div>
      </div>
    </div>
  );
}
