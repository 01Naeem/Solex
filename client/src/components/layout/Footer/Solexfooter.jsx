/**
 * SolexFooter.jsx — Solex | Professional Footer
 *
 * FEATURES
 * ────────
 * ✦ 4-column grid layout (collapses to accordion on mobile)
 * ✦ Brand column with tagline, social links, app store badges
 * ✦ Newsletter signup with email input
 * ✦ Payment method icons row
 * ✦ Trust badges (Free Shipping, Easy Returns, Secure Payment, 24/7 Support)
 * ✦ Bottom bar: copyright, links, region selector
 * ✦ Full dark mode support matching Solex navbar
 * ✦ Mobile-first accordion (each column expandable on small screens)
 * ✦ Smooth hover animations on all links
 *
 * USAGE
 * ─────
 * <SolexFooter />
 * <SolexFooter year={2025} />
 */

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Send,
} from "lucide-react";

import { FaInstagram, FaTwitter, FaYoutube, FaFacebook } from "react-icons/fa";
import LogoSolex from "../../../assets/images/NavLogoSolex.png";

// ─── Footer columns data ──────────────────────────────────────────────────────
const FOOTER_COLS = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", to: "/new-arrivals" },
      { label: "Men", to: "/collections/men" },
      { label: "Women", to: "/collections/women" },
      { label: "Kids", to: "/collections/kids" },
      { label: "Running", to: "/collections/running" },
      { label: "Sale", to: "/collections/sale", badge: "50% OFF" },
    ],
  },
  {
    heading: "Collections",
    links: [
      { label: "Best Sellers", to: "/collections/best-sellers" },
      { label: "Basketball", to: "/collections/basketball" },
      { label: "Training", to: "/collections/training" },
      { label: "Lifestyle", to: "/collections/lifestyle" },
      { label: "Collaborations", to: "/collections/collab" },
      { label: "Coming Soon", to: "/new-arrivals/coming-soon" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "My Orders", to: "/orders" },
      { label: "Track My Order", to: "/track" },
      { label: "Returns & Refunds", to: "/returns" },
      { label: "Size Guide", to: "/size-guide" },
      { label: "FAQs", to: "/faqs" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Solex", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Press", to: "/press" },
      { label: "Sustainability", to: "/green" },
      { label: "Affiliates", to: "/affiliates" },
      { label: "Stores", to: "/stores" },
    ],
  },
];

const SOCIALS = [
  {
    icon: <FaInstagram size={17} />,
    label: "Instagram",
    href: "https://instagram.com",
  },
  {
    icon: <FaTwitter size={17} />,
    label: "Twitter",
    href: "https://twitter.com",
  },
  {
    icon: <FaYoutube size={17} />,
    label: "YouTube",
    href: "https://youtube.com",
  },
  {
    icon: <FaFacebook size={17} />,
    label: "Facebook",
    href: "https://facebook.com",
  },
];

const TRUST_BADGES = [
  {
    icon: <Truck size={22} />,
    label: "Free Shipping",
    sub: "Orders over ₹2999",
  },
  {
    icon: <RotateCcw size={22} />,
    label: "Easy Returns",
    sub: "30-day return policy",
  },
  {
    icon: <ShieldCheck size={22} />,
    label: "Secure Payment",
    sub: "100% protected",
  },
  {
    icon: <Headphones size={22} />,
    label: "24/7 Support",
    sub: "Always here for you",
  },
];

const PAYMENT_METHODS = [
  { name: "Visa", bg: "#1A1F71", text: "#fff", label: "VISA" },
  { name: "Mastercard", bg: "#EB001B", text: "#fff", label: "MC" },
  { name: "UPI", bg: "#097939", text: "#fff", label: "UPI" },
  { name: "Paytm", bg: "#002970", text: "#00BAF2", label: "Paytm" },
  { name: "GPay", bg: "#4285F4", text: "#fff", label: "GPay" },
  { name: "NetBanking", bg: "#F5A623", text: "#fff", label: "NET" },
  { name: "COD", bg: "#27AE60", text: "#fff", label: "COD" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Solexfooter({ year = new Date().getFullYear() }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [expanded, setExpanded] = useState(null); // mobile accordion

  const toggleSection = (heading) =>
    setExpanded((p) => (p === heading ? null : heading));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-white/[0.06]">
      {/* ── Trust badges strip ──────────────────────────────────────────── */}
      <div className="border-b border-zinc-100 dark:border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_BADGES.map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-tight">
                    {label}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer body ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_repeat(4,1fr)] gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="space-y-5">
            {/* Logo text — swap with <img> if you have the asset */}
            <NavLink to="/" className="inline-block focus:outline-none">
              <img
                src={LogoSolex}
                alt="Solex"
                className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-[14px] font-bold text-zinc-900 dark:text-white block ml-1" style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", letterSpacing: "0.05em" }}   >
                Modern Performance Footwear
              </span>
            </NavLink>

            <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-500 max-w-[260px]">
              Engineered for performance. Designed for life. Every step, every
              stride — built different.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-2 text-[12.5px] text-zinc-500 dark:text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="shrink-0 text-amber-500" />
                <span>Solex HQ, Mumbai, India 400001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="shrink-0 text-amber-500" />
                <a
                  href="tel:+911800000000"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  +91 1800-000-000
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="shrink-0 text-amber-500" />
                <a
                  href="mailto:hello@solex.in"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  hello@solex.in
                </a>
              </div>
            </div>
          </div>

          {/* Link columns — desktop: straight list | mobile: accordion */}
          {FOOTER_COLS.map(({ heading, links }) => (
            <div key={heading}>
              {/* Mobile accordion toggle */}
              <button
                onClick={() => toggleSection(heading)}
                className="lg:hidden w-full flex items-center justify-between py-3 border-b border-zinc-100 dark:border-white/[0.06] focus:outline-none"
              >
                <span
                  className="text-[12px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white"
                  style={{
                    fontFamily: "'Barlow Condensed', Impact, sans-serif",
                    letterSpacing: "0.1em",
                  }}
                >
                  {heading}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-zinc-400 transition-transform duration-300 ${expanded === heading ? "rotate-180" : ""}`}
                />
              </button>

              {/* Desktop heading (always visible) */}
              <p
                className="hidden lg:block text-[11.5px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-4"
                style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}
              >
                {heading}
              </p>

              {/* Links */}
              <ul
                className={[
                  "space-y-0.5 overflow-hidden transition-all duration-300",
                  "lg:block",
                  expanded === heading
                    ? "max-h-96 opacity-100 pb-3"
                    : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100",
                ].join(" ")}
              >
                {links.map(({ label, to, badge }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      className="group flex items-center gap-1.5 py-1.5 lg:py-1 text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors duration-150"
                    >
                      <ArrowRight
                        size={11}
                        className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-amber-500"
                      />
                      {label}
                      {badge && (
                        <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 leading-none">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter ────────────────────────────────────────────────── */}
        <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-white/[0.06]">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
            <div className="space-y-1 shrink-0">
              <p
                className="text-[20px] font-black text-zinc-900 dark:text-white"
                style={{
                  fontFamily: "'Barlow Condensed', Impact, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                JOIN THE SOLEX SQUAD
              </p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-500">
                Get exclusive drops, early access & member-only deals.
              </p>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold">
                <ShieldCheck size={16} />
                You're in! Welcome to the squad 🎉
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex items-center gap-2 w-full lg:max-w-sm"
              >
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus-within:border-amber-400 transition-colors duration-200">
                  <Mail size={15} className="text-zinc-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 bg-transparent text-[13px] text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none min-w-0"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[12.5px] font-bold hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors duration-200 shrink-0 whitespace-nowrap"
                >
                  <Send size={13} />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          {/* Payment methods */}
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-zinc-100 dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mr-1">
              We Accept
            </span>
            {PAYMENT_METHODS.map(({ name, bg, text, label }) => (
              <div
                key={name}
                title={name}
                className="h-6 px-2.5 rounded-md flex items-center justify-center text-[9.5px] font-extrabold tracking-wide"
                style={{ backgroundColor: bg, color: text }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] text-zinc-400 dark:text-zinc-600">
            <p>© {year} Solex, Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Cookie Policy", to: "/cookies" },
                { label: "Sitemap", to: "/sitemap" },
              ].map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors duration-150"
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
