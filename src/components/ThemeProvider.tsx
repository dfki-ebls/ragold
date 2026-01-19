import { useEffect } from "react";

/**
 * Applies the system color scheme preference to the document.
 * Adds or removes the "dark" class on the root element based on the
 * user's operating system preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(mediaQuery);
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, []);

  return <>{children}</>;
}
