import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import { ThemeProvider } from "./components/ThemeProvider";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
