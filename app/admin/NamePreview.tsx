"use client";

import { useState } from "react";
import { hangulNameOffer, toHangulName } from "../hangul-name";
import { KoreanNameCard } from "../KoreanNameCard";

/**
 * Owner-only: what a member is shown when the site writes their name in Hangul.
 *
 * The owner cannot see this on their own account — their name is already Hangul,
 * and Korean members are excluded from the offer on purpose — so without a way
 * to look at it on demand the feature is invisible to the person responsible for
 * it. Typing a name here also answers the question that actually matters: is the
 * transliteration right for the people who have signed up?
 */
export function NamePreview({ sampleNames }: { sampleNames: string[] }) {
  const [name, setName] = useState(sampleNames[0] ?? "Ana Silva");
  const hangul = toHangulName(name);
  // What the live rule would decide for this name on a Korean account, so the
  // exclusion can be seen working rather than taken on trust.
  const asKorean = hangulNameOffer({ fullName: name, country: "KR" });

  return (
    <section className="name-preview">
      <h2>한글 이름 카드 미리보기</h2>
      <p className="name-preview-note">
        가입자에게 보이는 화면입니다. 사장님 계정은 이름이 이미 한글이라 실제로는 뜨지 않습니다.
      </p>

      <label className="name-preview-field">
        <span>이름</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ana Silva"
          spellCheck={false}
        />
      </label>

      {sampleNames.length > 0 && (
        <div className="name-preview-samples">
          {sampleNames.map((sample) => (
            <button key={sample} type="button" onClick={() => setName(sample)}>
              {sample}
            </button>
          ))}
        </div>
      )}

      {hangul ? (
        <>
          <KoreanNameCard locale="ko" hangul={hangul} original={name.trim()} />
          <p className="name-preview-note">
            한국 계정이라면: {asKorean ? "표시됨 (규칙 오류)" : "표시 안 함 ✓"} ·{" "}
            <a href={`/?namecard=${encodeURIComponent(name.trim())}`} target="_blank" rel="noopener noreferrer">
              팝업으로 열어보기 →
            </a>
          </p>
        </>
      ) : (
        <p className="name-preview-none">
          이 이름은 변환하지 않습니다. 이미 한글이거나, 정직하게 옮길 수 없는 문자입니다 — 틀린 이름을 보여주느니 아무것도 보여주지 않습니다.
        </p>
      )}
    </section>
  );
}
