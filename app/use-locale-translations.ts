"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./locale-detection";
import { hasRuntimeTranslations, loadRuntimeTranslations } from "./runtime-i18n";

export function useLocaleTranslations(locale: Locale, enabled = true): boolean {
  const [loadedLocale, setLoadedLocale] = useState<Locale | null>(
    hasRuntimeTranslations(locale) ? locale : null,
  );

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadRuntimeTranslations(locale)
      .then(() => {
        if (active) setLoadedLocale(locale);
      })
      .catch((error: unknown) => {
        console.error("Could not load the static locale pack.", error);
        // Never leave the application boot screen hidden indefinitely. The
        // reviewed inline copy and English fallback remain usable offline.
        if (active) setLoadedLocale(locale);
      });
    return () => {
      active = false;
    };
  }, [enabled, locale]);

  return !enabled || hasRuntimeTranslations(locale) || loadedLocale === locale;
}
