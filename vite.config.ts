import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Auto-sets correct base path on GitHub Pages (e.g. /your-repo-name/)
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || "/",
  build: { sourcemap: true },
});
