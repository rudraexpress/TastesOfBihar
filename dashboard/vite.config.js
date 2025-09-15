import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/dashboard/",
  server: {
    port: 5176, // Updated to match actual running port
  },
  build: {
    outDir: "dist",
  },
});
