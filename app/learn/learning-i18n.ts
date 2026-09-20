"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../locale-detection";
import { translationQualityIssue } from "../translation-quality";
import { tr } from "../ui-i18n";

type LocalePack = Record<string, string>;

const mergedPacks: Partial<Record<Locale, LocalePack>> = {};
const loadedBundles = new Set<string>();
const pendingBundles = new Map<string, Promise<void>>();

function bundleKey(locale: Locale, bundle: string): string {
  return `${locale}:${bundle}`;
}

function bundleUrl(locale: Locale, bundle: string): string {
  const safeLocale = encodeURIComponent(locale);
  if (bundle === "common") return `/i18n/learn/common/${safeLocale}.json`;
  return `/i18n/learn/${encodeURIComponent(bundle)}/${safeLocale}.json`;
}

function loadLearningBundle(locale: Locale, bundle: string): Promise<void> {
  if (locale === "en") return Promise.resolve();

  const key = bundleKey(locale, bundle);
  if (loadedBundles.has(key)) return Promise.resolve();
  const pending = pendingBundles.get(key);
  if (pending) return pending;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2_500);
  const load = fetch(bundleUrl(locale, bundle), {
    cache: "no-cache",
    credentials: "same-origin",
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Learning locale bundle ${key} returned ${response.status}`);
      const candidate = await response.json() as unknown;
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        throw new Error(`Learning locale bundle ${key} is invalid`);
      }

      const verified: LocalePack = {};
      for (const [english, value] of Object.entries(candidate)) {
        if (typeof value === "string" && !translationQualityIssue(english, value)) {
          verified[english] = value;
        }
      }
      mergedPacks[locale] = { ...mergedPacks[locale], ...verified };
      loadedBundles.add(key);
    })
    .finally(() => {
      window.clearTimeout(timeout);
      pendingBundles.delete(key);
    });

  pendingBundles.set(key, load);
  return load;
}

export function loadLearningTranslations(locale: Locale, guideSlug?: string): Promise<void> {
  const bundles = [loadLearningBundle(locale, "common")];
  if (guideSlug) bundles.push(loadLearningBundle(locale, guideSlug));
  return Promise.all(bundles).then(() => undefined);
}

export function learningTr(locale: Locale, english: string, korean?: string): string {
  if (locale === "ko" && korean) return tr(locale, english, korean);
  return mergedPacks[locale]?.[english] ?? tr(locale, english, korean);
}

export function useLearningTranslations(locale: Locale, guideSlug?: string): boolean {
  const key = `${locale}:${guideSlug ?? "common"}`;
  const [loadedKey, setLoadedKey] = useState(() => locale === "en" ? key : "");

  useEffect(() => {
    let active = true;
    void loadLearningTranslations(locale, guideSlug)
      .then(() => {
        if (active) setLoadedKey(key);
      })
      .catch((error: unknown) => {
        // English remains a complete fallback if a locale bundle is unavailable.
        console.error("Could not load the learning locale bundle.", error);
        if (active) setLoadedKey(key);
      });
    return () => {
      active = false;
    };
  }, [guideSlug, key, locale]);

  return locale === "en" || loadedKey === key;
}
