import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk - rarely changes
          vendor: ["react", "react-dom"],
          // Framer Motion separate chunk
          motion: ["framer-motion"],
        },
      },
    },
    // Use esbuild for faster builds
    minify: "esbuild",
    // No source maps in production
    sourcemap: false,
    // Asset size warning
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Server options
  server: {
    port: 5173,
    host: true,
  },
  // Optimization
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "axios"],
  },
});
