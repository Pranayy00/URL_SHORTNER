import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, requests to /api/* are forwarded to your local backend (default: localhost:8001).
// This avoids needing CORS enabled while you're developing.
// In production, the app talks directly to VITE_API_BASE_URL (see .env.example).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET || "http://localhost:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
