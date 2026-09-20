"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  type Locale,
  readManualLocalePreference,
  resolveVisitorLocale,
} from "./locale-detection";
import { useLocaleTranslations } from "./use-locale-translations";

const rtlLocales = new Set<Locale>(["ar", "fa", "ur"]);

function subscribeLocaleChange(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("seoulkeys-locale-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("seoulkeys-locale-change", onStoreChange);
  };
}

function localeSnapshot(): Locale {
  return readManualLocalePreference(window.localStorage)
    ?? resolveVisitorLocale({
      languages: navigator.languages?.length ? navigator.languages : [navigator.language],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
}

export function useActiveLocale({
  loadRuntimePack = true,
}: {
  loadRuntimePack?: boolean;
} = {}): Locale {
  const locale = useSyncExternalStore<Locale>(subscribeLocaleChange, localeSnapshot, () => "en");
  useLocaleTranslations(locale, loadRuntimePack);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  }, [locale]);

  return locale;
}
