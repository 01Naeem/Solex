/**
 * vite.config.js
 * Solex Admin — Vite configuration with API proxy
 *
 * WHY THE PROXY?
 * ──────────────
 * Without this, any request to /api/... from the browser hits Vite's
 * dev server (port 5173), which returns your React app's index.html.
 *
 * With the proxy, requests to /api/... are transparently forwarded to
 * your Express/Node backend (port 5000 by default) during development.
 * This also avoids CORS issues because the browser always talks to
 * localhost:5173, and Vite forwards server-side.
 *
 * CHANGE THE TARGET to match your backend port.
 * Common setups:
 *   Express default  → http://localhost:5000
 *   NestJS default   → http://localhost:3000
 *   Django default   → http://localhost:8000
 *   Laravel default  → http://localhost:8000
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    proxy: {
      // All requests starting with /api will be forwarded to your backend
      "/api": {
        target:      "http://localhost:5000", // ← change this to your backend port
        changeOrigin: true,
        secure:       false,

        // If your backend routes don't have /api prefix, rewrite it away:
        // rewrite: (path) => path.replace(/^\/api/, ""),

        // If your backend DOES have /api prefix (e.g. GET /api/admin/products), keep as-is.
      },
    },
  },
});