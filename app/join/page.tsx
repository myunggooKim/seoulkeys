"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GoogleSignIn } from "../GoogleSignIn";
import { applyTheme, readResolvedTheme } from "../theme";

type ClassInfo = {
  valid: boolean;
  classId: string;
  className: string;
  teacherName: string;
  inviteCode: string;
};

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const fetchClassInfo = useCallback(async (inviteCode: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/join?code=${encodeURIComponent(inviteCode)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setClassInfo(data);
      } else {
        setError(data.error || "유효하지 않거나 만료된 초대 코드입니다.");
      }
    } catch {
      setError("클래스 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setThemeMode(readResolvedTheme());

      const searchParams = new URLSearchParams(window.location.search);
      const inviteParam = searchParams.get("code") || "";
      setCode(inviteParam.toUpperCase());

      if (inviteParam) {
        void fetchClassInfo(inviteParam);
      } else {
        setLoading(false);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fetchClassInfo]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    applyTheme(nextTheme);
  };

  const handleJoinClass = async () => {
    if (!code) return;
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`🎉 '${data.className}' 학급 가입이 완료되었습니다!`);
        setTimeout(() => {
          window.location.href = "/my";
        }, 1500);
      } else {
        setError(data.error || "가입 처리 중 오류가 발생했습니다.");
      }
    } catch {
      setError("학급 가입 요청을 전송하지 못했습니다.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="profile-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px", color: "var(--ink)" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "20px", padding: "32px", textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Link className="brand" href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--ink)", fontSize: "22px", fontWeight: "bold" }}>
            <span className="brand-mark" style={{ background: "#58a6ff", color: "#fff", padding: "4px 10px", borderRadius: "8px" }}>ㅅ</span>
            <span>Seoul Keys Class</span>
          </Link>
          <button type="button" className="theme-toggle-btn" onClick={toggleThemeMode}>
            {themeMode === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--ink)", opacity: 0.8 }}>초대 링크 정보를 확인하고 있습니다...</p>
        ) : classInfo ? (
          <div>
            <div style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.15), rgba(163,113,247,0.15))", border: "2px solid rgba(88,166,255,0.4)", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
              <span style={{ fontSize: "32px" }}>🎓</span>
              <h2 style={{ color: "#58a6ff", fontSize: "22px", margin: "8px 0 4px", fontWeight: "800" }}>{classInfo.className}</h2>
              <p style={{ color: "var(--ink)", fontSize: "14px", margin: 0, fontWeight: "600" }}>담당 선생님: <b>{classInfo.teacherName}</b></p>
            </div>

            {successMessage ? (
              <div style={{ background: "rgba(46,160,67,0.15)", border: "2px solid rgba(46,160,67,0.4)", color: "#2da44e", padding: "16px", borderRadius: "12px", fontWeight: "bold" }}>
                {successMessage}
              </div>
            ) : (
              <div>
                <p style={{ color: "var(--ink)", fontSize: "15px", marginBottom: "20px", opacity: 0.9 }}>
                  구글 계정으로 로그인하시면 이 클래스에 바로 등록되며 선생님의 학습 관리를 받으실 수 있습니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button type="button" className="button button-primary" onClick={handleJoinClass} disabled={joining} style={{ width: "100%", justifyContent: "center" }}>
                    {joining ? "가입 등록 중..." : `🎓 '${classInfo.className}' 참여하기`}
                  </button>

                  <GoogleSignIn redirectTo={`/join?code=${code}`} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ color: "var(--ink)", fontSize: "20px", marginBottom: "12px", fontWeight: "800" }}>학급 초대 코드 입력</h2>
            <p style={{ color: "var(--ink)", opacity: 0.8, fontSize: "14px", marginBottom: "20px" }}>선생님에게 받은 6자리 초대 코드를 입력해 주세요.</p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="예: SK-78A9B2"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: "12px 14px", borderRadius: "10px", border: "2px solid var(--line)", background: "var(--ivory)", color: "var(--ink)", fontSize: "16px", fontWeight: "bold", textAlign: "center" }}
              />
              <button type="button" className="button button-primary" onClick={() => void fetchClassInfo(code)}>
                확인
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ color: "#cf222e", marginTop: "16px", fontSize: "14px", fontWeight: "bold" }}>{error}</p>}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
          <Link href="/" style={{ color: "var(--ink)", textDecoration: "none", fontSize: "13px", opacity: 0.85, fontWeight: "600" }}>← Seoul Keys 메인으로 돌아가기</Link>
        </div>
      </div>
    </main>
  );
}
