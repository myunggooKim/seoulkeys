"use client";

import { type HTMLAttributes, type PointerEvent, type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "./locale-detection";
import type { WordGloss } from "./word-glossary";
import { fitGlossPosition } from "./word-meaning-position";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "p" | "blockquote";
  text: string;
  locale: Locale;
  children?: ReactNode;
};
let glossaryLoad: Promise<typeof import("./word-glossary")> | undefined;
const loadGlossary = () => glossaryLoad ??= import("./word-glossary").catch((error) => {
  glossaryLoad = undefined;
  throw error;
});

export function WordMeaningText({ as: Tag = "p", text, locale, children, ...props }: Props) {
  const id = useId();
  const [hover, setHover] = useState<{ gloss: WordGloss; x: number; y: number; text: string; locale: Locale } | null>(null);
  const cursor = useRef<{ index: number; x: number; y: number } | null>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const currentContent = useRef({ text, locale });
  useLayoutEffect(() => {
    currentContent.current = { text, locale };
    cursor.current = null;
    request.current++;
  }, [text, locale]);

  function hide() {
    cursor.current = null;
    request.current++;
    setHover(null);
  }
  useEffect(() => {
    const pendingRequest = request;
    const clear = () => { cursor.current = null; request.current++; setHover(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") clear(); };
    window.addEventListener("scroll", clear, { capture: true, passive: true });
    window.addEventListener("blur", clear);
    window.addEventListener("keydown", escape);
    return () => {
      pendingRequest.current++;
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("blur", clear);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  async function move(event: PointerEvent<HTMLElement>) {
    // Touch scrolling stays untouched. Popup never calls preventDefault,
    // changes focus, starts a timer, or writes a learning-progress record.
    if (event.pointerType === "touch") return;
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-gloss-index]") : null;
    if (!target || !event.currentTarget.contains(target)) { hide(); return; }
    const index = Number(target.dataset.glossIndex);
    const character = Array.from(text)[index];
    if (!character || !/[가-힣]/u.test(character)) { hide(); return; }
    cursor.current = { index, x: event.clientX, y: event.clientY };
    const serial = ++request.current;
    try {
      const glossary = await loadGlossary();
      if (serial !== request.current || !cursor.current || currentContent.current.text !== text || currentContent.current.locale !== locale) return;
      const gloss = glossary.wordGlossAt(text, index, locale);
      setHover(gloss ? { gloss, x: cursor.current.x, y: cursor.current.y, text, locale } : null);
    } catch {
      // A blocked static chunk must never block the exercise or show an error modal.
    }
  }

  const visible = hover && hover.text === text && hover.locale === locale ? hover : null;
  useLayoutEffect(() => {
    if (!visible || !tooltip.current) return;
    const rect = tooltip.current.getBoundingClientRect();
    const { left, top } = fitGlossPosition(visible.x, visible.y, rect.width, rect.height, window.innerWidth, window.innerHeight);
    tooltip.current.style.left = `${left}px`;
    tooltip.current.style.top = `${top}px`;
  }, [visible]);

  return <>
    <Tag {...props} onPointerOver={move} onPointerMove={move} onPointerLeave={hide} aria-describedby={visible ? id : props["aria-describedby"]}>
      {children ?? Array.from(text).map((character, index) => <span data-gloss-index={index} key={index}>{character}</span>)}
    </Tag>
    {visible && createPortal(
      <div className="word-meaning-popup" ref={tooltip} id={id} role="tooltip" lang={locale} dir={["ar", "fa", "ur"].includes(locale) ? "rtl" : "ltr"} style={{ left: visible.x + 14, top: visible.y + 18 }}>
        <b lang="ko">{visible.gloss.word}</b>
        <div>{visible.gloss.meaning}</div>
      </div>, document.body,
    )}
  </>;
}
