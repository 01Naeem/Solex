/**
 * components/admin/AdminFooter.jsx
 * Solex Admin — Minimal Footer
 */

export default function AdminFooter() {
  return (
    <footer
      className="border-t border-slate-100 bg-white px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-slate-400 shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <span>© 2026 <span className="font-semibold text-slate-600">Solex</span> Admin Panel. All rights reserved.</span>
      <div className="flex items-center gap-4">
        {["Privacy Policy", "Terms", "Support"].map((link, i) => (
          <a
            key={link}
            href={`/admin/${link.toLowerCase().replace(" ", "-")}`}
            className="hover:text-slate-700 transition-colors font-medium"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}