export type Locale =
  | "en" | "ko" | "es" | "pt-BR" | "ja" | "zh-Hans" | "zh-Hant"
  | "fr" | "de" | "it" | "pl" | "nl" | "ru" | "tr"
  | "ar" | "fa" | "ur" | "fil" | "th" | "id" | "ms" | "vi"
  | "my" | "km" | "lo" | "hi" | "bn" | "ta" | "ne" | "si"
  | "kk" | "uz" | "mn";

export const localeStorageKey = "hangeul-pop-locale";
export const localeSourceStorageKey = "hangeul-pop-locale-source";
export const manualLocaleSource = "manual-v1";

export const supportedLocaleCodes: readonly Locale[] = [
  "en", "ko", "es", "pt-BR", "ja", "zh-Hans", "zh-Hant",
  "fr", "de", "it", "pl", "nl", "ru", "tr", "ar", "fa", "ur",
  "fil", "th", "id", "ms", "vi", "my", "km", "lo", "hi", "bn",
  "ta", "ne", "si", "kk", "uz", "mn",
];

const supportedLocales = new Set<Locale>(supportedLocaleCodes);

const localeByBrowserCode: Record<string, Locale> = {
  en: "en", ko: "ko", es: "es", pt: "pt-BR", ja: "ja", zh: "zh-Hans",
  fr: "fr", de: "de", it: "it", pl: "pl", nl: "nl", ru: "ru", tr: "tr",
  ar: "ar", fa: "fa", ur: "ur", fil: "fil", tl: "fil", th: "th", id: "id",
  ms: "ms", vi: "vi", my: "my", km: "km", lo: "lo", hi: "hi", bn: "bn",
  ta: "ta", ne: "ne", si: "si", kk: "kk", uz: "uz", mn: "mn",
};

const localeByCountry: Record<string, Locale> = {
  KR: "ko",
  JP: "ja",
  CN: "zh-Hans", SG: "zh-Hans",
  TW: "zh-Hant", HK: "zh-Hant", MO: "zh-Hant",
  BR: "pt-BR",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  EC: "es", BO: "es", PY: "es", UY: "es", CR: "es", PA: "es", GT: "es",
  HN: "es", SV: "es", NI: "es", DO: "es", CU: "es",
  FR: "fr", BE: "fr",
  DE: "de", AT: "de", CH: "de",
  IT: "it",
  PL: "pl",
  NL: "nl",
  RU: "ru", BY: "ru",
  TR: "tr",
  PH: "fil",
  TH: "th",
  ID: "id",
  MY: "ms",
  VN: "vi",
  MM: "my",
  KH: "km",
  LA: "lo",
  IN: "hi",
  PK: "ur",
  BD: "bn",
  NP: "ne",
  LK: "si",
  IR: "fa",
  SA: "ar", AE: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar",
  EG: "ar", JO: "ar", LB: "ar", IQ: "ar", SY: "ar", YE: "ar",
  KZ: "kk",
  UZ: "uz",
  MN: "mn",
};

const localeByTimeZone: Record<string, Locale> = {
  "Asia/Seoul": "ko",
  "Asia/Tokyo": "ja",
  "Asia/Shanghai": "zh-Hans",
  "Asia/Chongqing": "zh-Hans",
  "Asia/Harbin": "zh-Hans",
  "Asia/Urumqi": "zh-Hans",
  "Asia/Taipei": "zh-Hant",
  "Asia/Hong_Kong": "zh-Hant",
  "Asia/Macau": "zh-Hant",
  "America/Sao_Paulo": "pt-BR",
  "America/Fortaleza": "pt-BR",
  "America/Recife": "pt-BR",
  "America/Manaus": "pt-BR",
  "Asia/Manila": "fil",
  "Asia/Bangkok": "th",
  "Asia/Jakarta": "id",
  "Asia/Makassar": "id",
  "Asia/Jayapura": "id",
  "Asia/Kuala_Lumpur": "ms",
  "Asia/Kuching": "ms",
  "Asia/Ho_Chi_Minh": "vi",
  "Asia/Yangon": "my",
  "Asia/Phnom_Penh": "km",
  "Asia/Vientiane": "lo",
  "Asia/Kolkata": "hi",
  "Asia/Karachi": "ur",
  "Asia/Dhaka": "bn",
  "Asia/Kathmandu": "ne",
  "Asia/Colombo": "si",
  "Asia/Tehran": "fa",
  "Asia/Riyadh": "ar",
  "Asia/Dubai": "ar",
  "Asia/Qatar": "ar",
  "Asia/Kuwait": "ar",
  "Asia/Bahrain": "ar",
  "Asia/Muscat": "ar",
  "Europe/Istanbul": "tr",
  "Asia/Almaty": "kk",
  "Asia/Aqtobe": "kk",
  "Asia/Tashkent": "uz",
  "Asia/Samarkand": "uz",
  "Europe/Moscow": "ru",
  "Europe/Berlin": "de",
  "Europe/Vienna": "de",
  "Europe/Rome": "it",
  "Europe/Warsaw": "pl",
  "Europe/Amsterdam": "nl",
  "Asia/Ulaanbaatar": "mn",
  "Europe/Madrid": "es",
  "America/Mexico_City": "es",
  "America/Bogota": "es",
  "America/Lima": "es",
  "America/Santiago": "es",
  "America/Argentina/Buenos_Aires": "es",
  "Europe/Paris": "fr",
};

export function isSupportedLocale(value: string | null): value is Locale {
  return Boolean(value && supportedLocales.has(value as Locale));
}

function browserLocale(language: string | undefined): Locale | null {
  if (!language) return null;
  const normalized = language.toLowerCase();
  if (normalized === "zh-tw" || normalized === "zh-hk" || normalized === "zh-mo" || normalized.includes("hant")) {
    return "zh-Hant";
  }
  if (normalized === "pt-br") return "pt-BR";
  return localeByBrowserCode[normalized.split("-")[0]] ?? null;
}

export function resolveVisitorLocale({
  languages,
  timeZone,
  countryCode,
}: {
  languages: readonly string[];
  timeZone?: string | null;
  countryCode?: string | null;
}): Locale {
  const primaryBrowserLocale = browserLocale(languages[0]);
  if (primaryBrowserLocale && primaryBrowserLocale !== "en") return primaryBrowserLocale;

  const normalizedCountry = countryCode?.trim().toUpperCase() ?? "";
  const geographicLocale = localeByCountry[normalizedCountry] ?? (timeZone ? localeByTimeZone[timeZone] : null);
  if (geographicLocale) return geographicLocale;

  for (const language of languages) {
    const matched = browserLocale(language);
    if (matched) return matched;
  }
  return "en";
}

export function readManualLocalePreference(storage: { getItem(key: string): string | null }): Locale | null {
  const value = storage.getItem(localeStorageKey);
  const source = storage.getItem(localeSourceStorageKey);
  if (source === manualLocaleSource && isSupportedLocale(value)) return value;
  // Before source tracking existed, every first visit accidentally saved English.
  // Preserve old non-English choices, but ignore the polluted automatic English value.
  if (!source && value !== "en" && isSupportedLocale(value)) return value;
  return null;
}

export function saveManualLocalePreference(storage: { setItem(key: string, value: string): void }, locale: Locale) {
  storage.setItem(localeStorageKey, locale);
  storage.setItem(localeSourceStorageKey, manualLocaleSource);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("seoulkeys-locale-change"));
  }
}
