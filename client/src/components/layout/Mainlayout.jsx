import SolexSidebar, {
  SidebarToggleBtn,
  DEFAULT_FILTERS,
} from "./Sidebar/Solexsidebar";
import SolexFooter from "./Footer/Solexfooter";
import { useState, useEffect } from "react";
import Solexnavbar from "./Navbar/Solexnavbar";
import { Outlet, useLocation } from "react-router-dom";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showOnScroll, setShowOnScroll] = useState(true);

  const location = useLocation();

  const showFilterBtn =
    location.pathname.startsWith("/collections") ||
    location.pathname.startsWith("/new-arrivals") ||
    location.pathname.startsWith("/products");

  const activeCount = Object.values(filters).flat().filter(Boolean).length;

  /**
   * Lock body scroll when sidebar is open
   */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  /**
   * Scroll detection (DOWN → show, UP → hide)
   */
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // prevent micro jitter
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;

      if (currentScrollY > lastScrollY) {
        // scrolling DOWN → show button
        setShowOnScroll(true);
      } else {
        // scrolling UP → hide button
        setShowOnScroll(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a]">
      {/* Navbar */}
      <Solexnavbar cartCount={7} />

      {/* <div className="h-18 md:h-24" /> */}

      {/* Overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={[
          "fixed top-0 left-0 h-full z-50",
          "w-[85vw] max-w-[320px]",
          "bg-white dark:bg-[#0d0d0d]",
          "shadow-[4px_0_40px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_40px_rgba(0,0,0,0.7)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-100 dark:border-white/[0.06]">
          <span className="text-[13px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Filters
            {activeCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </span>

          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close filters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <SolexSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          recentlyViewed={[
            {
              id: 1,
              name: "SolexAir Pro",
              price: 4999,
              image: "",
              to: "/products/solexair-pro",
            },
            {
              id: 2,
              name: "CloudRun X",
              price: 3499,
              image: "",
              to: "/products/cloudrun-x",
            },
          ]}
        />
      </div>

      {/* Floating Filter Button */}
      {showFilterBtn && (
        <div
          className={`
      fixed z-50

      left-3 right-3 sm:left-6 sm:right-auto
      md:left-8 lg:left-43 top-[-5]

      top-[88px] sm:top-[96px] md:top-[110px]

      flex justify-start

      transition-all duration-300 ease-out

      ${
        showOnScroll
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }
    `}
        >
          <div className="w-full sm:w-auto">
            <SidebarToggleBtn
              onClick={() => setSidebarOpen((p) => !p)}
              activeCount={activeCount}
            />
          </div>
        </div>
      )}
      {/* Main content */}
      <main className="flex-1 w-full pt-16 md:pt-24">
        <Outlet />
      </main>

      {/* Footer */}
      <SolexFooter />
    </div>
  );
}

export default MainLayout;
