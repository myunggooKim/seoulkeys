"use client";

import { type ComponentPropsWithRef, type CompositionEvent, type KeyboardEvent, type Ref, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { backspaceBrowserJamo, browserJamoForKey, editHangulText, isImeKey, type TextEdit } from "./browser-hangul-input";
import { appendJamo } from "./hangul-compose";
import { hangulInputCopy } from "./hangul-input-i18n";
import type { Locale } from "./locale-detection";
import { OnScreenKeyboard } from "./OnScreenKeyboard";
import { tr } from "./ui-i18n";
const styles = {
  field: "hangul-typing-field", tools: "hangul-input-tools",
  options: "hangul-input-options", screen: "hangul-input-screen",
};

type SharedProps = {
  value: string;
  onValueChange: (value: string) => void;
  locale: Locale;
  onScreenSubmit?: () => void;
  keyHint?: string;
};
type InputProps = Omit<ComponentPropsWithRef<"input">, "value" | "onChange"> & SharedProps;
type TextareaProps = Omit<ComponentPropsWithRef<"textarea">, "value" | "onChange"> & SharedProps;
type Field = HTMLInputElement | HTMLTextAreaElement;

function useHangulField<T extends Field>(props: SharedProps & {
  ref?: Ref<T>;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onKeyDown?: (event: KeyboardEvent<T>) => void;
  onCompositionStart?: (event: CompositionEvent<T>) => void;
  onCompositionEnd?: (event: CompositionEvent<T>) => void;
}) {
  const fieldRef = useRef<T>(null);
  useImperativeHandle(props.ref, () => fieldRef.current!, []);
  const valueRef = useRef(props.value);
  const selectionRef = useRef({ start: props.value.length, end: props.value.length });
  const pendingCaret = useRef<number | null>(null);
  const composing = useRef(false);
  const browserUsed = useRef(false);
  const [automatic, setAutomatic] = useState(true);
  const [screenOpen, setScreenOpen] = useState(false);
  const [editVersion, setEditVersion] = useState(0);
  const screenId = useId();

  useLayoutEffect(() => {
    valueRef.current = props.value;
    const caret = pendingCaret.current;
    if (caret === null) return;
    pendingCaret.current = null;
    const bounded = Math.min(caret, props.value.length);
    fieldRef.current?.setSelectionRange(bounded, bounded);
    selectionRef.current = { start: bounded, end: bounded };
  }, [props.value, editVersion]);

  const change = (edit: TextEdit) => {
    if (props.disabled || props.readOnly) return;
    if (props.maxLength !== undefined && edit.value.length > props.maxLength) return;
    valueRef.current = edit.value;
    pendingCaret.current = edit.caret;
    selectionRef.current = { start: edit.caret, end: edit.caret };
    props.onValueChange(edit.value);
    setEditVersion((version) => version + 1);
  };
  const readSelection = () => {
    const field = fieldRef.current;
    if (field) selectionRef.current = {
      start: field.selectionStart ?? valueRef.current.length,
      end: field.selectionEnd ?? valueRef.current.length,
    };
    return selectionRef.current;
  };
  const onKeyDown = (event: KeyboardEvent<T>) => {
    if (composing.current || isImeKey(event.nativeEvent)) {
      browserUsed.current = false;
      // Do not let the caller submit on the key that commits native composition.
      return;
    }
    props.onKeyDown?.(event);
    if (event.defaultPrevented || !automatic || props.disabled || props.readOnly) return;
    const jamo = browserJamoForKey(event.nativeEvent);
    const { start, end } = readSelection();
    if (jamo) {
      event.preventDefault();
      browserUsed.current = true;
      change(editHangulText(valueRef.current, start, end, (prefix) => appendJamo(prefix, jamo)));
    } else if (browserUsed.current && event.key === "Backspace" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      change(backspaceBrowserJamo(valueRef.current, start, end));
    }
  };
  const onScreenInput = (transform: (prefix: string) => string) => {
    if (props.disabled || props.readOnly) return;
    const { start, end } = selectionRef.current;
    browserUsed.current = true;
    change(editHangulText(valueRef.current, start, end, transform));
  };
  const onCompositionStart = (event: CompositionEvent<T>) => {
    composing.current = true;
    browserUsed.current = false;
    props.onCompositionStart?.(event);
  };
  const onCompositionEnd = (event: CompositionEvent<T>) => {
    composing.current = false;
    props.onCompositionEnd?.(event);
  };
  return { fieldRef, automatic, setAutomatic, screenOpen, setScreenOpen, screenId, readSelection, onKeyDown, onScreenInput, onCompositionStart, onCompositionEnd };
}

function InputTools({ locale, disabled, onScreenSubmit, keyHint, controls }: SharedProps & {
  disabled?: boolean;
  controls: Pick<ReturnType<typeof useHangulField>, "automatic" | "setAutomatic" | "screenOpen" | "setScreenOpen" | "screenId" | "onScreenInput">;
}) {
  const text = hangulInputCopy(locale);
  return (
    <>
      <div className={styles.tools}>
        <small>{controls.automatic ? text.hint : text.native} {keyHint && <b dir="ltr">{keyHint}</b>}</small>
        <button type="button" disabled={disabled} aria-expanded={controls.screenOpen} aria-controls={controls.screenId}
          onClick={() => controls.setScreenOpen((open) => !open)}>
          ⌨ {tr(locale, controls.screenOpen ? "Hide the on-screen keyboard" : "On-screen Korean keyboard", controls.screenOpen ? "화면 키보드 닫기" : "화면 한글 키보드")}
        </button>
        <details className={styles.options}>
          <summary>{tr(locale, "My keyboard", "내 키보드")}</summary>
          <label><input type="checkbox" checked={controls.automatic} onChange={(event) => controls.setAutomatic(event.target.checked)} />{text.automatic}</label>
        </details>
      </div>
      {controls.screenOpen && <div id={controls.screenId} className={styles.screen}>
        <OnScreenKeyboard locale={locale} disabled={disabled} onInput={controls.onScreenInput} onSubmit={onScreenSubmit} />
      </div>}
    </>
  );
}

export function HangulInput({ locale, onValueChange, onScreenSubmit, keyHint, ref, ...props }: InputProps) {
  const { fieldRef, onKeyDown, readSelection, onCompositionStart, onCompositionEnd, ...controls } = useHangulField<HTMLInputElement>({ ...props, locale, onValueChange, ref });
  return (
    <div className={`${styles.field} hangul-field`}>
      <input {...props} ref={fieldRef} dir="ltr" onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown} onSelect={event => { readSelection(); props.onSelect?.(event); }}
        onCompositionStart={onCompositionStart} onCompositionEnd={onCompositionEnd} />
      <InputTools value={props.value} onValueChange={onValueChange} locale={locale} keyHint={keyHint} onScreenSubmit={onScreenSubmit} disabled={props.disabled || props.readOnly} controls={controls} />
    </div>
  );
}

export function HangulTextarea({ locale, onValueChange, onScreenSubmit, keyHint, ref, ...props }: TextareaProps) {
  const { fieldRef, onKeyDown, readSelection, onCompositionStart, onCompositionEnd, ...controls } = useHangulField<HTMLTextAreaElement>({ ...props, locale, onValueChange, ref });
  return (
    <div className={`${styles.field} hangul-field`}>
      <textarea {...props} ref={fieldRef} dir="ltr" onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={onKeyDown} onSelect={event => { readSelection(); props.onSelect?.(event); }}
        onCompositionStart={onCompositionStart} onCompositionEnd={onCompositionEnd} />
      <InputTools value={props.value} onValueChange={onValueChange} locale={locale} keyHint={keyHint} onScreenSubmit={onScreenSubmit} disabled={props.disabled || props.readOnly} controls={controls} />
    </div>
  );
}
