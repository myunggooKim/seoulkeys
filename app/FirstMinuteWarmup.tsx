"use client";

import { useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";
import { appendJamo } from "./hangul-compose";
import { warmupProgress, WARMUP_STEPS } from "./warmup";
import styles from "./FirstMinuteWarmup.module.css";

export function FirstMinuteWarmup({ locale }: { locale: Locale }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [name, setName] = useState("리라");
  const [finished, setFinished] = useState(false);
  const validName = /^[가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(name);
  const target = step < 2 ? WARMUP_STEPS[step] : validName ? name : "";
  const progress = warmupProgress(target, typed);
  const text = (en: string, ko: string) => tr(locale, en, ko);
  const next = () => { setStep((value) => value + 1); setTyped(""); };

  return (
    <details className={styles.panel} onKeyDown={(event) => event.stopPropagation()}>
      <summary>{text("New to Hangul? Try a 30-second warm-up", "한글이 처음인가요? 30초 준비 운동")}</summary>
      {finished ? <p role="status">✓ {text("Ready! Continue with the lesson below. Your saved progress has not changed.", "준비 완료! 아래 연습을 이어가세요. 기존 진도는 그대로입니다.")}</p> : <>
        <p>{step === 0
          ? text("Start with two keys: R (ㄱ), left index finger; J (ㅓ), right index finger. Type or tap the highlighted key.", "두 키로 시작해요. R(ㄱ)은 왼손 검지, J(ㅓ)는 오른손 검지입니다. 강조된 키를 누르거나 클릭하세요.")
          : step === 1 ? text("Two letters become one block: ㄱ + ㅏ = 가 (ga).", "자음과 모음이 한 글자로 합쳐져요: ㄱ + ㅏ = 가 (ga).")
          : text("Optional: enter your name in Hangul, then practice it. The example is 리라. This name stays only in this exercise.", "선택: 이름의 한글 표기를 입력하고 연습해 보세요. 예시는 리라입니다. 이름은 이 연습 안에서만 사용합니다.")}</p>
        {step === 2 && <label>{text("My name in Hangul", "내 이름의 한글 표기")}
          <input className={styles.input} value={name} maxLength={12} onChange={(event) => { setName(event.target.value); setTyped(""); }} />
          {!validName && <small>{text("Use Hangul letters only.", "한글로 입력해 주세요.")}</small>}
        </label>}
        <div className={styles.formula} aria-label={target} lang="ko">{target}</div>
        <div className={styles.keys}>
          {[...new Set(progress.expected)].map((jamo) => <button type="button" className={styles.key} key={jamo}
            aria-current={progress.expected[progress.matched] === jamo ? "true" : undefined}
            disabled={progress.complete}
            onClick={() => setTyped((value) => appendJamo(value, jamo))}>
            {jamo}<small>{({ "ㄱ": "R", "ㅓ": "J", "ㅏ": "K", "ㄹ": "F", "ㅣ": "L" } as Record<string, string>)[jamo]}</small>
          </button>)}
        </div>
        <label>{text("Try here (Korean keyboard or buttons above)", "여기에 입력하세요 (한글 키보드 또는 위 버튼)")}
          <input className={styles.input} value={typed} autoComplete="off" spellCheck={false}
            onChange={(event) => setTyped(event.target.value)} />
        </label>
        <p role="status">{progress.complete ? `✓ ${text("You did it!", "성공했어요!")}` : `${progress.matched} / ${progress.expected.length}`}
          {step === 1 && typed && <span className={styles.formula}> · ㄱ + ㅏ → {typed}</span>}
        </p>
        <div className={styles.keys}>
          <button type="button" className="button button-secondary" onClick={() => setTyped("")}>{text("Try again", "다시 하기")}</button>
          {step < 2 && <button type="button" className="button button-primary" disabled={!progress.complete} onClick={next}>{text("Next", "다음")}</button>}
          <button type="button" className="button button-secondary" onClick={() => setFinished(true)}>{text("Continue to lesson", "본 연습으로")}</button>
        </div>
      </>}
      {finished && <button type="button" className="button button-secondary" onClick={() => { setStep(0); setTyped(""); setFinished(false); }}>{text("Try again", "다시 하기")}</button>}
    </details>
  );
}
