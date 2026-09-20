import type { ProverbEntry } from "./expanded-content";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type Variables = Record<string, string | number>;

const proverbUiEnglish = {
  proverb: "Proverb",
  maxim: "Maxim",
  round: "ROUND",
  label: "PROVERB & MAXIM TYPING",
  heading: "Type the wisdom, remember the rhythm.",
  instructions: "Type the complete line and press Enter. Press Alt+P to hear it first.",
  inputLabel: "Korean line",
  checkSpacing: "Check the spacing and type the full line exactly.",
  success: "Excellent. Listen once, then the next line will appear.",
  complete: "Complete — press Enter.",
  exact: "Match every space and character.",
  check: "Check line",
} as const;

type ProverbUiKey = keyof typeof proverbUiEnglish | "position" | "line";

const proverbUiKorean: Record<keyof typeof proverbUiEnglish, string> = {
  proverb: "속담",
  maxim: "격언",
  round: "회차",
  label: "속담·격언 쓰기",
  heading: "지혜의 문장을 타자로 익혀보세요.",
  instructions: "전체 문장을 입력하고 Enter를 누르세요. Alt+P로 먼저 들을 수 있어요.",
  inputLabel: "한국어 문장",
  checkSpacing: "띄어쓰기를 확인하고 전체 문장을 정확히 입력하세요.",
  success: "훌륭해요. 발음을 들은 뒤 다음 문장이 이어집니다.",
  complete: "완성됐어요. Enter를 누르세요.",
  exact: "띄어쓰기와 글자를 그대로 맞춰 주세요.",
  check: "문장 확인",
};

function interpolate(value: string, variables?: Variables): string {
  if (!variables) return value;
  return Object.entries(variables).reduce(
    (result, [key, replacement]) => result.replaceAll(`{{${key}}}`, String(replacement)),
    value,
  );
}

export function proverbTr(locale: Locale, key: ProverbUiKey, variables?: Variables): string {
  if (key === "position") {
    return `${tr(locale, proverbUiEnglish.inputLabel, proverbUiKorean.inputLabel)} ${variables?.current ?? ""}/${variables?.total ?? ""}`;
  }
  if (key === "line") {
    return `${tr(locale, proverbUiEnglish.inputLabel, proverbUiKorean.inputLabel)} ${variables?.current ?? ""}`;
  }
  return interpolate(
    tr(locale, proverbUiEnglish[key], proverbUiKorean[key]),
    variables,
  );
}

export function localizedProverbMeaning(entry: ProverbEntry, locale: Locale): string {
  return tr(locale, entry.meaningEn, entry.meaningKo);
}

export function localizedProverbKind(entry: ProverbEntry, locale: Locale): string {
  return proverbTr(locale, entry.kindEn === "Maxim" ? "maxim" : "proverb");
}

export function localizedProverbCard(locale: Locale) {
  return {
    kicker: "✦ 5′",
    title: `${proverbTr(locale, "proverb")} · ${proverbTr(locale, "maxim")}`,
    description: tr(
      locale,
      "Build fluent rhythm with timeless Korean sayings and practical maxims.",
      "한국 속담과 생활 격언을 정확하게 입력하며 문장 리듬을 익혀보세요.",
    ),
    time: "82+ · ∞",
  };
}
