/**
 * components/admin/AdminSidebar.jsx
 * Solex Admin — Collapsible Left Sidebar
 */

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  BarChart3, Settings, ChevronDown, Plus, List,
  Shield, X, Boxes,
} from "lucide-react";

const NAV = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    to: "/admin",
    exact: true,
  },
  {
    label: "Products",
    icon: <Package size={16} />,
    children: [
      { label: "Manage Products", to: "/admin/products",     icon: <List size={14} /> },
      { label: "Add Product",     to: "/admin/products/add", icon: <Plus size={14} /> },
    ],
  },
  {
    label: "Orders",
    icon: <ShoppingCart size={16} />,
    to: "/admin/orders",
  },
  {
    label: "Users",
    icon: <Users size={16} />,
    to: "/admin/users",
  },
  {
    label: "Categories",
    icon: <Boxes size={16} />,
    to: "/admin/categories",
  },
  {
    label: "Analytics",
    icon: <BarChart3 size={16} />,
    to: "/admin/analytics",
  },
  {
    label: "Settings",
    icon: <Settings size={16} />,
    to: "/admin/settings",
  },
];

export default function AdminSidebar({ open, collapsed, onClose, onCollapseToggle }) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({ Products: true });

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem("solex-admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const isActive = (to, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const toggleGroup = (label) =>
    setExpandedGroups(p => ({ ...p, [label]: !p[label] }));

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-slate-100 shrink-0 ${collapsed ? "justify-center px-3" : "px-5 gap-3"}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
          <Shield size={15} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[17px] font-black text-slate-900 leading-tight tracking-widest"
              style={{ fontFamily: "'Barlow Condensed', Impact, sans-serif" }}>
              SOLEX
            </p>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-slate-400 leading-tight">
              Admin Panel
            </p>
          </div>
        )}
        {/* Mobile close */}
        <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-700 p-1">
          <X size={16} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map(item => {
          if (item.children) {
            const anyChildActive = item.children.some(c => isActive(c.to));
            const isExpanded = expandedGroups[item.label];

            return (
              <div key={item.label}>
                {/* Group header */}
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={[
                    "w-full flex items-center rounded-xl transition-all duration-150 group",
                    collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    anyChildActive
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  <span className={`shrink-0 ${anyChildActive ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-[13px] font-semibold">{item.label}</span>
                      <ChevronDown
                        size={13}
                        className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>

                {/* Children */}
                {!collapsed && (
                  <div className={`overflow-hidden transition-all duration-250 ${isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="ml-4 pl-4 border-l border-slate-100 mt-0.5 space-y-0.5 pb-1">
                      {item.children.map(child => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={onClose}
                          className={({ isActive: a }) => [
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors duration-150",
                            a
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          <span>{child.icon}</span>
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsed: show children as tooltips (simplified) */}
                {collapsed && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        title={child.label}
                        className={({ isActive: a }) => [
                          "flex items-center justify-center p-2.5 rounded-xl transition-colors duration-150",
                          a
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                        ].join(" ")}
                      >
                        {child.icon}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive: a }) => [
                "flex items-center rounded-xl transition-all duration-150 group",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                a
                  ? "bg-amber-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.35)]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {({ isActive: a }) => (
                <>
                  <span className={`shrink-0 ${a ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-[13px] font-semibold">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden lg:block border-t border-slate-100 p-3">
        <button
          onClick={onCollapseToggle}
          className={`w-full flex items-center rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-300 ${collapsed ? "rotate-90" : "-rotate-90"}`}
          />
          {!collapsed && "Collapse sidebar"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={[
        "fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-100 shadow-[2px_0_24px_rgba(0,0,0,0.06)]",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col",
        // Desktop: always visible, width toggles
        collapsed ? "lg:w-[60px]" : "lg:w-[220px]",
        // Mobile: slide in/out
        open ? "translate-x-0 w-[220px]" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}>
        {sidebarContent}
      </aside>
    </>
  );
}