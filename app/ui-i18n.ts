import type { Locale } from "./locale-detection";
import { getRuntimeTranslation } from "./runtime-i18n";

// Reviewed Korean supplied by the call site wins; otherwise Korean and every
// other translated locale use one static JSON pack. The main application
// bundle therefore never contains every language at once.
export function tr(locale: Locale, en: string, ko?: string): string {
  if (locale === "ko") return ko ?? getRuntimeTranslation("ko", en) ?? en;
  if (locale === "en") return en;
  return getRuntimeTranslation(locale, en) ?? en;
}
