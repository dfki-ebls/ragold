import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { de } from "./locales/de";
import { en } from "./locales/en";

export const defaultNS = "translation";

export const resources = {
  en: { translation: en },
  de: { translation: de },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages: SupportedLanguage[] = ["en", "de"];

export const defaultLanguage: SupportedLanguage = "en";

function detectBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split("-")[0];
  if (supportedLanguages.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  return defaultLanguage;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectBrowserLanguage(),
  fallbackLng: defaultLanguage,
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language;

export default i18n;
