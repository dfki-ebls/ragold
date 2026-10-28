import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
// Imported from JS rather than CSS so that `build.license` lists it.
import "@fontsource-variable/inter";
import "./styles.css";

const rootElement = document.getElementById("root");

// Ask the browser not to evict the stored data, denial is fine.
void navigator.storage?.persist().catch(() => false);

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster richColors position="top-center" offset="4rem" />
    </ThemeProvider>
  </StrictMode>,
);
