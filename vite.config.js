import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Local dev uchun root base
  base: "/",
  server: {
    proxy: {
      // Frontend -> Backend proxy (CORS muammosiz)
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
