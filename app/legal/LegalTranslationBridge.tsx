"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "../locale-detection";
import { getRuntimeTranslation } from "../runtime-i18n";
import { useActiveLocale } from "../use-active-locale";
import { useLocaleTranslations } from "../use-locale-translations";
import { adsenseNoticeKo } from "./adsense-notice";

const translatableAttributes = ["aria-label", "title"] as const;
const foreignLegalKeyAliases: Record<string, string> = {
  "개인정보처리방침 · 이용약관 · 쿠키/광고 · 저작권 · 아동 안전 · 접근성": "Privacy policy · Terms of use · Cookies and advertising · Copyright · Child safety · Accessibility",
  "개인정보처리방침 · PRIVACY POLICY": "PRIVACY POLICY",
  "이용약관 · TERMS OF USE": "TERMS OF USE",
  "쿠키·광고 정책 · COOKIES & ADS": "COOKIES & ADS",
  "저작권·콘텐츠 정책 · COPYRIGHT": "COPYRIGHT & CONTENT POLICY",
  "아동·가족 안전 · CHILD SAFETY": "CHILD & FAMILY SAFETY",
  "접근성 · ACCESSIBILITY": "ACCESSIBILITY",
};

function normalized(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function LegalTranslationBridge() {
  const locale = useActiveLocale();
  const translationsReady = useLocaleTranslations(locale);
  const originalText = useRef(new Map<Text, string>());
  const originalAttributes = useRef(new Map<Element, Map<string, string>>());
  const originalTitle = useRef<string | null>(null);
  const originalDescription = useRef<string | null>(null);

  useEffect(() => {
    const root = document.querySelector(".legal-shell");
    if (!root || (locale !== "en" && !translationsReady)) return;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (originalTitle.current === null) originalTitle.current = document.title;
    if (originalDescription.current === null) originalDescription.current = description?.content ?? "";
    document.title = locale === "en"
      ? originalTitle.current
      : getRuntimeTranslation(locale, originalTitle.current) ?? originalTitle.current;
    if (description && originalDescription.current) {
      description.content = locale === "en"
        ? originalDescription.current
        : getRuntimeTranslation(locale, originalDescription.current) ?? originalDescription.current;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const node = current as Text;
      if (!originalText.current.has(node)) {
        originalText.current.set(node, node.nodeValue ?? "");
      }
      const original = originalText.current.get(node) ?? "";
      const normalizedOriginal = normalized(original);
      const preserveKoreanLabel = locale === "ko" && normalizedOriginal in foreignLegalKeyAliases;
      const key = locale === "ko"
        ? normalizedOriginal
        : foreignLegalKeyAliases[normalizedOriginal] ?? normalizedOriginal;
      const translated = locale === "en" || preserveKoreanLabel
        ? undefined
        : (locale === "ko" ? adsenseNoticeKo[key] : undefined) ?? getRuntimeTranslation(locale, key);
      node.nodeValue = translated && key ? translated : original;
      current = walker.nextNode();
    }

    for (const element of root.querySelectorAll("*")) {
      let saved = originalAttributes.current.get(element);
      if (!saved) {
        saved = new Map<string, string>();
        originalAttributes.current.set(element, saved);
      }
      for (const attribute of translatableAttributes) {
        const currentValue = element.getAttribute(attribute);
        if (currentValue !== null && !saved.has(attribute)) saved.set(attribute, currentValue);
        const original = saved.get(attribute);
        if (!original) continue;
        const translated = locale === "en"
          ? undefined
          : getRuntimeTranslation(locale as Locale, normalized(original));
        element.setAttribute(attribute, translated ?? original);
      }
    }

    // The root layout hides translated app surfaces until their first stable
    // frame. Legal copy is now ready, so do not make visitors wait for the
    // four-second emergency fallback before revealing the document.
    const documentRoot = document.documentElement;
    documentRoot.removeAttribute("data-app-booting");
    documentRoot.setAttribute("data-app-ready", "legal");
  }, [locale, translationsReady]);

  return null;
}
