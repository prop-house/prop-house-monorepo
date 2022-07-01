import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(ChainedBackend)
  .init({
    fallbackLng: "en",
    backend: {
      backends: [HttpBackend, LocalStorageBackend],
      backendOptions: [{ loadPath: "/locales/{{lng}}.json" }],
    },
    interpolation: { escapeValue: false },
  });
