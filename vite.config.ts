import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  plugins: [tailwindcss(), react({ compiler: { logDiagnostics: true } })],
  build: {
    target: "esnext",
    // Served next to `index.html`, the notices that the bundled packages require.
    license: { fileName: "licenses.txt" },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, ".direnv/**"],
  },
});
