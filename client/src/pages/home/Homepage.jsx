/**
 * HomePage.jsx — Solex | Home Page (index)
 *
 * SECTIONS
 * ─────────
 * 1.  Hero          — Full-viewport cinematic banner with animated headline + CTA
 * 2.  Stats Bar     — Live numbers (styles, cities, customers, rating)
 * 3.  Categories    — 6-card sport/gender category grid with hover zoom
 * 4.  Featured Drop — "Just Dropped" editorial product row (4 cards)
 * 5.  Brand Story   — Split layout: big text left, image mosaic right
 * 6.  Best Sellers  — Horizontal scroll strip of top-selling products
 * 7.  Promo Banner  — Full-width "Sale" CTA with diagonal stripe bg
 * 8.  Testimonials  — 3-col customer review cards
 * 9.  Instagram Grid— 6-cell UGC photo wall
 * 10. Newsletter     — Email capture with amber CTA
 *
 * IMAGES
 * ──────
 * All shoe images use Unsplash URLs (no API key needed) — swap with your
 * own assets by replacing the `src` values. Every <img> has meaningful
 * alt text for accessibility.
 *
 * LAYOUT
 * ──────
 * • MainNav    — fixed top (pt-[96px] on body accounts for nav + strip height)
 * • SolexFooter — bottom
 * • No sidebar on home page (sidebar is for /collections only)
 *
 * USAGE
 * ─────
 * import HomePage from "./pages/HomePage";
 * // Add to your router: <Route path="/" element={<HomePage />} />
 */

import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Play,
  TrendingUp,
  Users,
  Globe,
  Award,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cart/CartSlice";

// ─── Google Fonts (same as Navbar) ───────────────────────────────────────────
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    id: 1,
    tag: "New Season · SS25",
    headline: ["MOVE", "WITHOUT", "LIMITS"],
    sub: "Engineered for the streets. Built for the track. Born for everything in between.",
    cta: "Shop New Arrivals",
    ctaTo: "/new-arrivals",
    secondary: "Explore Collections",
    secondaryTo: "/collections",
    accent: "#F59E0B",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=90&auto=format",
    imageMob:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format",
    theme: "dark",
  },
  {
    id: 2,
    tag: "Women's Edit",
    headline: ["STEP INTO", "YOUR", "POWER"],
    sub: "Designed for every woman, every stride, every goal.",
    cta: "Shop Women",
    ctaTo: "/collections/women",
    secondary: "View Lookbook",
    secondaryTo: "/discover",
    accent: "#F43F5E",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=90&auto=format",
    imageMob:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80&auto=format",
    theme: "dark",
  },
  {
    id: 3,
    tag: "Running Collection",
    headline: ["BORN TO", "RUN", "FASTER"],
    sub: "Next-gen cushioning meets race-day performance.",
    cta: "Shop Running",
    ctaTo: "/collections/running",
    secondary: "Find Your Size",
    secondaryTo: "/size-guide",
    accent: "#10B981",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=90&auto=format",
    imageMob:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80&auto=format",
    theme: "dark",
  },
];

const STATS = [
  { icon: <TrendingUp size={18} />, value: "500+", label: "Styles" },
  { icon: <Globe size={18} />, value: "40+", label: "Cities" },
  { icon: <Users size={18} />, value: "2M+", label: "Customers" },
  { icon: <Award size={18} />, value: "4.9★", label: "Avg Rating" },
];

const BEST_SELLERS = [
  {
    id: 5,
    name: "TrailX Hiker",
    price: 5999,
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80&auto=format",
    rating: 4.6,
    to: "/products/trailx",
  },
  {
    id: 6,
    name: "Velocity Knit",
    price: 3999,
    image:
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&q=80&auto=format",
    rating: 4.8,
    to: "/products/velocity-knit",
  },
  {
    id: 7,
    name: "Classic Low",
    price: 2999,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&auto=format",
    rating: 4.9,
    to: "/products/classic-low",
  },
  {
    id: 8,
    name: "PowerStep Pro",
    price: 7499,
    image:
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80&auto=format",
    rating: 4.7,
    to: "/products/powerstep",
  },
  {
    id: 9,
    name: "Urban Glide",
    price: 4499,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80&auto=format",
    rating: 4.5,
    to: "/products/urban-glide",
  },
  {
    id: 10,
    name: "Sprint Edge",
    price: 5499,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format",
    rating: 4.8,
    to: "/products/sprint-edge",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Arjun Mehta",
    role: "Marathon Runner",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&auto=format",
    rating: 5,
    text: "SolexAir Pro completely transformed my training. The cushioning is insane and the fit is perfect right out of the box. PR'd my 10k by 2 minutes!",
    product: "SolexAir Pro",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Fitness Coach",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&auto=format",
    rating: 5,
    text: "I recommend Solex to all my clients. The build quality is exceptional — I've put these through brutal workouts for 8 months and they still look brand new.",
    product: "CloudRun X",
  },
  {
    id: 3,
    name: "Rohan Das",
    role: "Street Style Creator",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format",
    rating: 5,
    text: "StreetEdge 2 is my daily driver. The colourways are fire and they go with literally everything. Already ordered two more pairs. Solex gets it.",
    product: "StreetEdge 2",
  },
];

const INSTAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80&auto=format",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80&auto=format",
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&q=80&auto=format",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80&auto=format",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80&auto=format",
];

// ─── HomePage Component ───────────────────────────────────────────────────────
export default function HomePage({ darkMode }) {
  const [heroSlide, setHeroSlide] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);
  const [FEATURED_PRODUCTS, setFeaturedProducts] = useState([]);
  const [CATEGORIES, setCATEGORIES] = useState([]);

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/get-products`,
      );

      const products = res.data.data;

      // -----------------------------
      // CATEGORY COUNT MAP
      // -----------------------------
      const categoryMap = {};

      products.forEach((product) => {
        const category = product.category;

        if (!categoryMap[category]) {
          categoryMap[category] = {
            count: 0,
            image: product.thumbnail,
          };
        }

        categoryMap[category].count += 1;
      });

      // -----------------------------
      // CATEGORIES
      // -----------------------------
      const categoriesData = Object.entries(categoryMap)
        .slice(0, 6)
        .map(([category, data]) => ({
          label: category,
          to: `/collections/${category.toLowerCase()}`,
          image: data.image,
          count: `${data.count} styles`,
          color: "from-emerald-500/60",
        }));

      setCATEGORIES(categoriesData);

      // -----------------------------
      // FEATURED PRODUCTS
      // -----------------------------
      const featuredProductsData = products.slice(0, 4).map((product) => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        originalPrice: product.originalPrice,
        reviews: product.reviews || [],
        badge: "New Drop",
        badgeColor: "bg-amber-500",
        image: product.thumbnail,
        sizes: product.sizes || [],
        to: `/products/${product._id}`,
      }));

      setFeaturedProducts(featuredProductsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(
      () => setHeroSlide((p) => (p + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  // Load Google Fonts
  useEffect(() => {
    if (!document.querySelector("#solex-fonts")) {
      const l = Object.assign(document.createElement("link"), {
        id: "solex-fonts",
        rel: "stylesheet",
        href: FONT_LINK,
      });
      document.head.appendChild(l);
    }
    setTimeout(() => setMounted(true), 80);
  }, []);

  const toggleWishlist = (id) =>
    setWishlist((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const slide = HERO_SLIDES[heroSlide];

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#0a0a0a]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @keyframes hp-fade-up   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes hp-fade-in   { from { opacity:0 } to { opacity:1 } }
        @keyframes hp-scale-in  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        @keyframes hp-slide-r   { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:translateX(0) } }
        @keyframes hp-ken-burns { from { transform:scale(1.08) } to { transform:scale(1) } }
        @keyframes hp-marquee   { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        .hp-fade-up   { animation: hp-fade-up  0.7s cubic-bezier(0.16,1,0.3,1) both }
        .hp-fade-in   { animation: hp-fade-in  0.5s ease both }
        .hp-scale-in  { animation: hp-scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both }
        .hp-slide-r   { animation: hp-slide-r  0.6s cubic-bezier(0.16,1,0.3,1) both }
        .hp-ken-burns { animation: hp-ken-burns 8s ease-out both }
        .hp-marquee   { animation: hp-marquee 22s linear infinite }
        .delay-100 { animation-delay:0.10s }
        .delay-200 { animation-delay:0.20s }
        .delay-300 { animation-delay:0.30s }
        .delay-400 { animation-delay:0.40s }
        .delay-500 { animation-delay:0.50s }
        .delay-600 { animation-delay:0.60s }
        .product-card:hover .product-img { transform: scale(1.07); }
        .cat-card:hover .cat-img         { transform: scale(1.08); }
        .bs-card:hover .bs-img           { transform: scale(1.06); }
        input[type=range] { -webkit-appearance: none; appearance: none; height:4px; border-radius:9999px; background: #F59E0B; outline:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#F59E0B; cursor:pointer; box-shadow:0 0 0 3px rgba(245,158,11,0.25); }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[88vh] min-h-[520px] max-h-[860px] overflow-hidden bg-zinc-950">
        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === heroSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={s.image}
              alt={s.headline.join(" ")}
              className={`absolute inset-0 w-full h-full object-cover ${i === heroSlide ? "hp-ken-burns" : ""}`}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {/* Tag */}
              {mounted && (
                <div className="hp-fade-up flex items-center gap-2 mb-5">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold tracking-widest uppercase">
                    <Zap size={10} className="text-amber-400" />
                    {slide.tag}
                  </span>
                </div>
              )}

              {/* Headline */}
              {mounted &&
                slide.headline.map((line, i) => (
                  <h1
                    key={line}
                    className={`hp-fade-up delay-${(i + 1) * 100} leading-[0.88] text-white`}
                    style={{
                      fontFamily: "'Barlow Condensed', Impact, sans-serif",
                      fontSize: "clamp(56px, 10vw, 128px)",
                      fontWeight: 900,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {i === 1 ? (
                      <span style={{ color: slide.accent }}>{line}</span>
                    ) : (
                      line
                    )}
                  </h1>
                ))}

              {/* Subtitle */}
              {mounted && (
                <p className="hp-fade-up delay-400 mt-5 text-[15px] text-zinc-300 leading-relaxed max-w-md">
                  {slide.sub}
                </p>
              )}

              {/* CTAs */}
              {mounted && (
                <div className="hp-fade-up delay-500 flex flex-wrap items-center gap-3 mt-8">
                  <NavLink
                    to={slide.ctaTo}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13.5px] font-bold text-white transition-all duration-200 active:scale-95 hover:scale-105"
                    style={{ backgroundColor: slide.accent }}
                  >
                    {slide.cta}
                    <ArrowRight size={15} />
                  </NavLink>
                  <NavLink
                    to={slide.secondaryTo}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13.5px] font-bold text-white bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  >
                    {slide.secondary}
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setHeroSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === heroSlide
                  ? "w-8 h-2 bg-amber-400"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        {/* Arrow controls */}
        <button
          onClick={() =>
            setHeroSlide(
              (p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setHeroSlide((p) => (p + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronRight size={18} />
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. STATS MARQUEE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-zinc-950 dark:bg-zinc-900 border-y border-zinc-800 overflow-hidden select-none">
        <div className="py-3 flex items-center">
          <div className="hp-marquee flex items-center whitespace-nowrap">
            {[...Array(4)].flatMap(() =>
              STATS.map((s, i) => (
                <div
                  key={`${s.label}-${i}`}
                  className="flex items-center gap-8 mx-12"
                >
                  <div className="flex items-center gap-2.5 text-white">
                    <span className="text-amber-400">{s.icon}</span>
                    <span
                      className="text-[20px] font-black"
                      style={{
                        fontFamily: "'Barlow Condensed', Impact, sans-serif",
                      }}
                    >
                      {s.value}
                    </span>
                    <span className="text-[12px] text-zinc-400 uppercase tracking-widest font-medium">
                      {s.label}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. CATEGORIES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <SectionHeader
          tag="Shop by Category"
          title={
            <>
              FIND YOUR
              <br />
              <span className="text-amber-500">PERFECT FIT</span>
            </>
          }
          sub="From track to street — explore every style."
          action={{ label: "All Collections", to: "/collections" }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-10">
          {CATEGORIES.map((cat, i) => (
            <NavLink
              key={cat.label}
              to={cat.to}
              className="cat-card relative overflow-hidden rounded-2xl aspect-[3/4] block group"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="cat-img absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-zinc-950/80`}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                <p
                  className="text-[18px] sm:text-[20px] font-black text-white leading-tight"
                  style={{
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  }}
                >
                  {cat.label}
                </p>
                <p className="text-[10.5px] text-white/70 mt-0.5 font-medium">
                  {cat.count}
                </p>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                <ArrowRight
                  size={13}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. FEATURED DROPS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 dark:bg-zinc-950/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Just Dropped"
            title={
              <>
                THIS WEEK'S
                <br />
                <span className="text-amber-500">HOT DROPS</span>
              </>
            }
            sub="Fresh styles, fresh energy. Get them before they're gone."
            action={{ label: "See All New Arrivals", to: "/new-arrivals" }}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-10">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlist.includes(product._id)}
                onWishlist={() => toggleWishlist(product._id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. BRAND STORY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text side */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-semibold uppercase tracking-widest mb-5">
              <Zap size={10} />
              Our Story
            </span>
            <h2
              className="text-zinc-900 dark:text-white leading-[0.9] mb-6"
              style={{
                fontFamily: "'Barlow Condensed', Impact, sans-serif",
                fontSize: "clamp(42px, 6vw, 80px)",
                fontWeight: 900,
              }}
            >
              ENGINEERED
              <br />
              FOR THE
              <br />
              <span className="text-amber-500">RELENTLESS</span>
            </h2>
            <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5 max-w-lg">
              Solex was born from one obsession: making footwear that never
              holds you back. Every stitch, every sole, every curve is
              precision-engineered for athletes, creators, and everyday legends
              who refuse to slow down.
            </p>
            <p className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-lg">
              From our labs in Mumbai to streets across 40 cities — we build
              shoes that earn their stripes every single day.
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/about"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[13px] font-bold hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors duration-200"
              >
                Our Story <ArrowRight size={14} />
              </NavLink>
              <NavLink
                to="/discover"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[13px] font-semibold hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200"
              >
                <Play size={13} />
                Watch Film
              </NavLink>
            </div>
          </div>

          {/* Image mosaic */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[420px] sm:h-[480px]">
            <div className="row-span-2 rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85&auto=format"
                alt="SolexAir Pro side profile"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80&auto=format"
                alt="Women's collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80&auto=format"
                alt="Running shoe sole"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. BEST SELLERS — horizontal scroll
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 dark:bg-zinc-950/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeader
              tag="Community Favourites"
              title={
                <>
                  BEST
                  <br />
                  <span className="text-amber-500">SELLERS</span>
                </>
              }
              inline
            />
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: -280,
                    behavior: "smooth",
                  })
                }
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })
                }
                className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {BEST_SELLERS.map((product) => (
              <NavLink
                key={product.id}
                to={product.to}
                className="bs-card shrink-0 w-52 sm:w-60 snap-start group"
              >
                <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-square mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="bs-img w-full h-full object-cover transition-transform duration-500"
                  />
                </div>
                <p className="text-[13.5px] font-semibold text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {product.rating}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-zinc-900 dark:text-white mt-1">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. PROMO BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-zinc-950 py-16 sm:py-20">
        {/* Diagonal stripe texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F59E0B 0, #F59E0B 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-transparent to-amber-600/10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Limited Time
                </span>
              </div>
              <h2
                className="text-white leading-tight mb-2"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  fontSize: "clamp(40px, 7vw, 88px)",
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                }}
              >
                UP TO <span className="text-amber-400">50% OFF</span>
              </h2>
              <p className="text-zinc-400 text-[15px] max-w-md">
                Our biggest sale of the season. Selected styles, massive
                markdowns. Don't sleep on it.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {/* Countdown — decorative */}
              <div className="flex items-center gap-3">
                {[
                  ["12", "HRS"],
                  ["34", "MIN"],
                  ["56", "SEC"],
                ].map(([val, unit]) => (
                  <div key={unit} className="text-center">
                    <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                      <span
                        className="text-[28px] font-black text-white"
                        style={{
                          fontFamily: "'Barlow Condensed', Impact, sans-serif",
                        }}
                      >
                        {val}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                      {unit}
                    </p>
                  </div>
                ))}
              </div>
              <NavLink
                to="/collections/sale"
                className="flex items-center gap-2 px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[14px] font-black transition-all duration-200 active:scale-95 hover:scale-105"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                SHOP THE SALE <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8. TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <SectionHeader
          tag="Real Reviews"
          title={
            <>
              LOVED BY
              <br />
              <span className="text-amber-500">MILLIONS</span>
            </>
          }
          sub="Don't take our word for it — hear from the squad."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="relative p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/[0.05] hover:border-amber-200 dark:hover:border-amber-500/20 transition-colors duration-300 group"
            >
              {/* Quote mark */}
              <span
                className="absolute top-4 right-5 text-[60px] leading-none text-zinc-100 dark:text-zinc-800 pointer-events-none select-none"
                style={{ fontFamily: "Georgia, serif" }}
              >
                "
              </span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-[13.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed mb-5 relative">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/30"
                />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                    {t.role}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {t.product}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. INSTAGRAM / UGC GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 dark:bg-zinc-950/60 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-semibold uppercase tracking-widest mb-3">
              <Zap size={10} />
              Community
            </span>
            <h2
              className="text-zinc-900 dark:text-white"
              style={{
                fontFamily: "'Barlow Condensed', Impact, sans-serif",
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 900,
              }}
            >
              #SOLEXSQUAD
            </h2>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-500 mt-1">
              Tag us @solexofficial for a chance to be featured
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {INSTAGRAM_IMAGES.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={src}
                  alt={`Solex community photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. NEWSLETTER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 dark:bg-zinc-900 px-6 sm:px-12 py-12 sm:py-16 text-center">
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-semibold uppercase tracking-widest mb-5">
              <Zap size={10} />
              Join the Squad
            </span>
            <h2
              className="text-white mb-3"
              style={{
                fontFamily: "'Barlow Condensed', Impact, sans-serif",
                fontSize: "clamp(36px, 6vw, 72px)",
                fontWeight: 900,
                letterSpacing: "-0.01em",
              }}
            >
              GET EXCLUSIVE
              <br />
              <span className="text-amber-400">EARLY ACCESS</span>
            </h2>
            <p className="text-zinc-400 text-[14px] max-w-md mx-auto mb-8">
              New drops, secret sales, and member-only offers — straight to your
              inbox. No spam, ever.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-[14px] font-semibold border border-emerald-500/30">
                ✓ &nbsp;You're in! Check your inbox for a welcome gift 🎁
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-zinc-500 text-[13px] focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-bold transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  Subscribe →
                </button>
              </form>
            )}

            <p className="text-zinc-600 text-[11px] mt-4">
              Join 200,000+ Solex members. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ tag, title, sub, action, inline = false }) {
  return (
    <div className={inline ? "" : "max-w-xl"}>
      {tag && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-semibold uppercase tracking-widest mb-3">
          <Zap size={10} />
          {tag}
        </span>
      )}
      <h2
        className="text-zinc-900 dark:text-white leading-[0.9]"
        style={{
          fontFamily: "'Barlow Condensed', Impact, sans-serif",
          fontSize: inline
            ? "clamp(30px, 4vw, 52px)"
            : "clamp(36px, 5vw, 64px)",
          fontWeight: 900,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-2 text-[13.5px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          {sub}
        </p>
      )}
      {action && (
        <NavLink
          to={action.to}
          className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          {action.label} <ArrowRight size={13} />
        </NavLink>
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, wishlisted, onWishlist, darkMode }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.sizes?.length) {
      return;
    }

    dispatch(
      addToCart({
        ...product,
        size: product.sizes[0],
        quantity: 1,
      }),
    );

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 1800);
  };
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  return (
    <NavLink to={product.to} className="product-card group block">
      {/* Image */}
      <div
        className={`relative overflow-hidden rounded-2xl aspect-square mb-3 transition-colors duration-300 ${
          darkMode ? "bg-zinc-800" : "bg-zinc-100"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-img w-full h-full object-cover transition-transform duration-500"
        />

        {/* Badge */}
        <span
          className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${product.badgeColor} shadow-sm`}
        >
          New Arrival
        </span>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlist();
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            wishlisted
              ? "bg-rose-500 text-white"
              : darkMode
                ? "bg-zinc-800/90 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"
                : "bg-white/90 text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white"
          }`}
        >
          <Heart size={14} className={wishlisted ? "fill-white" : ""} />
        </button>

        {/* Add to Cart overlay */}
        <button
          onClick={handleCart}
          className={`absolute bottom-0 inset-x-0 py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${
            darkMode ? "bg-white/90 text-zinc-950" : "bg-zinc-950/90 text-white"
          }`}
        >
          {addedToCart ? (
            <>✓ Added!</>
          ) : (
            <>
              <ShoppingCart size={13} />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div>
        <p
          className={`text-[11px] font-medium uppercase tracking-wide mb-0.5 ${
            darkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {product.category}
        </p>

        <p
          className={`text-[13.5px] font-semibold group-hover:text-amber-500 transition-colors truncate ${
            darkMode ? "text-white" : "text-zinc-900"
          }`}
        >
          {product.name}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mt-1 mb-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : darkMode
                      ? "fill-zinc-700 text-zinc-700"
                      : "fill-zinc-200 text-zinc-200"
                }
              />
            ))}
          </div>

          <span
            className={`text-[11px] ${
              darkMode ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {/* ({product.reviews.toLocaleString()}) */}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[15px] font-bold ${
              darkMode ? "text-white" : "text-zinc-900"
            }`}
          >
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          {product.originalPrice && (
            <>
              <span
                className={`text-[12px] line-through ${
                  darkMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>

              <span
                className={`text-[10px] font-bold ${
                  darkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Color dots */}
        {/* <div className="flex gap-1.5 mt-2">
          {product.colors.map((hex) => (
            <div
              key={hex}
              className={`w-3.5 h-3.5 rounded-full border ${
                darkMode ? "border-zinc-600" : "border-zinc-200"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div> */}
      </div>
    </NavLink>
  );
}
