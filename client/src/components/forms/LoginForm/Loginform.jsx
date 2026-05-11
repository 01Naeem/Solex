/**
 * Solex — Login Form  ·  Dark Luxury Animated Edition
 * Matches the Signup Form theme exactly:
 *   → Cormorant Garamond + Outfit fonts
 *   → Dark charcoal + amber gold palette
 *   → Left brand panel / right form panel split layout
 *   → Same animations: particles, glow, shimmer, card tilt, staggered reveals
 *
 * Stack: React + Tailwind CSS + React Hook Form + Zod + Axios + react-hot-toast
 *
 * Install:
 *   npm install react-hook-form zod @hookform/resolvers axios react-hot-toast
 *
 * Add to index.html <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
 *
 * Drop into: src/components/auth/LoginForm.jsx
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

/* ─── Zod Schema ─────────────────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

/* ─── Animated Input Field (matches Signup style) ────────────────────────── */
const InputField = ({ label, id, type = "text", placeholder, register, error, optional = false, rightElement, delay = 0 }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="flex flex-col gap-1.5"
      style={{ animation: `slideUp 0.5s ease both`, animationDelay: `${delay}ms` }}
    >
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300"
        style={{ color: focused ? "#fbbf24" : error ? "#f87171" : "#52525b" }}
      >
        {label}
        {optional && (
          <span className="normal-case tracking-normal font-normal text-zinc-700 text-[10px]">
            — optional
          </span>
        )}
      </label>
      <div className="relative group">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register}
          onFocus={(e) => { setFocused(true); register.onBlur && null; }}
          onBlur={(e) => { setFocused(false); register.onBlur?.(e); }}
          className="w-full bg-transparent border-b py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-300 peer"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            paddingRight: rightElement ? "2rem" : "0",
            borderColor: error ? "rgba(248,113,113,0.4)" : "rgba(82,82,91,0.5)",
          }}
        />
        {/* Animated gold underline */}
        <div
          className="absolute bottom-0 left-0 h-px transition-all duration-500 ease-out"
          style={{
            width: focused ? "100%" : "0%",
            background: error
              ? "linear-gradient(90deg, #f87171, #ef4444)"
              : "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
            backgroundSize: "200% 100%",
            animation: focused ? "shimmer 2s linear infinite" : "none",
          }}
        />
        {error && !focused && (
          <div className="absolute bottom-0 left-0 w-full h-px bg-red-500/40" />
        )}
        {rightElement && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: error ? "40px" : "0px", opacity: error ? 1 : 0 }}
      >
        <p
          className="text-[11px] text-red-400/90 flex items-center gap-1 mt-0.5"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error?.message ?? error}
        </p>
      </div>
    </div>
  );
};

/* ─── Eye Toggle ─────────────────────────────────────────────────────────── */
const EyeToggle = ({ visible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    tabIndex={-1}
    aria-label={visible ? "Hide password" : "Show password"}
    className="text-zinc-600 hover:text-amber-400 transition-all duration-200 hover:scale-110"
  >
    {visible ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  </button>
);

/* ─── Social Button ──────────────────────────────────────────────────────── */
const SocialButton = ({ icon, label, onClick, delay = 0 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ animation: `slideUp 0.5s ease both`, animationDelay: `${delay}ms`, fontFamily: "'Outfit', sans-serif" }}
    className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    aria-label={`Sign in with ${label}`}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)";
      e.currentTarget.style.color = "#fbbf24";
      e.currentTarget.style.background = "rgba(251,191,36,0.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(82,82,91,0.4)";
      e.currentTarget.style.color = "#71717a";
      e.currentTarget.style.background = "transparent";
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)";
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = "rgba(82,82,91,0.4)";
      e.currentTarget.style.color = "#71717a";
      e.currentTarget.style.background = "transparent";
    }}
  >
    {icon}
    <span style={{ color: "inherit" }}>{label}</span>
  </button>
);

/* ─── Google Icon ────────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── GitHub Icon ────────────────────────────────────────────────────────── */
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

/* ─── Left Brand Panel ───────────────────────────────────────────────────── */
const BrandPanel = () => {
  const particles = [
    { w: 3, h: 3, top: "12%", left: "18%", dur: 7, del: 0 },
    { w: 2, h: 2, top: "32%", left: "75%", dur: 9, del: 1.5 },
    { w: 4, h: 4, top: "58%", left: "25%", dur: 6, del: 3 },
    { w: 2, h: 2, top: "76%", left: "62%", dur: 8, del: 0.5 },
    { w: 3, h: 3, top: "48%", left: "12%", dur: 10, del: 2 },
    { w: 2, h: 2, top: "22%", left: "88%", dur: 7.5, del: 4 },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #100d06 0%, #16100a 40%, #0d0d13 100%)",
        borderRight: "1px solid rgba(251,191,36,0.07)",
      }}
    >
      {/* Grid texture */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fbbf24" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.w, height: p.h,
            top: p.top, left: p.left,
            background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)",
            animation: `floatParticle ${p.dur}s ease-in-out ${p.del}s infinite`,
          }}
        />
      ))}

      {/* Pulsing glow orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "460px", height: "460px",
          background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 60%)",
          animation: "pulseGlow 4s ease-in-out infinite",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 px-14 pt-14" style={{ animation: "slideDown 0.7s ease both" }}>
        <div className="flex items-center gap-3">
          <div style={{ animation: "floatIcon 5s ease-in-out infinite" }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <path d="M3 28c0 0 7-13 17-13s13 5 13 5l3-1.5s1.5 7-5 9H3z" fill="url(#loginGrad)" />
              <path d="M7 28h22M12 23l2.5 5M19 20l2.5 8" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />
              <defs>
                <linearGradient id="loginGrad" x1="3" y1="15" x2="36" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fcd34d" />
                  <stop offset="1" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span
            className="text-white tracking-tight text-[28px]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}
          >
            SOLEX
          </span>
        </div>
        <p
          className="text-[9px] tracking-[0.35em] text-zinc-700 uppercase mt-1.5 ml-0.5"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Premium Footwear Est. 2018
        </p>
      </div>

      {/* Headline */}
      <div className="relative z-10 px-14 py-12" style={{ animation: "slideUp 0.8s ease 0.1s both" }}>
        <div
          className="mb-7"
          style={{ width: 0, height: "1px", background: "rgba(251,191,36,0.6)", animation: "expandWidth 1s ease 0.5s both" }}
        />
        <h2
          className="text-[46px] leading-[1.04] font-bold text-white mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em" }}
        >
          Welcome
          <br />
          <em
            className="not-italic"
            style={{
              background: "linear-gradient(90deg, #fcd34d, #f59e0b, #fcd34d)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
            }}
          >
            back.
          </em>
        </h2>
        <p
          className="text-[13px] text-zinc-500 leading-relaxed max-w-[240px]"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
        >
          Sign in to access your exclusive member benefits, order history, and curated drops.
        </p>

        {/* Benefit list */}
        <div className="mt-8 flex flex-col gap-3.5">
          {[
            ["Your order history & tracking", "◈", 0],
            ["Early drop access & wishlist", "◉", 100],
            ["Loyalty points & rewards", "◎", 200],
            ["Members-only pricing", "◇", 300],
          ].map(([text, icon, d]) => (
            <div
              key={text}
              className="flex items-center gap-3 group cursor-default"
              style={{ animation: `slideRight 0.5s ease ${d + 600}ms both` }}
            >
              <span
                className="text-amber-500/70 text-[11px] w-3.5 text-center transition-all duration-300 group-hover:text-amber-400 group-hover:scale-125"
              >
                {icon}
              </span>
              <span
                className="text-[12px] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats footer */}
      <div className="relative z-10 px-14 pb-14" style={{ animation: "slideUp 0.7s ease 0.3s both" }}>
        <div className="pt-6 border-t border-zinc-800/50 grid grid-cols-3 gap-4">
          {[["200K+", "Members"], ["4.9★", "Rating"], ["150+", "Brands"]].map(([val, lbl], i) => (
            <div
              key={lbl}
              className="group"
              style={{ animation: `fadeIn 0.5s ease ${800 + i * 100}ms both` }}
            >
              <p
                className="font-semibold text-base transition-all duration-300 group-hover:scale-110 origin-left"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  background: "linear-gradient(90deg, #fcd34d, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {val}
              </p>
              <p
                className="text-[9px] uppercase tracking-widest text-zinc-700 mt-0.5"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {lbl}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  /* Subtle card tilt on mouse move */
  useEffect(() => {
    const handleMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 3;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -2.5;
      cardRef.current.style.transform = `perspective(1100px) rotateX(${y}deg) rotateY(${x}deg)`;
    };
    const reset = () => {
      if (cardRef.current) cardRef.current.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", reset);
    };
  }, []);

  /* Store token */
  const storeToken = useCallback((token, rememberMe) => {
    try {
      if (rememberMe) localStorage.setItem("solex_access_token", token);
      else sessionStorage.setItem("solex_access_token", token);
    } catch { /* blocked storage — fail silently */ }
  }, []);

  /* Submit */
  const onSubmit = useCallback(
    async ({ email, password, rememberMe }) => {
      setIsSubmitting(true);
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          { email, password },
          { withCredentials: true, timeout: 10_000 }
        );
        const token = data?.accessToken ?? data?.token;
        if (token) storeToken(token, rememberMe);
        if (data?.refreshToken) sessionStorage.setItem("solex_refresh_token", data.refreshToken);

        toast.success("Welcome back! Redirecting…", {
          style: {
            background: "#0f0f14", color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: "10px", fontFamily: "'Outfit', sans-serif",
            fontSize: "13px", fontWeight: 300,
          },
          iconTheme: { primary: "#fbbf24", secondary: "#0f0f14" },
          duration: 2000,
        });

        setTimeout(() => { window.location.href = data?.redirectTo ?? "/"; }, 1200);
      } catch (err) {
        const status = err?.response?.status;
        const message = err?.response?.data?.message;
        const errMsg =
          status === 401 || status === 403 ? "Invalid email or password. Please try again." :
          status === 429 ? "Too many attempts. Please wait a moment." :
          !err.response ? "Connection error. Check your internet and try again." :
          message ?? "Something went wrong. Please try again.";

        toast.error(errMsg, {
          style: {
            background: "#0f0f14", color: "#f87171",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "10px", fontFamily: "'Outfit', sans-serif",
            fontSize: "13px", fontWeight: 300,
          },
          iconTheme: { primary: "#f87171", secondary: "#0f0f14" },
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [storeToken]
  );

  const handleSocialLogin = (provider) => {
    toast(`Redirecting to ${provider}…`, {
      icon: "🔗",
      style: {
        background: "#0f0f14", color: "#fbbf24",
        border: "1px solid rgba(251,191,36,0.15)",
        borderRadius: "10px", fontFamily: "'Outfit', sans-serif", fontSize: "13px",
      },
    });
    window.location.href = `/api/auth/${provider.toLowerCase()}`;
  };

  const canSubmit = isValid && isDirty && !isSubmitting;

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes expandWidth{from{width:0}to{width:2rem}}
        @keyframes pulseGlow{0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}
        @keyframes floatIcon{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1.2deg)}}
        @keyframes floatParticle{0%,100%{transform:translateY(0) translateX(0);opacity:.4}33%{transform:translateY(-12px) translateX(6px);opacity:.8}66%{transform:translateY(-6px) translateX(-4px);opacity:.5}}
        @keyframes borderPulse{0%,100%{box-shadow:0 0 0 1px rgba(251,191,36,0.04),0 40px 100px rgba(0,0,0,.85)}50%{box-shadow:0 0 0 1px rgba(251,191,36,0.15),0 40px 100px rgba(0,0,0,.85)}}
        @keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes successPop{0%{transform:scale(0) rotate(-10deg)}60%{transform:scale(1.25) rotate(3deg)}100%{transform:scale(1)}}
        @keyframes checkboxPop{0%{transform:scale(0) rotate(-10deg)}60%{transform:scale(1.3) rotate(4deg)}100%{transform:scale(1)}}
      `}</style>

      <Toaster position="top-center" />

      {/* Page */}
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8"
        style={{
          background: "radial-gradient(ellipse 120% 90% at 50% 0%, #0e0b07 0%, #080808 55%, #050508 100%)",
        }}
      >
        {/* Scan-line overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251,191,36,0.007) 2px, rgba(251,191,36,0.007) 4px)",
          }}
        />

        {/* Card */}
        <div
          ref={cardRef}
          className="w-full max-w-4xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] relative z-10"
          style={{
            background: "#090910",
            border: "1px solid rgba(255,255,255,0.055)",
            animation: "borderPulse 6s ease-in-out infinite, slideUp 0.6s ease both",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* LEFT */}
          <BrandPanel />

          {/* RIGHT: Form */}
          <div
            className="relative flex flex-col justify-center px-8 sm:px-12 xl:px-14 py-12 lg:py-16 overflow-hidden"
            style={{ background: "rgba(7,7,13,0.98)" }}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4) 30%, rgba(251,191,36,0.65) 50%, rgba(251,191,36,0.4) 70%, transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 4s linear infinite",
              }}
            />
            {/* Corner glows */}
            <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 180, height: 180, background: "radial-gradient(circle at top right, rgba(251,191,36,0.04), transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: 140, height: 140, background: "radial-gradient(circle at bottom left, rgba(251,191,36,0.03), transparent 70%)" }} />

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-10" style={{ animation: "slideDown 0.5s ease both" }}>
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path d="M3 28c0 0 7-13 17-13s13 5 13 5l3-1.5s1.5 7-5 9H3z" fill="#fbbf24" />
              </svg>
              <span className="text-white text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>SOLEX</span>
            </div>

            {/* Header */}
            <div className="mb-10" style={{ animation: "slideDown 0.6s ease 0.05s both" }}>
              <p
                className="text-[9px] tracking-[0.3em] uppercase mb-3"
                style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(251,191,36,0.5)" }}
              >
                Member Access
              </p>
              <h1
                className="text-[28px] font-semibold text-white leading-tight mb-2.5"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em" }}
              >
                Sign in to your account
              </h1>
              <p className="text-[13px] text-zinc-600" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
                New to Solex?{" "}
                <a
                  href="/auth/register"
                  className="transition-all duration-200 hover:underline"
                  style={{ color: "rgba(251,191,36,0.7)" }}
                  onMouseEnter={(e) => e.target.style.color = "#fbbf24"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(251,191,36,0.7)"}
                >
                  Create an account →
                </a>
              </p>
            </div>

            {/* Social buttons */}
            <div
              className="flex gap-3 mb-6"
              style={{ animation: "slideUp 0.5s ease 0.08s both" }}
            >
              <SocialButton
                icon={<GoogleIcon />}
                label="Google"
                onClick={() => handleSocialLogin("Google")}
                delay={120}
              />
              <SocialButton
                icon={<GithubIcon />}
                label="GitHub"
                onClick={() => handleSocialLogin("Github")}
                delay={180}
              />
            </div>

            {/* Divider */}
            <div
              className="flex items-center gap-3 mb-6"
              style={{ animation: "fadeIn 0.5s ease 0.2s both" }}
            >
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(82,82,91,0.5))" }} />
              <span
                className="text-[9px] tracking-[0.22em] uppercase"
                style={{ fontFamily: "'Outfit', sans-serif", color: "#3f3f46", fontWeight: 400 }}
              >
                or continue with email
              </span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(82,82,91,0.5), transparent)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
              {/* Email */}
              <InputField
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                register={register("email")}
                error={errors.email?.message}
                delay={260}
              />

              {/* Password */}
              <InputField
                label="Password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                register={register("password")}
                error={errors.password?.message}
                delay={340}
                rightElement={
                  <EyeToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                  />
                }
              />

              {/* Remember Me + Forgot */}
              <div
                className="flex items-center justify-between"
                style={{ animation: "slideUp 0.5s ease 420ms both" }}
              >
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="sr-only peer"
                      {...register("rememberMe")}
                    />
                    <div
                      className="w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-200"
                      style={{ borderColor: "rgba(82,82,91,0.6)" }}
                    >
                      <svg className="w-2.5 h-2.5" fill="#0c0a00" viewBox="0 0 20 20" style={{ display: "none" }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <style>{`
                      #rememberMe:checked + div { background: #fbbf24 !important; border-color: #fbbf24 !important; animation: checkboxPop 0.3s ease; }
                      #rememberMe:checked + div svg { display: block !important; }
                    `}</style>
                  </div>
                  <span
                    className="text-[12px] text-zinc-600 transition-colors duration-200 group-hover:text-zinc-400 select-none"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
                  >
                    Remember me
                  </span>
                </label>

                <a
                  href="/auth/forgot-password"
                  className="text-[12px] transition-all duration-200 hover:underline underline-offset-2"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, color: "rgba(251,191,36,0.6)" }}
                  onMouseEnter={(e) => e.target.style.color = "#fbbf24"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(251,191,36,0.6)"}
                >
                  Forgot password?
                </a>
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(82,82,91,0.4), transparent)", animation: "fadeIn 0.5s ease 480ms both" }}
              />

              {/* Submit */}
              <div style={{ animation: "slideUp 0.5s ease 520ms both" }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="relative w-full py-4 rounded-lg text-[11px] font-semibold tracking-[0.25em] uppercase overflow-hidden transition-all duration-300"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: canSubmit
                      ? "linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d, #f59e0b, #fbbf24)"
                      : "#18181b",
                    backgroundSize: canSubmit ? "300% 100%" : "100% 100%",
                    animation: canSubmit ? "gradShift 3s ease infinite" : "none",
                    color: canSubmit ? "#0c0a00" : "#3f3f46",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    border: canSubmit ? "none" : "1px solid rgba(63,63,70,0.5)",
                    boxShadow: canSubmit ? "0 0 30px rgba(251,191,36,0.2), 0 4px 20px rgba(0,0,0,0.4)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (canSubmit) e.currentTarget.style.boxShadow = "0 0 50px rgba(251,191,36,0.35), 0 6px 28px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    if (canSubmit) e.currentTarget.style.boxShadow = "0 0 30px rgba(251,191,36,0.2), 0 4px 20px rgba(0,0,0,0.4)";
                  }}
                  aria-busy={isSubmitting}
                >
                  {/* Shimmer overlay on active */}
                  {canSubmit && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s linear infinite",
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {isSubmitting ? (
                      <>
                        <svg style={{ animation: "spin 0.8s linear infinite" }} className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </button>

                <p
                  className="text-center text-[10px] text-zinc-800 tracking-[0.15em] uppercase mt-4"
                  style={{ fontFamily: "'Outfit', sans-serif", animation: "fadeIn 0.5s ease 700ms both" }}
                >
                  <span style={{ color: "rgba(251,191,36,0.3)" }}>⚡</span>{" "}
                  256-bit SSL encrypted · GDPR compliant
                </p>
              </div>
            </form>

            {/* Footer */}
            <p
              className="text-center text-[10px] text-zinc-800 mt-6"
              style={{ fontFamily: "'Outfit', sans-serif", animation: "fadeIn 0.5s ease 750ms both" }}
            >
              By signing in, you agree to Solex's{" "}
              <a
                href="/legal/terms"
                className="transition-colors duration-150"
                style={{ color: "rgba(251,191,36,0.35)" }}
                onMouseEnter={(e) => e.target.style.color = "rgba(251,191,36,0.65)"}
                onMouseLeave={(e) => e.target.style.color = "rgba(251,191,36,0.35)"}
              >
                Terms
              </a>
              {" "}& {" "}
              <a
                href="/legal/privacy"
                className="transition-colors duration-150"
                style={{ color: "rgba(251,191,36,0.35)" }}
                onMouseEnter={(e) => e.target.style.color = "rgba(251,191,36,0.65)"}
                onMouseLeave={(e) => e.target.style.color = "rgba(251,191,36,0.35)"}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}