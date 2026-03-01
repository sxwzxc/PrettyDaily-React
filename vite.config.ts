import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "app",
  base: "./",
  resolve: {
    alias: {
      "@liquid": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "app"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
