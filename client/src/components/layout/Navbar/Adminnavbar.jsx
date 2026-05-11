/**
 * components/admin/AdminNavbar.jsx
 * Solex Admin — Top Navigation Bar
 */

import { useState, useEffect, useRef } from "react";
import {
  Menu, Search, Bell, ChevronDown, User, Settings,
  LogOut, X, Command, Shield,
} from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, type: "order",   title: "New order #ORD-2841",     time: "2m ago",  unread: true  },
  { id: 2, type: "user",    title: "New user registered",      time: "14m ago", unread: true  },
  { id: 3, type: "alert",   title: "Low stock: SolexAir Pro",  time: "1h ago",  unread: true  },
  { id: 4, type: "order",   title: "Order #ORD-2839 shipped",  time: "3h ago",  unread: false },
  { id: 5, type: "system",  title: "Weekly report ready",      time: "1d ago",  unread: false },
];

export default function AdminNavbar({ sidebarOpen, onToggleSidebar }) {
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);


  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Escape key
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setProfileOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-16 bg-white border-b border-slate-100 shadow-[0_1px_20px_rgba(0,0,0,0.06)] flex items-center justify-between px-4 gap-3 transition-all duration-300"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Logo (visible when sidebar collapsed on mobile) */}
      <div className="flex items-center gap-2 shrink-0 lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
          <Shield size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-black text-slate-900 tracking-tight"
          style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif", letterSpacing: "0.06em" }}>
          SOLEX
        </span>
      </div>

      {/* Search bar — desktop */}
      <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-amber-400 focus-within:bg-white transition-all duration-200 group">
        <Search size={15} className="text-slate-400 group-focus-within:text-amber-500 shrink-0 transition-colors" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search orders, products, users..."
          className="flex-1 bg-transparent text-[13.5px] text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[10px] font-semibold flex items-center gap-0.5">
            <Command size={9} />K
          </kbd>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(p => !p)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          {searchOpen ? <X size={17} /> : <Search size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell size={17} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-[13px] font-semibold text-slate-900">Notifications</span>
                <button className="text-[11px] text-amber-600 font-semibold hover:text-amber-700">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${n.unread ? "bg-amber-50/40" : ""}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? "bg-amber-500" : "bg-slate-200"}`} />
                    <div className="min-w-0">
                      <p className={`text-[12.5px] leading-snug ${n.unread ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <button className="text-[12px] text-amber-600 font-semibold hover:text-amber-700">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12.5px] font-semibold text-slate-900 leading-tight">Admin</p>
              <p className="text-[10.5px] text-slate-400 leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={13} className={`hidden sm:block text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in py-1.5">
              <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-[12.5px] font-semibold text-slate-900">Admin User</p>
                <p className="text-[11px] text-slate-400">admin@solex.in</p>
              </div>
              {[
                { icon: <User size={13} />,     label: "My Profile",  href: "/admin/profile"   },
                { icon: <Settings size={13} />, label: "Settings",    href: "/admin/settings"  },
              ].map(item => (
                <a key={item.label} href={item.href}
                  className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-slate-400">{item.icon}</span>{item.label}
                </a>
              ))}
              <div className="my-1 border-t border-slate-100" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={13} />Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 p-3 bg-white border-b border-slate-100 shadow-lg z-50">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-amber-400 focus-within:bg-white transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders, products, users..."
              className="flex-1 bg-transparent text-[13.5px] text-slate-700 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}