"use client";

import { useEffect, useRef, useState } from "react";
import { clearSignedOutFlag } from "./sign-out";

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentity = {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
      disableAutoSelect?(): void;
    };
  };
};

export type SignupRole = "student" | "teacher";

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript(): Promise<GoogleIdentity | null> {
  return new Promise((resolve) => {
    const existing = (window as typeof window & { google?: GoogleIdentity }).google;
    if (existing?.accounts?.id) {
      resolve(existing);
      return;
    }
    const previous = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = previous ?? document.createElement("script");
    const onReady = () => resolve((window as typeof window & { google?: GoogleIdentity }).google ?? null);
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    if (!previous) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

export function GoogleSignIn({
  clientId,
  labelKo = "구글 계정으로 계속하기",
  labelEn = "Continue with Google",
  koreanUi = true,
  redirectTo,
  showRoleChoice = true,
}: {
  clientId?: string;
  labelKo?: string;
  labelEn?: string;
  koreanUi?: boolean;
  /** Overrides the role-based destination the server picks. */
  redirectTo?: string;
  showRoleChoice?: boolean;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [discoveredClientId, setDiscoveredClientId] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<SignupRole>("student");
  // The GIS callback is registered once, so it has to read the latest choice
  // from a ref rather than from the closed-over state value.
  const roleRef = useRef<SignupRole>("student");
  const effectiveClientId = clientId || discoveredClientId;

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    if (clientId) return;
    let active = true;
    void fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data: { clientId?: string } | null) => {
        if (active && data?.clientId) setDiscoveredClientId(data.clientId);
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage(koreanUi ? "구글 로그인을 불러오지 못했습니다." : "Could not load Google Sign-In.");
      });
    return () => { active = false; };
  }, [clientId, koreanUi]);

  useEffect(() => {
    if (!effectiveClientId) return;
    let cancelled = false;

    const signIn = async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;
      setStatus("working");
      try {
        const result = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "content-type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ credential: response.credential, role: roleRef.current }),
        });
        const detail = await result.json().catch(() => ({})) as { error?: string; redirectTo?: string };
        if (!result.ok) throw new Error(detail.error || "Sign-in failed");

        // This was a deliberate sign-in, so stop suppressing the session.
        clearSignedOutFlag();
        window.location.href = redirectTo ?? detail.redirectTo ?? "/my";
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Sign-in failed");
      }
    };

    void loadGoogleScript().then((google) => {
      if (cancelled || !google?.accounts?.id || !buttonRef.current) {
        if (!cancelled && !google) {
          setStatus("error");
          setMessage(koreanUi ? "구글 로그인을 불러오지 못했습니다." : "Could not load Google Sign-In.");
        }
        return;
      }
      google.accounts.id.initialize({
        client_id: effectiveClientId,
        callback: (response) => void signIn(response),
        // Never resurrect a session the user deliberately ended.
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      buttonRef.current.replaceChildren();
      google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "left",
      });
    });

    return () => { cancelled = true; };
  }, [effectiveClientId, koreanUi, redirectTo]);

  return (
    <div className="google-signin">
      <p className="google-signin-label">{koreanUi ? labelKo : labelEn}</p>

      {showRoleChoice && (
        <fieldset className="signup-role">
          <legend>{koreanUi ? "어떤 계정으로 시작할까요?" : "How will you use Seoul Keys?"}</legend>
          <div className="signup-role-options">
            <label className={role === "student" ? "selected" : ""}>
              <input
                type="radio"
                name="signup-role"
                value="student"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <span aria-hidden="true">🙋</span>
              <b>{koreanUi ? "혼자 배우기" : "I'm learning"}</b>
              <small>{koreanUi ? "내 진도와 리워드를 저장합니다." : "Save your own progress and rewards."}</small>
            </label>
            <label className={role === "teacher" ? "selected" : ""}>
              <input
                type="radio"
                name="signup-role"
                value="teacher"
                checked={role === "teacher"}
                onChange={() => setRole("teacher")}
              />
              <span aria-hidden="true">🎓</span>
              <b>{koreanUi ? "선생님입니다" : "I'm a teacher"}</b>
              <small>{koreanUi ? "반을 만들고 학생 진도를 관리합니다." : "Create classes and track your students."}</small>
            </label>
          </div>
        </fieldset>
      )}

      <div ref={buttonRef} className="google-signin-button" />
      {status === "working" && <p className="google-signin-status">{koreanUi ? "로그인 중…" : "Signing in…"}</p>}
      {status === "error" && <p className="google-signin-status error">{message}</p>}
    </div>
  );
}
