/**
 * Solex — Signup Form  ·  Animated Premium Edition
 * Stack: React + Tailwind CSS + React Hook Form + Zod + Axios + react-hot-toast
 *
 * Install:
 *   npm install react-hook-form zod @hookform/resolvers axios react-hot-toast
 *
 * Add to index.html <head>:
 *   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
 *
 * In tailwind.config.js add:
 *   theme: { extend: { animation: { 'shimmer': 'shimmer 2.5s linear infinite', 'float': 'float 6s ease-in-out infinite', 'pulse-amber': 'pulseAmber 2s ease-in-out infinite' } } }
 */

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const signupSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,15}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms & conditions" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Animated Input Field ─────────────────────────────────────────────────────
const InputField = ({ label, id, type = "text", placeholder, register, error, optional = false, rightElement, delay = 0 }) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

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
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          onChange={(e) => {
            register.onChange?.(e);
            setHasValue(e.target.value.length > 0);
          }}
          className="w-full bg-transparent border-b py-2.5 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-all duration-300 peer"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            paddingRight: rightElement ? "2rem" : "0",
            borderColor: error ? "rgba(248,113,113,0.4)" : "rgba(82,82,91,0.5)",
          }}
        />
        {/* Animated underline */}
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
        {/* Static error line */}
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
          {error?.message}
        </p>
      </div>
    </div>
  );
};

// ─── Eye Toggle ───────────────────────────────────────────────────────────────
const EyeToggle = ({ visible, onToggle, label }) => (
  <button
    type="button"
    onClick={onToggle}
    tabIndex={-1}
    aria-label={label}
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

// ─── Animated Particle ────────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)",
      animation: `floatParticle ${style.duration}s ease-in-out infinite`,
      animationDelay: `${style.delay}s`,
      ...style,
    }}
  />
);

// ─── Brand / Left Panel ───────────────────────────────────────────────────────
const BrandPanel = () => {
  const particles = [
    { width: 3, height: 3, top: "15%", left: "20%", duration: 7, delay: 0 },
    { width: 2, height: 2, top: "35%", left: "70%", duration: 9, delay: 1.5 },
    { width: 4, height: 4, top: "60%", left: "30%", duration: 6, delay: 3 },
    { width: 2, height: 2, top: "80%", left: "65%", duration: 8, delay: 0.5 },
    { width: 3, height: 3, top: "50%", left: "15%", duration: 10, delay: 2 },
    { width: 2, height: 2, top: "25%", left: "85%", duration: 7, delay: 4 },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #100d06 0%, #16100a 40%, #0d0d13 100%)",
        borderRight: "1px solid rgba(251,191,36,0.07)",
      }}
    >
      {/* Fine grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="finegrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fbbf24" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#finegrid)" />
      </svg>

      {/* Animated particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Main glow orb — pulses */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "38%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 60%)",
          animation: "pulseGlow 4s ease-in-out infinite",
        }}
      />

      {/* Diagonal decorative line */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, transparent 40%, rgba(251,191,36,0.015) 50%, transparent 60%)",
          animation: "sweepDiag 8s ease-in-out infinite",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 px-14 pt-14" style={{ animation: "slideDown 0.7s ease both" }}>
        <div className="flex items-center gap-3">
          {/* Animated logo mark */}
          <div style={{ animation: "floatIcon 5s ease-in-out infinite" }}>
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <path d="M3 28c0 0 7-13 17-13s13 5 13 5l3-1.5s1.5 7-5 9H3z" fill="url(#bpg)" />
              <path d="M7 28h22M12 23l2.5 5M19 20l2.5 8" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinecap="round" />
              <defs>
                <linearGradient id="bpg" x1="3" y1="15" x2="36" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fcd34d" />
                  <stop offset="1" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-white tracking-tight text-[28px]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
            SOLEX
          </span>
        </div>
        <p className="text-[9px] tracking-[0.35em] text-zinc-700 uppercase mt-1.5 ml-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Premium Footwear Est. 2018
        </p>
      </div>

      {/* Headline */}
      <div className="relative z-10 px-14 py-12" style={{ animation: "slideUp 0.8s ease 0.1s both" }}>
        <div className="w-8 h-px bg-amber-500/60 mb-7" style={{ animation: "expandWidth 1s ease 0.5s both" }} />
        <h2
          className="text-[46px] leading-[1.04] font-bold text-white mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em" }}
        >
          Built for
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
            every step
          </em>
          <br />
          forward.
        </h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[260px]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
          An exclusive membership unlocking curated collections, early access drops, and concierge support.
        </p>

        {/* Feature list with staggered animation */}
        <div className="mt-8 flex flex-col gap-3.5">
          {[
            ["Early access to limited drops", "◈", 0],
            ["Free express shipping worldwide", "◉", 100],
            ["365-day returns, no questions", "◎", 200],
            ["Members-only loyalty rewards", "◇", 300],
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
            <div key={lbl} className="group" style={{ animation: `fadeIn 0.5s ease ${800 + i * 100}ms both` }}>
              <p
                className="font-semibold text-base transition-all duration-300 group-hover:scale-110 group-hover:text-amber-300 origin-left"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  background: "linear-gradient(90deg, #fcd34d, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {val}
              </p>
              <p className="text-[9px] uppercase tracking-widest text-zinc-700 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {lbl}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Password Strength Meter ──────────────────────────────────────────────────
const StrengthMeter = ({ password }) => {
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 mt-1" style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-all duration-500"
            style={{ background: i <= strength ? colors[strength] : "rgba(82,82,91,0.3)" }}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium transition-colors duration-300" style={{ color: colors[strength], fontFamily: "'Outfit', sans-serif" }}>
        {labels[strength]}
      </span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignupForm() {
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const { register, handleSubmit, formState: { errors, isValid }, reset, watch } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const pwWatch = watch("password", "");
  useEffect(() => setPasswordValue(pwWatch || ""), [pwWatch]);

  // Subtle card tilt on mouse move
  useEffect(() => {
    const handleMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -3;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
        { name: data.name, email: data.email, password: data.password, phone: data.phone || undefined },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      toast.success("Welcome to Solex. Your account is ready.", {
        style: {
          background: "#0f0f14", color: "#fbbf24",
          border: "1px solid rgba(251,191,36,0.2)",
          borderRadius: "10px", fontFamily: "'Outfit', sans-serif",
          fontSize: "13px", fontWeight: 300,
        },
        iconTheme: { primary: "#fbbf24", secondary: "#0f0f14" },
        duration: 4500,
      });
      reset();
    } catch (err) {
      const message = err?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message, {
        style: {
          background: "#0f0f14", color: "#f87171",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: "10px", fontFamily: "'Outfit', sans-serif",
          fontSize: "13px", fontWeight: 300,
        },
        iconTheme: { primary: "#f87171", secondary: "#0f0f14" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes expandWidth { from{width:0} to{width:2rem} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1);} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.12);} }
        @keyframes floatIcon { 0%,100%{transform:translateY(0px) rotate(-1deg);} 50%{transform:translateY(-6px) rotate(1deg);} }
        @keyframes floatParticle { 0%,100%{transform:translateY(0px) translateX(0px); opacity:0.4;} 33%{transform:translateY(-12px) translateX(6px); opacity:0.8;} 66%{transform:translateY(-6px) translateX(-4px); opacity:0.5;} }
        @keyframes sweepDiag { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes borderPulse { 0%,100%{border-color:rgba(251,191,36,0.07)} 50%{border-color:rgba(251,191,36,0.18)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes successPop { 0%{transform:scale(0) rotate(-10deg);} 60%{transform:scale(1.2) rotate(3deg);} 100%{transform:scale(1) rotate(0deg);} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes scanLine { 0%{transform:translateY(-100%);opacity:0} 10%{opacity:0.5} 90%{opacity:0.5} 100%{transform:translateY(100vh);opacity:0} }
      `}</style>

      <Toaster position="top-center" />

      {/* Page background */}
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8"
        style={{
          background: "radial-gradient(ellipse 120% 90% at 50% 0%, #0e0b07 0%, #080808 55%, #050508 100%)",
        }}
      >
        {/* Scan-line effect */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251,191,36,0.007) 2px, rgba(251,191,36,0.007) 4px)",
          }}
        />

        {/* Wide card with subtle tilt */}
        <div
          ref={cardRef}
          className="w-full max-w-5xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] relative z-10"
          style={{
            background: "#090910",
            border: "1px solid rgba(255,255,255,0.055)",
            boxShadow: "0 0 0 1px rgba(251,191,36,0.03), 0 50px 120px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.03) inset",
            transform: `perspective(1200px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
            transition: "transform 0.15s ease-out",
            animation: "borderPulse 6s ease-in-out infinite, slideUp 0.6s ease both",
          }}
        >
          {/* LEFT */}
          <BrandPanel />

          {/* RIGHT: Form Panel */}
          <div
            className="relative flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-12 lg:py-16 overflow-hidden"
            style={{ background: "rgba(7,7,13,0.98)" }}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.4) 30%, rgba(251,191,36,0.6) 50%, rgba(251,191,36,0.4) 70%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 4s linear infinite",
              }}
            />

            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 pointer-events-none"
              style={{
                width: "200px", height: "200px",
                background: "radial-gradient(circle at top right, rgba(251,191,36,0.04) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 pointer-events-none"
              style={{
                width: "150px", height: "150px",
                background: "radial-gradient(circle at bottom left, rgba(251,191,36,0.03) 0%, transparent 70%)",
              }}
            />

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-10" style={{ animation: "slideDown 0.5s ease both" }}>
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path d="M3 28c0 0 7-13 17-13s13 5 13 5l3-1.5s1.5 7-5 9H3z" fill="#fbbf24" />
              </svg>
              <span className="text-white text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
                SOLEX
              </span>
            </div>

            {/* Header */}
            <div className="mb-10" style={{ animation: "slideDown 0.6s ease 0.05s both" }}>
              <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(251,191,36,0.5)" }}>
                New Member Registration
              </p>
              <h1
                className="text-[28px] font-semibold text-white leading-tight mb-2.5"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.02em" }}
              >
                Create your account
              </h1>
              <p className="text-[13px] text-zinc-600" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
                Already a member?{" "}
                <a href="/auth/login" className="transition-all duration-200 hover:underline" style={{ color: "rgba(251,191,36,0.7)" }}
                  onMouseEnter={(e) => e.target.style.color = "#fbbf24"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(251,191,36,0.7)"}
                >
                  Sign in →
                </a>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-7">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <InputField label="Full Name" id="name" placeholder="Jordan Smith" register={register("name")} error={errors.name} delay={100} />
                <InputField label="Phone Number" id="phone" type="tel" placeholder="+1 234 567 8900" register={register("phone")} error={errors.phone} optional delay={180} />
              </div>

              {/* Email */}
              <InputField label="Email Address" id="email" type="email" placeholder="you@example.com" register={register("email")} error={errors.email} delay={260} />

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <div>
                  <InputField
                    label="Password" id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    register={register("password")}
                    error={errors.password}
                    delay={340}
                    rightElement={<EyeToggle visible={showPw} onToggle={() => setShowPw(v => !v)} label="Toggle password" />}
                  />
                  <StrengthMeter password={passwordValue} />
                </div>
                <InputField
                  label="Confirm Password" id="confirmPassword"
                  type={showCPw ? "text" : "password"}
                  placeholder="Re-enter password"
                  register={register("confirmPassword")}
                  error={errors.confirmPassword}
                  delay={420}
                  rightElement={<EyeToggle visible={showCPw} onToggle={() => setShowCPw(v => !v)} label="Toggle confirm password" />}
                />
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(82,82,91,0.4), transparent)", animation: "fadeIn 0.5s ease 500ms both" }} />

              {/* Terms */}
              <div className="flex flex-col gap-1.5" style={{ animation: "slideUp 0.5s ease 500ms both" }}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input id="terms" type="checkbox" {...register("terms")} className="sr-only peer" />
                    <div
                      className="w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-300 group-hover:border-amber-400/40"
                      style={{
                        borderColor: errors.terms ? "rgba(248,113,113,0.5)" : "rgba(82,82,91,0.6)",
                      }}
                    >
                      {/* JS-driven checked state for preview — in real app peer-checked handles this */}
                      <svg className="w-2.5 h-2.5 text-zinc-950 transition-all duration-200 scale-0 peer-checked:scale-100" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Peer-checked styles via inline approach */}
                    <style>{`
                      #terms:checked + div { background: #fbbf24 !important; border-color: #fbbf24 !important; }
                      #terms:checked + div svg { transform: scale(1) !important; animation: successPop 0.3s ease; }
                    `}</style>
                  </div>
                  <span className="text-[12px] text-zinc-500 leading-5" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>
                    I have read and agree to Solex's{" "}
                    <a href="#" className="hover:text-amber-400 transition-colors duration-200" style={{ color: "rgba(251,191,36,0.7)" }}>Terms & Conditions</a>{" "}
                    and{" "}
                    <a href="#" className="hover:text-amber-400 transition-colors duration-200" style={{ color: "rgba(251,191,36,0.7)" }}>Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-[11px] text-red-400/80 flex items-center gap-1 ml-7" style={{ fontFamily: "'Outfit', sans-serif", animation: "slideRight 0.2s ease" }}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <div style={{ animation: "slideUp 0.5s ease 580ms both" }}>
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="relative w-full py-4 rounded-lg text-[11px] font-semibold tracking-[0.25em] uppercase overflow-hidden transition-all duration-300"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: isValid && !isLoading
                      ? "linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d, #f59e0b, #fbbf24)"
                      : "#18181b",
                    backgroundSize: isValid && !isLoading ? "300% 100%" : "100% 100%",
                    animation: isValid && !isLoading ? "gradShift 3s ease infinite" : "none",
                    color: isValid && !isLoading ? "#0c0a00" : "#3f3f46",
                    cursor: isValid && !isLoading ? "pointer" : "not-allowed",
                    border: isValid && !isLoading ? "none" : "1px solid rgba(63,63,70,0.5)",
                    boxShadow: isValid && !isLoading ? "0 0 30px rgba(251,191,36,0.2), 0 4px 20px rgba(0,0,0,0.4)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (isValid && !isLoading) e.currentTarget.style.boxShadow = "0 0 50px rgba(251,191,36,0.35), 0 4px 25px rgba(0,0,0,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    if (isValid && !isLoading) e.currentTarget.style.boxShadow = "0 0 30px rgba(251,191,36,0.2), 0 4px 20px rgba(0,0,0,0.4)";
                  }}
                >
                  {/* Ripple layer */}
                  {isValid && !isLoading && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s linear infinite",
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {isLoading ? (
                      <>
                        <svg style={{ animation: "spin 0.8s linear infinite" }} className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating your account…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </span>
                </button>

                {/* SSL badge */}
                <p
                  className="text-center text-[10px] text-zinc-800 tracking-[0.15em] uppercase mt-4"
                  style={{ fontFamily: "'Outfit', sans-serif", animation: "fadeIn 0.5s ease 700ms both" }}
                >
                  <span style={{ color: "rgba(251,191,36,0.3)" }}>⚡</span>{" "}
                  256-bit SSL encrypted · GDPR compliant
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}