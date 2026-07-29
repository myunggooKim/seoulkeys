"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type KoreanKeyboardSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
};

type OsType = "windows" | "mac" | "ios" | "android";

export function KoreanKeyboardSetupModal({
  isOpen,
  onClose,
  locale,
}: KoreanKeyboardSetupModalProps) {
  const [activeOs, setActiveOs] = useState<OsType>("windows");
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("win")) setActiveOs("windows");
      else if (ua.includes("mac") && !ua.includes("iphone") && !ua.includes("ipad")) setActiveOs("mac");
      else if (ua.includes("iphone") || ua.includes("ipad")) setActiveOs("ios");
      else if (ua.includes("android")) setActiveOs("android");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isOpen) return null;

  const winPowerShellCmd = `$List = Get-WinUserLanguageList; $List.Add("ko-KR"); Set-WinUserLanguageList $List -Force`;

  const copyPowerShellCmd = async () => {
    try {
      await navigator.clipboard.writeText(winPowerShellCmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content keyboard-setup-modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="modal-badge">{tr(locale, "QUICK SETUP", "1초 설정")}</span>
            <h2>{tr(locale, "Add Korean Keyboard to Your OS", "내 기기에 한글 키보드 추가하기")}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <p className="modal-intro">
          {tr(
            locale,
            "No extra software installation needed! Select your operating system below to enable Korean typing in 2 quick steps.",
            "별도의 프로그램을 다운로드할 필요 없습니다! 아래에서 사용 중인 기기를 선택하면 2단계로 빠르게 한글 입력이 가능해집니다."
          )}
        </p>

        <div className="os-tab-selector">
          <button
            type="button"
            className={activeOs === "windows" ? "active" : ""}
            onClick={() => setActiveOs("windows")}
          >
            🪟 Windows
          </button>
          <button
            type="button"
            className={activeOs === "mac" ? "active" : ""}
            onClick={() => setActiveOs("mac")}
          >
            🍎 macOS
          </button>
          <button
            type="button"
            className={activeOs === "ios" ? "active" : ""}
            onClick={() => setActiveOs("ios")}
          >
            📱 iPhone / iPad
          </button>
          <button
            type="button"
            className={activeOs === "android" ? "active" : ""}
            onClick={() => setActiveOs("android")}
          >
            🤖 Android
          </button>
        </div>

        <div className="os-instructions">
          {activeOs === "windows" && (
            <div className="instruction-card">
              <h3>{tr(locale, "Option A: 1-Click PowerShell Auto Add (Recommended)", "방법 A: 1초 PowerShell 자동 추가 (추천)")}</h3>
              <p>{tr(locale, "Press Win + X, open Terminal or PowerShell, paste and press Enter:", "Win + X 키를 누른 후 터미널 또는 PowerShell을 열고 아래 명령어를 붙여넣으세요:")}</p>
              <div className="code-command-box">
                <code>{winPowerShellCmd}</code>
                <button type="button" className="button button-primary copy-cmd-btn" onClick={copyPowerShellCmd}>
                  {copiedCmd ? tr(locale, "Copied! Paste in PowerShell", "복사됨! PowerShell에 붙여넣기") : tr(locale, "Copy Command", "명령어 복사")}
                </button>
              </div>
              <hr />
              <h3>{tr(locale, "Option B: Windows Settings", "방법 B: 윈도우 설정")}</h3>
              <ol className="step-list">
                <li>{tr(locale, "Press Win + I to open Settings -> Time & Language -> Language & Region.", "Win + I 키로 설정 -> 시간 및 언어 -> 언어 및 지역으로 이동합니다.")}</li>
                <li>{tr(locale, "Click 'Add a language', search 'Korean' (한국어) and click Install.", "'언어 추가'를 클릭하고 '한국어'를 검색한 뒤 설치를 누릅니다.")}</li>
                <li>{tr(locale, "Switch input language anytime with Win + Space or Alt + Shift.", "언제든 Win + Space 또는 Alt + Shift로 한글/영문 자판을 전환합니다.")}</li>
              </ol>
            </div>
          )}

          {activeOs === "mac" && (
            <div className="instruction-card">
              <h3>{tr(locale, "macOS 3-Step Setup", "macOS 3단계 설정")}</h3>
              <ol className="step-list">
                <li>{tr(locale, "Open Apple Menu () -> System Settings -> Keyboard.", "Apple 메뉴 () -> 시스템 설정 -> 키보드로 이동합니다.")}</li>
                <li>{tr(locale, "Under 'Input Sources', click Edit / +, search 'Korean' and add '2-Set Korean'.", "'입력 소스' 항목에서 편집 / + 버튼을 누르고 '한국어 - 2벌식'을 추가합니다.")}</li>
                <li>{tr(locale, "Switch input mode anytime using Control + Space or Caps Lock key.", "Control + Space 또는 Caps Lock 키로 한/영 입력 모드를 전환합니다.")}</li>
              </ol>
            </div>
          )}

          {activeOs === "ios" && (
            <div className="instruction-card">
              <h3>{tr(locale, "iPhone & iPad Setup", "iPhone 및 iPad 설정")}</h3>
              <ol className="step-list">
                <li>{tr(locale, "Open Settings -> General -> Keyboard -> Keyboards.", "설정 -> 일반 -> 키보드 -> 키보드로 이동합니다.")}</li>
                <li>{tr(locale, "Tap 'Add New Keyboard...', select 'Korean' -> 'Standard / 2-Set'.", "'새 키보드 추가...'를 누르고 '한국어' -> '표준(2벌식)'을 선택합니다.")}</li>
                <li>{tr(locale, "Tap the Globe icon (🌐) on keyboard to switch.", "키보드의 지구본 아이콘(🌐)을 눌러 한글 키보드로 전환합니다.")}</li>
              </ol>
            </div>
          )}

          {activeOs === "android" && (
            <div className="instruction-card">
              <h3>{tr(locale, "Android Device Setup", "안드로이드 기기 설정")}</h3>
              <ol className="step-list">
                <li>{tr(locale, "Open Settings -> General Management -> Keyboard settings.", "설정 -> 일반 관리 -> 언어 및 입력 방식 / 키보드 설정으로 이동합니다.")}</li>
                <li>{tr(locale, "Tap 'Languages and types' -> 'Add input language' -> Select 'Korean'.", "'언어 및 키보드 유형' -> '입력 언어 추가' -> '한국어'를 선택합니다.")}</li>
                <li>{tr(locale, "Swipe Spacebar or tap Globe icon on keyboard to switch.", "키보드의 스페이스바를 스와이프하거나 지구본 아이콘을 눌러 한글로 전환합니다.")}</li>
              </ol>
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <div className="shortcut-tip">
            <span>💡 {tr(locale, "Quick Switch Shortcut:", "한/영 자판 빠른 전환 단축키:")}</span>
            <kbd>Win + Space</kbd> {tr(locale, "(Win)", "(윈도우)")} &nbsp; | &nbsp; <kbd>Ctrl + Space</kbd> {tr(locale, "(Mac)", "(맥)")}
          </div>
          <button type="button" className="button button-primary" onClick={onClose}>
            {tr(locale, "Done", "확인 완료")}
          </button>
        </footer>
      </div>
    </div>
  );
}
