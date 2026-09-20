import type { Locale } from "./locale-detection";
import { translationQualityIssue } from "./translation-quality";

type LocalePack = Record<string, string>;

const packs: Partial<Record<Locale, LocalePack>> = {};
const pendingLoads = new Map<Locale, Promise<void>>();

export function getRuntimeTranslation(locale: Locale, key: string): string | undefined {
  return packs[locale]?.[key];
}

export function hasRuntimeTranslations(locale: Locale): boolean {
  return locale === "en" || Boolean(packs[locale]);
}

export function loadRuntimeTranslations(locale: Locale): Promise<void> {
  if (hasRuntimeTranslations(locale)) return Promise.resolve();
  const pending = pendingLoads.get(locale);
  if (pending) return pending;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  const load = fetch(`/i18n/${encodeURIComponent(locale)}.json`, {
    /* "no-cache", not "force-cache". force-cache reuses a stored pack whatever
       its age and without asking the server, so a visitor who loaded the site
       once kept the old translations for ever — new strings stayed English no
       matter how many times the packs were redeployed. The server sends an
       ETag, so revalidating costs a 304 and the body is reused. */
    cache: "no-cache",
    credentials: "same-origin",
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Locale pack ${locale} returned ${response.status}`);
      const candidate = await response.json() as unknown;
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        throw new Error(`Locale pack ${locale} is invalid`);
      }
      const verified: LocalePack = {};
      for (const [key, value] of Object.entries(candidate)) {
        if (typeof value === "string" && !translationQualityIssue(key, value)) {
          verified[key] = value;
        }
      }
      packs[locale] = verified;
    })
    .finally(() => {
      window.clearTimeout(timeout);
      pendingLoads.delete(locale);
    });

  pendingLoads.set(locale, load);
  return load;
}
