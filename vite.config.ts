import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  plugins: [tailwindcss(), react()],
  build: {
    target: "esnext",
  },
  esbuild: {
    target: "esnext",
  },
});
