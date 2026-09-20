"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./locale-detection";
import { tr } from "./ui-i18n";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Offers the install that Chrome otherwise hides behind an address-bar icon
 * almost nobody notices.
 *
 * Installing matters more here than for most sites: typing practice wants the
 * screen, and a standalone window drops the tab strip, the address bar and the
 * bookmarks bar — over a hundred pixels that the practice card gets back.
 *
 * The button only exists when the browser has actually offered the install, so
 * it is absent once the app is installed, and absent on browsers that do not
 * support it rather than promising something that will not happen.
 */
export function InstallAppButton({ locale }: { locale: Locale }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onAvailable = (event: Event) => {
      // Chrome shows its own mini-infobar unless the event is intercepted.
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onAvailable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onAvailable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt) return null;

  return (
    <button
      type="button"
      className="install-app-button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void prompt.prompt()
          .then(() => prompt.userChoice)
          .then((choice) => { if (choice.outcome === "accepted") setPrompt(null); })
          .catch(() => {})
          .finally(() => setBusy(false));
      }}
    >
      <span aria-hidden="true">⬇</span>
      {tr(locale, "Install the app", "앱으로 설치하기")}
      <small>{tr(locale, "full screen, no browser bars", "브라우저 창 없이 전체화면")}</small>
    </button>
  );
}
