import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@late/theme": resolve(__dirname, "../late.kodingvibes.com/packages/late-theme"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
    lib: {
      entry: resolve(__dirname, "src/entry.ts"),
      name: "LateMicroRadio",
      formats: ["es"],
      fileName: () => "entry.js",
    },
    cssCodeSplit: false,
    rollupOptions: {
      // React lives in /vendor/vendor.js, shared with the shell via the
      // import map. One React instance in the page.
      external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
      output: {
        entryFileNames: "entry.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: (info) => {
          if (info.name?.endsWith(".css")) return "style.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5181,
    strictPort: true,
  },
});
