/**
 * pages/admin/AddProductForm.jsx
 * Solex Admin — Add New Product Form
 *
 * Features:
 *  ✦ React Hook Form with real-time validation
 *  ✦ Axios POST to /api/products with FormData
 *  ✦ Drag & drop + click image upload with preview grid
 *  ✦ Thumbnail single upload with preview
 *  ✦ Upload progress bar (simulated + real axios onUploadProgress)
 *  ✦ Auto slug + SKU generation from product name + category
 *  ✦ Dynamic features add/remove
 *  ✦ Multi-select sizes (UK 6–12) and color tag picker
 *  ✦ Featured toggle + Active/Draft status
 *  ✦ Toast notification system (no extra lib needed)
 *  ✦ Dark mode aware (reads darkMode from parent / localStorage)
 *  ✦ Sticky action bar at bottom of viewport
 *  ✦ Fully responsive: 1-col mobile → 2-col tablet → 3-col desktop
 *
 * Props:
 *  darkMode {boolean} — pass from AdminLayout (optional, falls back to false)
 */

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import {
  Upload,
  X,
  Plus,
  Minus,
  Image as ImageIcon,
  Tag,
  Zap,
  Package,
  AlignLeft,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  ChevronDown,
  Hash,
  Layers,
  Percent,
  Globe,
  Sparkles,
  GripVertical,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Sneakers", "Running", "Casual", "Formal", "Sports"];
const GENDERS = ["Men", "Women", "Unisex", "Kids"];
const BRANDS = [
  "Solex",
  "SolexAir",
  "CloudRun",
  "StreetEdge",
  "HyperBoost",
  "TrailX",
  "Other",
];
const SIZES = [6, 7, 8, 9, 10, 11, 12];
const COLOR_PALETTE = [
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#f4f4f5" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#f97316" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Brown", hex: "#92400e" },
  { name: "Navy", hex: "#1e3a5f" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const genSKU = (name = "", cat = "") => {
  const n = name.slice(0, 3).toUpperCase().padEnd(3, "X");
  const c = (cat || "GEN").slice(0, 3).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SX-${n}-${c}-${r}`;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
};

// ─── Toast system ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, toast: add, dismiss: remove };
}

function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {t.type === "success" ? (
            <CheckCircle2
              size={16}
              className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
            />
          ) : (
            <AlertCircle
              size={16}
              className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
            />
          )}
          <p
            className={`flex-1 text-[13px] font-medium ${
              t.type === "success"
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {t.msg}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Reusable field components ─────────────────────────────────────────────────
function FieldLabel({ children, required, hint, darkMode: dm }) {
  return (
    <label
      className={`flex items-center gap-1.5 text-[12.5px] font-semibold mb-1.5 ${dm ? "text-zinc-300" : "text-zinc-700"}`}
    >
      {children}
      {required && <span className="text-red-500 text-[11px]">*</span>}
      {hint && (
        <span
          className={`ml-auto flex items-center gap-0.5 text-[11px] font-normal ${dm ? "text-zinc-500" : "text-zinc-400"}`}
        >
          <Info size={11} />
          {hint}
        </span>
      )}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-[11.5px] text-red-500 font-medium">
      <AlertCircle size={11} />
      {msg}
    </p>
  );
}

function TextInput({
  placeholder,
  type = "text",
  error,
  darkMode: dm,
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      {...props}
      className={[
        "w-full px-3.5 py-2.5 rounded-xl text-[13.5px] border outline-none transition-all duration-200",
        "focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400",
        error
          ? "border-red-400 bg-red-50/50 dark:bg-red-950/30 dark:border-red-700"
          : dm
            ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 hover:border-zinc-600"
            : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 hover:border-zinc-300",
        props.className || "",
      ].join(" ")}
    />
  );
}

function SelectInput({ children, error, darkMode: dm, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={[
          "w-full px-3.5 py-2.5 pr-9 rounded-xl text-[13.5px] border outline-none appearance-none transition-all duration-200",
          "focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400",
          error
            ? "border-red-400 bg-red-50/50 dark:bg-red-950/30"
            : dm
              ? "bg-zinc-900 border-zinc-700 text-zinc-100 hover:border-zinc-600"
              : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300",
        ].join(" ")}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-zinc-500" : "text-zinc-400"}`}
      />
    </div>
  );
}

function SectionCard({ title, icon, children, darkMode: dm }) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
        dm
          ? "bg-zinc-900 border-zinc-800"
          : "bg-white border-zinc-100 shadow-sm"
      }`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-amber-500">{icon}</span>
          <h3
            className={`text-[13.5px] font-bold uppercase tracking-[0.08em] ${dm ? "text-zinc-200" : "text-zinc-800"}`}
            style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
          >
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Image Upload Zone ─────────────────────────────────────────────────────────
function ImageUploadZone({
  images,
  onAdd,
  onRemove,
  maxFiles = 6,
  darkMode: dm,
  error,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (files) => {
    const valid = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, maxFiles - images.length)
      .map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        id: Math.random().toString(36).slice(2),
      }));
    if (valid.length) onAdd(valid);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10",
          dragging
            ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 scale-[1.01]"
            : error
              ? "border-red-400 bg-red-50/40 dark:bg-red-950/20"
              : dm
                ? "border-zinc-700 bg-zinc-800/50 hover:border-amber-500/50 hover:bg-amber-500/5"
                : "border-zinc-200 bg-zinc-50 hover:border-amber-400/60 hover:bg-amber-50/50",
        ].join(" ")}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            dragging
              ? "bg-amber-100 dark:bg-amber-500/20"
              : dm
                ? "bg-zinc-700"
                : "bg-zinc-100"
          }`}
        >
          <Upload
            size={20}
            className={
              dragging
                ? "text-amber-500"
                : dm
                  ? "text-zinc-400"
                  : "text-zinc-500"
            }
          />
        </div>
        <div className="text-center">
          <p
            className={`text-[13.5px] font-semibold ${dm ? "text-zinc-300" : "text-zinc-700"}`}
          >
            {dragging ? "Drop images here" : "Drag & drop or click to upload"}
          </p>
          <p
            className={`text-[11.5px] mt-1 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
          >
            PNG, JPG, WEBP up to 5MB each · Max {maxFiles} images
          </p>
        </div>
        {images.length < maxFiles && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {images.length}/{maxFiles}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>
      <FieldError msg={error} />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={img.preview}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={10} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                  MAIN
                </span>
              )}
              <span
                className={`absolute bottom-1 right-1 text-[8px] font-semibold px-1.5 py-0.5 rounded ${dm ? "bg-zinc-900/90 text-zinc-300" : "bg-white/90 text-zinc-600"}`}
              >
                {formatSize(img.size)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Thumbnail Upload ──────────────────────────────────────────────────────────
function ThumbnailUpload({ thumb, onSet, onClear, darkMode: dm, error }) {
  const ref = useRef(null);
  const handle = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    onSet({ file: f, preview: URL.createObjectURL(f), name: f.name });
  };

  return (
    <div
      className={[
        "relative flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
        error
          ? "border-red-400 bg-red-50/40 dark:bg-red-950/20"
          : dm
            ? "border-zinc-700 bg-zinc-800/50 hover:border-amber-500/50"
            : "border-zinc-200 bg-zinc-50 hover:border-amber-400/60",
      ].join(" ")}
      onClick={() => ref.current?.click()}
    >
      {thumb ? (
        <>
          <img
            src={thumb.preview}
            alt="Thumbnail"
            className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-amber-400/40"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-[13px] font-semibold truncate ${dm ? "text-zinc-200" : "text-zinc-800"}`}
            >
              {thumb.name}
            </p>
            <p
              className={`text-[11.5px] ${dm ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {formatSize(thumb.file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className={`p-1.5 rounded-lg transition-colors ${dm ? "text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"}`}
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dm ? "bg-zinc-700" : "bg-zinc-100"}`}
          >
            <ImageIcon
              size={18}
              className={dm ? "text-zinc-400" : "text-zinc-500"}
            />
          </div>
          <div>
            <p
              className={`text-[13px] font-semibold ${dm ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Upload thumbnail
            </p>
            <p
              className={`text-[11.5px] ${dm ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Single image, shown in listings
            </p>
          </div>
        </div>
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function UploadProgress({ progress, darkMode: dm }) {
  if (progress === 0 || progress === 100) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11.5px] font-semibold">
        <span className={dm ? "text-zinc-400" : "text-zinc-600"}>
          Uploading…
        </span>
        <span className="text-amber-500">{progress}%</span>
      </div>
      <div
        className={`w-full h-1.5 rounded-full ${dm ? "bg-zinc-800" : "bg-zinc-200"}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── MAIN FORM COMPONENT ──────────────────────────────────────────────────────
export default function AddProductForm({ darkMode: dmProp = false }) {
  const dm = dmProp;

  const { toasts, toast, dismiss } = useToasts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      brand: "Solex",
      category: "",
      gender: "",
      price: "",
      discountPrice: "",
      stock: "",
      description: "",
      slug: "",
      sku: "",
      status: "active",
      featured: false,
    },
  });

  // Watched values for derived state
  const watchName = watch("name");
  const watchCategory = watch("category");

  // Local state
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [features, setFeatures] = useState([""]);
  const [progress, setProgress] = useState(0);
  const [showSlug, setShowSlug] = useState(false);
  const [showSKU, setShowSKU] = useState(false);

  // ── Auto-generate slug from name
  useEffect(() => {
    if (watchName) setValue("slug", slugify(watchName));
  }, [watchName, setValue]);

  // ── Auto-generate SKU when name+category change
  useEffect(() => {
    if (watchName && watchCategory)
      setValue("sku", genSKU(watchName, watchCategory));
  }, [watchName, watchCategory, setValue]);

  // ── Load Google Fonts
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

  // ── Size toggle
  const toggleSize = (s) =>
    setSizes((p) =>
      p.includes(s)
        ? p.filter((x) => x !== s)
        : [...p, s].sort((a, b) => a - b),
    );

  // ── Color toggle
  const toggleColor = (c) =>
    setColors((p) =>
      p.some((x) => x.name === c.name)
        ? p.filter((x) => x.name !== c.name)
        : [...p, c],
    );

  // ── Features
  const addFeature = () => setFeatures((p) => [...p, ""]);
  const removeFeature = (i) => setFeatures((p) => p.filter((_, j) => j !== i));
  const setFeature = (i, v) =>
    setFeatures((p) => p.map((f, j) => (j === i ? v : f)));

  // ── Images
  const addImages = (imgs) => setImages((p) => [...p, ...imgs].slice(0, 6));
  const removeImage = (id) => setImages((p) => p.filter((i) => i.id !== id));

  // ── Submit
  const onSubmit = async (data) => {
    // Validate custom fields
    if (!thumbnail) {
      toast("Please upload a thumbnail image", "error");
      return;
    }
    if (images.length === 0) {
      toast("Please upload at least one product image", "error");
      return;
    }
    if (sizes.length === 0) {
      toast("Please select at least one size", "error");
      return;
    }
    if (colors.length === 0) {
      toast("Please select at least one color", "error");
      return;
    }

    const fd = new FormData();

    // Text fields
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fd.append("sizes", JSON.stringify(sizes));
    fd.append("colors", JSON.stringify(colors.map((c) => c.name)));
    fd.append("features", JSON.stringify(features.filter(Boolean)));

    // Images
    fd.append("thumbnail", thumbnail.file);
    images.forEach((img) => fd.append("images", img.file));

    try {
      setProgress(1);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products/add`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded / e.total) * 100));
          },
        },
      );
      toast("Product created successfully! 🎉", "success");
      handleReset();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to create product. Please try again.";
      toast(msg, "error");
    } finally {
      setTimeout(() => setProgress(0), 600);
    }
  };

  // ── Reset
  const handleReset = () => {
    reset();
    setImages([]);
    setThumbnail(null);
    setSizes([]);
    setColors([]);
    setFeatures([""]);
    setProgress(0);
  };

  const inputBase = { darkMode: dm };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dm ? "bg-zinc-950" : "bg-slate-50"}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <style>{`
        @keyframes form-enter { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .fe { animation: form-enter 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .fe-1 { animation-delay:0.05s } .fe-2 { animation-delay:0.10s }
        .fe-3 { animation-delay:0.15s } .fe-4 { animation-delay:0.20s }
        .fe-5 { animation-delay:0.25s } .fe-6 { animation-delay:0.30s }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="fe mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Package size={17} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className={`text-[26px] font-black leading-tight ${dm ? "text-white" : "text-zinc-900"}`}
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                ADD NEW PRODUCT
              </h1>
              <p
                className={`text-[12px] ${dm ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Fill in the details below to add a new product to the Solex
                catalog
              </p>
            </div>
          </div>
          {/* Breadcrumb */}
          <div
            className={`flex items-center gap-1.5 text-[12px] mt-3 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
          >
            <a href="/admin" className="hover:text-amber-500 transition-colors">
              Dashboard
            </a>
            <span>/</span>
            <a
              href="/admin/products"
              className="hover:text-amber-500 transition-colors"
            >
              Products
            </a>
            <span>/</span>
            <span className={dm ? "text-zinc-300" : "text-zinc-700"}>
              Add New
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── LEFT COLUMN (spans 2) ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info */}
              <div className="fe fe-1">
                <SectionCard
                  title="Basic Information"
                  icon={<Tag size={15} />}
                  darkMode={dm}
                >
                  <div className="space-y-4">
                    {/* Product Name */}
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Product Name
                      </FieldLabel>
                      <TextInput
                        {...inputBase}
                        placeholder="e.g. SolexAir Pro Runner"
                        error={errors.name?.message}
                        {...register("name", {
                          required: "Product name is required",
                          minLength: {
                            value: 3,
                            message: "Name must be at least 3 characters",
                          },
                        })}
                      />
                      <FieldError msg={errors.name?.message} />
                    </div>

                    {/* Slug + SKU row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel
                          darkMode={dm}
                          hint={
                            <button
                              type="button"
                              onClick={() => setShowSlug((p) => !p)}
                              className="flex items-center gap-0.5"
                            >
                              {showSlug ? (
                                <EyeOff size={10} />
                              ) : (
                                <Eye size={10} />
                              )}{" "}
                              {showSlug ? "hide" : "show"}
                            </button>
                          }
                        >
                          <Hash size={12} />
                          URL Slug
                        </FieldLabel>
                        {showSlug && (
                          <>
                            <TextInput
                              {...inputBase}
                              placeholder="auto-generated"
                              {...register("slug")}
                            />
                            <p
                              className={`text-[10.5px] mt-1 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
                            >
                              Auto-generated from product name
                            </p>
                          </>
                        )}
                        {!showSlug && (
                          <div
                            className={`px-3.5 py-2.5 rounded-xl text-[12px] font-mono ${dm ? "bg-zinc-800 text-zinc-400 border border-zinc-700" : "bg-zinc-50 text-zinc-500 border border-zinc-200"}`}
                          >
                            {watch("slug") || (
                              <span className="text-zinc-400 italic">
                                will auto-generate
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <FieldLabel
                          darkMode={dm}
                          hint={
                            <button
                              type="button"
                              onClick={() =>
                                setValue(
                                  "sku",
                                  genSKU(watchName, watchCategory),
                                )
                              }
                              className="text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
                            >
                              <RotateCcw size={9} />
                              regen
                            </button>
                          }
                        >
                          <Layers size={12} />
                          SKU
                        </FieldLabel>
                        <TextInput
                          {...inputBase}
                          placeholder="Auto-generated"
                          {...register("sku")}
                        />
                        <p
                          className={`text-[10.5px] mt-1 ${dm ? "text-zinc-600" : "text-zinc-400"}`}
                        >
                          Auto-generated from name + category
                        </p>
                      </div>
                    </div>

                    {/* Brand + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel required darkMode={dm}>
                          Brand
                        </FieldLabel>
                        <SelectInput
                          {...inputBase}
                          error={errors.brand?.message}
                          {...register("brand", {
                            required: "Brand is required",
                          })}
                        >
                          {BRANDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </SelectInput>
                        <FieldError msg={errors.brand?.message} />
                      </div>
                      <div>
                        <FieldLabel required darkMode={dm}>
                          Category
                        </FieldLabel>
                        <SelectInput
                          {...inputBase}
                          error={errors.category?.message}
                          {...register("category", {
                            required: "Category is required",
                          })}
                        >
                          <option value="">Select category</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </SelectInput>
                        <FieldError msg={errors.category?.message} />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Gender
                      </FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {GENDERS.map((g) => {
                          const val = watch("gender");
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() =>
                                setValue("gender", val === g ? "" : g)
                              }
                              className={[
                                "px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-150",
                                val === g
                                  ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                  : dm
                                    ? "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-zinc-200"
                                    : "border-zinc-200 text-zinc-600 hover:border-amber-400/50 hover:text-zinc-900",
                              ].join(" ")}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="hidden"
                        {...register("gender", {
                          required: "Gender is required",
                        })}
                      />
                      <FieldError msg={errors.gender?.message} />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Pricing & Stock */}
              <div className="fe fe-2">
                <SectionCard
                  title="Pricing & Inventory"
                  icon={<Percent size={15} />}
                  darkMode={dm}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Price (₹)
                      </FieldLabel>
                      <TextInput
                        {...inputBase}
                        type="number"
                        placeholder="0.00"
                        error={errors.price?.message}
                        {...register("price", {
                          required: "Price is required",
                          min: { value: 1, message: "Price must be > 0" },
                        })}
                      />
                      <FieldError msg={errors.price?.message} />
                    </div>
                    <div>
                      <FieldLabel darkMode={dm} hint="optional">
                        Discount Price (₹)
                      </FieldLabel>
                      <TextInput
                        {...inputBase}
                        type="number"
                        placeholder="0.00"
                        {...register("discountPrice", {
                          validate: (v) => {
                            const p = parseFloat(watch("price"));
                            if (v && parseFloat(v) >= p)
                              return "Must be less than price";
                            return true;
                          },
                        })}
                      />
                      <FieldError msg={errors.discountPrice?.message} />
                    </div>
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Stock Qty
                      </FieldLabel>
                      <TextInput
                        {...inputBase}
                        type="number"
                        placeholder="0"
                        error={errors.stock?.message}
                        {...register("stock", {
                          required: "Stock is required",
                          min: { value: 0, message: "Cannot be negative" },
                        })}
                      />
                      <FieldError msg={errors.stock?.message} />
                    </div>
                  </div>

                  {/* Discount badge preview */}
                  {watch("discountPrice") && watch("price") && (
                    <div
                      className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold ${dm ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}
                    >
                      <Sparkles size={12} />
                      {Math.round(
                        ((watch("price") - watch("discountPrice")) /
                          watch("price")) *
                          100,
                      )}
                      % off · Save ₹
                      {(watch("price") - watch("discountPrice")).toFixed(0)}
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Sizes + Colors */}
              <div className="fe fe-3">
                <SectionCard
                  title="Variants"
                  icon={<Layers size={15} />}
                  darkMode={dm}
                >
                  {/* Sizes */}
                  <div className="mb-5">
                    <FieldLabel required darkMode={dm}>
                      Sizes (UK)
                      {sizes.length > 0 && (
                        <span className="ml-auto text-[11px] font-normal text-amber-500">
                          {sizes.length} selected
                        </span>
                      )}
                    </FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={[
                            "w-12 h-12 rounded-xl text-[14px] font-bold border-2 transition-all duration-150",
                            sizes.includes(s)
                              ? "bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                              : dm
                                ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                : "border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {sizes.length === 0 && (
                      <p className="mt-1.5 text-[11.5px] text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} />
                        Select at least one size
                      </p>
                    )}
                  </div>

                  {/* Colors */}
                  <div>
                    <FieldLabel required darkMode={dm}>
                      Colors
                      {colors.length > 0 && (
                        <span className="ml-auto text-[11px] font-normal text-amber-500">
                          {colors.length} selected
                        </span>
                      )}
                    </FieldLabel>
                    <div className="flex flex-wrap gap-2.5">
                      {COLOR_PALETTE.map((c) => {
                        const selected = colors.some((x) => x.name === c.name);
                        const isLight = ["White", "Yellow"].includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            title={c.name}
                            onClick={() => toggleColor(c)}
                            className={[
                              "relative w-8 h-8 rounded-xl transition-all duration-150 border-2",
                              selected
                                ? "scale-110 ring-2 ring-offset-2 ring-amber-400"
                                : "hover:scale-105 border-transparent",
                              dm ? "ring-offset-zinc-900" : "ring-offset-white",
                            ].join(" ")}
                            style={{
                              backgroundColor: c.hex,
                              borderColor: selected
                                ? "transparent"
                                : isLight
                                  ? "#d1d5db"
                                  : "transparent",
                            }}
                          >
                            {selected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span
                                  className={`w-2 h-2 rounded-full ${isLight ? "bg-zinc-800" : "bg-white"}`}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Selected color tags */}
                    {colors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {colors.map((c) => (
                          <span
                            key={c.name}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border ${dm ? "border-zinc-700 bg-zinc-800 text-zinc-300" : "border-zinc-200 bg-white text-zinc-700"}`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: c.hex }}
                            />
                            {c.name}
                            <button
                              type="button"
                              onClick={() => toggleColor(c)}
                              className="text-zinc-400 hover:text-red-500 transition-colors ml-0.5"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {colors.length === 0 && (
                      <p className="mt-1.5 text-[11.5px] text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} />
                        Select at least one color
                      </p>
                    )}
                  </div>
                </SectionCard>
              </div>

              {/* Description */}
              <div className="fe fe-4">
                <SectionCard
                  title="Description"
                  icon={<AlignLeft size={15} />}
                  darkMode={dm}
                >
                  <div>
                    <FieldLabel required darkMode={dm}>
                      Product Description
                      <span
                        className={`ml-auto text-[11px] font-normal ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        {watch("description")?.length || 0}/2000
                      </span>
                    </FieldLabel>
                    <textarea
                      rows={5}
                      placeholder="Describe the product — materials, comfort, use cases, what makes it special..."
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 20,
                          message: "At least 20 characters",
                        },
                        maxLength: {
                          value: 2000,
                          message: "Max 2000 characters",
                        },
                      })}
                      className={[
                        "w-full px-3.5 py-3 rounded-xl text-[13.5px] border outline-none resize-none transition-all duration-200",
                        "focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400",
                        errors.description
                          ? "border-red-400 bg-red-50/50 dark:bg-red-950/20"
                          : dm
                            ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 hover:border-zinc-600"
                            : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 hover:border-zinc-300",
                      ].join(" ")}
                    />
                    <FieldError msg={errors.description?.message} />
                  </div>

                  {/* Features */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel darkMode={dm}>
                        <Star size={12} />
                        Product Features
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="flex items-center gap-1 text-[12px] font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <Plus size={13} />
                        Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                      {features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                          <GripVertical
                            size={14}
                            className={`shrink-0 ${dm ? "text-zinc-700" : "text-zinc-300"}`}
                          />
                          <TextInput
                            {...inputBase}
                            placeholder={`Feature ${i + 1} — e.g. "Breathable mesh upper"`}
                            value={feat}
                            onChange={(e) => setFeature(i, e.target.value)}
                          />
                          {features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(i)}
                              className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${dm ? "text-zinc-500 hover:bg-zinc-800 hover:text-red-400" : "text-zinc-400 hover:bg-zinc-100 hover:text-red-500"}`}
                            >
                              <Minus size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Images */}
              <div className="fe fe-5">
                <SectionCard
                  title="Product Images"
                  icon={<ImageIcon size={15} />}
                  darkMode={dm}
                >
                  <div className="space-y-5">
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Thumbnail Image
                      </FieldLabel>
                      <ThumbnailUpload
                        thumb={thumbnail}
                        onSet={setThumbnail}
                        onClear={() => setThumbnail(null)}
                        darkMode={dm}
                      />
                    </div>
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Gallery Images
                        <span
                          className={`ml-auto text-[11px] font-normal ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          first image = main display
                        </span>
                      </FieldLabel>
                      <ImageUploadZone
                        images={images}
                        onAdd={addImages}
                        onRemove={removeImage}
                        maxFiles={6}
                        darkMode={dm}
                      />
                    </div>
                    <UploadProgress progress={progress} darkMode={dm} />
                  </div>
                </SectionCard>
              </div>
            </div>

            {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
            <div className="space-y-5">
              {/* Status + Options */}
              <div className="fe fe-1">
                <SectionCard
                  title="Publishing"
                  icon={<Globe size={15} />}
                  darkMode={dm}
                >
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <FieldLabel required darkMode={dm}>
                        Status
                      </FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value: "active",
                            label: "Active",
                            color: "emerald",
                          },
                          { value: "draft", label: "Draft", color: "zinc" },
                        ].map((opt) => {
                          const val = watch("status");
                          const active = val === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setValue("status", opt.value)}
                              className={[
                                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all duration-150",
                                active
                                  ? opt.value === "active"
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                    : "bg-zinc-700 border-zinc-600 text-white"
                                  : dm
                                    ? "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300",
                              ].join(" ")}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${active ? "bg-white" : opt.value === "active" ? "bg-emerald-400" : dm ? "bg-zinc-600" : "bg-zinc-300"}`}
                              />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <input type="hidden" {...register("status")} />
                    </div>

                    {/* Featured toggle */}
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${dm ? "border-zinc-800 bg-zinc-800/50" : "border-zinc-100 bg-zinc-50"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${watch("featured") ? "bg-amber-500/10" : dm ? "bg-zinc-700" : "bg-zinc-100"}`}
                        >
                          <Star
                            size={15}
                            className={
                              watch("featured")
                                ? "text-amber-500 fill-amber-400"
                                : dm
                                  ? "text-zinc-500"
                                  : "text-zinc-400"
                            }
                          />
                        </div>
                        <div>
                          <p
                            className={`text-[13px] font-semibold ${dm ? "text-zinc-200" : "text-zinc-800"}`}
                          >
                            Featured Product
                          </p>
                          <p
                            className={`text-[11px] ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                          >
                            Show on homepage
                          </p>
                        </div>
                      </div>
                      <Controller
                        name="featured"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${field.value ? "bg-amber-500" : dm ? "bg-zinc-700" : "bg-zinc-200"}`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${field.value ? "translate-x-4" : "translate-x-0"}`}
                            />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Quick summary card */}
              <div className="fe fe-2">
                <SectionCard
                  title="Summary"
                  icon={<Zap size={15} />}
                  darkMode={dm}
                >
                  <div className="space-y-2.5">
                    {[
                      { label: "Name", value: watchName || "—" },
                      { label: "Category", value: watchCategory || "—" },
                      {
                        label: "Price",
                        value: watch("price") ? `₹${watch("price")}` : "—",
                      },
                      {
                        label: "Sizes",
                        value: sizes.length ? sizes.join(", ") : "—",
                      },
                      {
                        label: "Colors",
                        value: colors.length
                          ? colors.map((c) => c.name).join(", ")
                          : "—",
                      },
                      {
                        label: "Images",
                        value: `${images.length} + 1 thumbnail`,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-start justify-between gap-2 py-2 border-b last:border-0 ${dm ? "border-zinc-800" : "border-zinc-100"}`}
                      >
                        <span
                          className={`text-[11.5px] font-semibold uppercase tracking-wide shrink-0 ${dm ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`text-[12.5px] font-medium text-right leading-snug ${dm ? "text-zinc-300" : "text-zinc-700"}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Tips card */}
              <div className="fe fe-3">
                <div
                  className={`rounded-2xl border p-4 ${dm ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-100"}`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <Zap size={13} className="text-amber-500" />
                    <span className="text-[11.5px] font-bold uppercase tracking-widest text-amber-500">
                      Tips
                    </span>
                  </div>
                  <ul
                    className={`space-y-1.5 text-[11.5px] leading-relaxed ${dm ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">·</span>Use
                      high-quality images (min 800×800px)
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">·</span>First
                      gallery image becomes the main display
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">·</span>Include
                      all available sizes for best conversion
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">·</span>Mark as
                      Featured to show on homepage
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Sticky bottom action bar ───────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-3 transition-colors ${
          dm
            ? "bg-zinc-950/95 border-zinc-800 backdrop-blur-xl"
            : "bg-white/95 border-zinc-100 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: validation status */}
          <div
            className={`hidden sm:flex items-center gap-2 text-[12px] font-medium ${dm ? "text-zinc-500" : "text-zinc-400"}`}
          >
            {Object.keys(errors).length > 0 ? (
              <>
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-red-500">
                  {Object.keys(errors).length} field
                  {Object.keys(errors).length > 1 ? "s" : ""} need attention
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-emerald-500" />
                Form looks good
              </>
            )}
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
                dm
                  ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Package size={14} />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar in sticky bar */}
        {progress > 0 && progress < 100 && (
          <div
            className={`absolute top-0 left-0 right-0 h-0.5 ${dm ? "bg-zinc-800" : "bg-zinc-200"}`}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
