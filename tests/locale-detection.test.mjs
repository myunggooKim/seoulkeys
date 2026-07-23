import assert from "node:assert/strict";
import test from "node:test";

import {
  localeSourceStorageKey,
  localeStorageKey,
  manualLocaleSource,
  readManualLocalePreference,
  resolveVisitorLocale,
  saveManualLocalePreference,
} from "../app/locale-detection.ts";

test("uses Korean for an English-browser visitor in Korea", () => {
  assert.equal(resolveVisitorLocale({ languages: ["en-US"], timeZone: "Asia/Seoul" }), "ko");
  assert.equal(resolveVisitorLocale({ languages: ["en-US"], countryCode: "KR" }), "ko");
});

test("maps K-culture target countries to their local interface languages", () => {
  const cases = [
    ["BR", "pt-BR"],
    ["PH", "fil"],
    ["TH", "th"],
    ["ID", "id"],
    ["MY", "ms"],
    ["VN", "vi"],
    ["IR", "fa"],
    ["SA", "ar"],
    ["KZ", "kk"],
  ];
  for (const [countryCode, expected] of cases) {
    assert.equal(resolveVisitorLocale({ languages: ["en-US"], countryCode }), expected);
  }
});

test("respects a supported non-English browser language before geography", () => {
  assert.equal(resolveVisitorLocale({ languages: ["pt-BR"], countryCode: "KR" }), "pt-BR");
  assert.equal(resolveVisitorLocale({ languages: ["ko-KR"], countryCode: "US" }), "ko");
  assert.equal(resolveVisitorLocale({ languages: ["zh-TW"], countryCode: "US" }), "zh-Hant");
});

test("falls back to English only when no supported regional signal exists", () => {
  assert.equal(resolveVisitorLocale({ languages: ["sv-SE"], timeZone: "Europe/Stockholm" }), "en");
});

test("ignores the old automatically polluted English value", () => {
  const values = new Map([[localeStorageKey, "en"]]);
  const storage = { getItem: (key) => values.get(key) ?? null };
  assert.equal(readManualLocalePreference(storage), null);
});

test("persists and restores only an explicit language choice", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  saveManualLocalePreference(storage, "ko");
  assert.equal(values.get(localeSourceStorageKey), manualLocaleSource);
  assert.equal(readManualLocalePreference(storage), "ko");
});
