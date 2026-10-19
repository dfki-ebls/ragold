import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  plugins: [tailwindcss(), react()],
  build: {
    target: "esnext",
    // Served next to `index.html`, the notices that the bundled packages require.
    license: { fileName: "licenses.txt" },
  },
  test: {
    environment: "jsdom",
  },
});
