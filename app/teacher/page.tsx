"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { applyTheme, readResolvedTheme } from "../theme";

type StudentReport = {
  email: string;
  displayName: string;
  studentId: string;
  streakDays: number;
  totalXp: number;
  completedSentences: number;
  accuracy: number;
  typingSeconds: number;
  updatedAt: string;
};

type TeacherClass = {
  id: string;
  className: string;
  inviteCode: string;
  inviteUrl: string;
  createdAt: string;
  totalStudents: number;
  avgAccuracy: number;
  students: StudentReport[];
};

type Assignment = {
  id: string;
  classId: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  totalSubmissions: number;
};

const SAMPLE_TEMPLATES = [
  {
    category: "유명 시",
    title: "윤동주 — 서시",
    content: "죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를, 잎새에 이는 바람에도 나는 괴로워했다.",
  },
  {
    category: "유명 시",
    title: "김소월 — 진달래꽃",
    content: "나 보기가 역겨워 가실 때에는 말없이 고이 보내 드리우리다. 영변에 약산 진달래꽃 아름 따다 가실 길에 뿌리우리다.",
  },
  {
    category: "노래 가사",
    title: "동요 — 고향의 봄",
    content: "나의 살던 고향은 꽃피는 산골 복숭아꽃 살구꽃 아기 진달래 알록달록 꽃대궐 차린 동네 그 속에서 놀던 때가 그립습니다.",
  },
  {
    category: "고전문학",
    title: "훈민정음 언해본 서문",
    content: "나랏말싸미 댱귁에 달라 문자와로 서르 사맛디 아니할쎄 이런 전차로 어린 백성이 니르고져 할 배 있어도 마참내 제 뜻을 실어 펼지 못할 놈이 하니라.",
  },
];

export default function TeacherDashboard() {
  const [classesList, setClassesList] = useState<TeacherClass[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [asgnTitle, setAsgnTitle] = useState("");
  const [asgnCategory, setAsgnCategory] = useState("유명 시");
  const [asgnContent, setAsgnContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [creatingAsgn, setCreatingAsgn] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      const [classRes, asgnRes] = await Promise.all([
        fetch("/api/teacher/class"),
        fetch("/api/teacher/assignment"),
      ]);

      if (
        classRes.status === 401
        || classRes.status === 403
        || asgnRes.status === 401
        || asgnRes.status === 403
      ) {
        setIsUnauthorized(true);
        return;
      }

      if (classRes.ok) {
        const classData = await classRes.json();
        const loadedClasses: TeacherClass[] = classData.classes || [];
        setClassesList(loadedClasses);
        if (loadedClasses.length > 0) {
          setSelectedClassId((current) => current || loadedClasses[0].id);
        }
      }
      if (asgnRes.ok) {
        const asgnData = await asgnRes.json();
        setAssignmentsList(asgnData.assignments || []);
      }
    } catch {
      // Network failure or offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setThemeMode(readResolvedTheme());
      void fetchDashboardData();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fetchDashboardData]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    applyTheme(nextTheme);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreatingClass(true);
    try {
      const res = await fetch("/api/teacher/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: newClassName }),
      });
      if (res.status === 401) {
        setIsUnauthorized(true);
        return;
      }
      if (res.ok) {
        setNewClassName("");
        await fetchDashboardData();
      }
    } catch {
      // Failed
    } finally {
      setCreatingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`'${className}' 클래스를 정말 삭제하시겠습니까?\n소속된 학생들의 클래스 연결이 해제됩니다.`)) {
      return;
    }
    setDeletingClassId(classId);
    try {
      const res = await fetch(`/api/teacher/class?classId=${encodeURIComponent(classId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedClassId === classId) {
          setSelectedClassId("");
        }
        await fetchDashboardData();
      }
    } catch {
      // Failed
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !asgnTitle.trim() || !asgnContent.trim()) return;
    setCreatingAsgn(true);
    try {
      const res = await fetch("/api/teacher/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          title: asgnTitle,
          category: asgnCategory,
          content: asgnContent,
        }),
      });
      if (res.ok) {
        setAsgnTitle("");
        setAsgnContent("");
        await fetchDashboardData();
      }
    } catch {
      // Failed
    } finally {
      setCreatingAsgn(false);
    }
  };

  const applyTemplate = (tpl: (typeof SAMPLE_TEMPLATES)[0]) => {
    setAsgnCategory(tpl.category);
    setAsgnTitle(tpl.title);
    setAsgnContent(tpl.content);
  };

  const copyInviteUrl = async (url: string, code: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {
      // Failed
    }
  };

  return (
    <main className="profile-shell" style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
        <Link className="brand" href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: "22px", fontWeight: "bold" }}>
          <span className="brand-mark" style={{ background: "#58a6ff", padding: "4px 10px", borderRadius: "8px" }}>ㅅ</span>
          <span>Seoul Keys Teacher Portal</span>
        </Link>
        <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button type="button" className="theme-toggle-btn" onClick={toggleThemeMode}>
            {themeMode === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Link href="/my" style={{ textDecoration: "none", fontWeight: 600 }}>내 학습 공간</Link>
          <Link href="/" style={{ textDecoration: "none", fontWeight: 600 }}>메인으로</Link>
        </nav>
      </header>

      <section style={{ marginBottom: "32px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(88,166,255,0.18), rgba(163,113,247,0.18))", border: "2px solid rgba(88,166,255,0.4)", borderRadius: "16px", padding: "28px" }}>
          <span style={{ fontSize: "28px" }}>🎓</span>
          <h1 style={{ fontSize: "26px", margin: "8px 0", fontWeight: "900" }}>교사 관리 대시보드</h1>
          <p style={{ opacity: 0.9, fontSize: "15px", margin: 0, fontWeight: 500 }}>
            새 학급을 생성하고 학생들의 진도 모니터링은 물론, 시·노래 가사·고전문학 등 교사 맞춤 타자 지문을 직접 발급해 줄 수 있습니다.
          </p>
        </div>
      </section>

      {/* Unauthorized State Notice */}
      {isUnauthorized ? (
        <section style={{ background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px", padding: "48px", textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "48px" }}>🔐</span>
          <h2 style={{ fontSize: "22px", margin: "16px 0 8px", fontWeight: "800" }}>교사 계정 로그인이 필요합니다</h2>
          <p style={{ opacity: 0.85, fontSize: "15px", maxWidth: "520px", margin: "0 auto 24px" }}>
            클래스 생성 및 맞춤 지문 출제, 학생 진도 모니터링은 구글 계정 로그인 후 이용하실 수 있습니다.
          </p>
          <Link href="/api/auth/google" className="button button-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "15px", fontWeight: "bold" }}>
            🔑 구글 계정으로 로그인하기
          </Link>
        </section>
      ) : (
        <>
          {/* Top Grid: Class Creation & Custom Content Creator Studio */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            {/* Class Creation Form */}
            <section style={{ background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", marginTop: 0, fontWeight: "800" }}>➕ 1. 새 클래스(반) 생성</h3>
              <form onSubmit={handleCreateClass} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="예: 3학년 1반, 한국어 초급 A반"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  style={{ padding: "12px 16px", borderRadius: "10px", border: "2px solid var(--line)", background: "var(--ivory)", fontSize: "15px", fontWeight: "600" }}
                />
                <button type="submit" className="button button-primary" disabled={creatingClass || !newClassName.trim()} style={{ padding: "12px 20px" }}>
                  {creatingClass ? "생성 중..." : "클래스 생성 & 초대 링크 발급"}
                </button>
              </form>
            </section>

            {/* Custom Assignment Studio */}
            <section style={{ background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", marginTop: 0, fontWeight: "800" }}>📝 2. 맞춤 교재/지문 과제 출제</h3>
              {classesList.length === 0 ? (
                <p style={{ opacity: 0.85, fontSize: "14px" }}>먼저 상단 폼에서 클래스를 생성해야 맞춤 지문을 출제할 수 있습니다.</p>
              ) : (
                <form onSubmit={handleCreateAssignment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--ivory)", fontSize: "13px", fontWeight: "600" }}
                    >
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.className}</option>
                      ))}
                    </select>
                    <select
                      value={asgnCategory}
                      onChange={(e) => setAsgnCategory(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--ivory)", fontSize: "13px", fontWeight: "600" }}
                    >
                      <option value="유명 시">유명 시</option>
                      <option value="노래 가사">노래 가사</option>
                      <option value="고전문학">고전문학</option>
                      <option value="수필/소설">수필/소설</option>
                      <option value="일반">일반 지문</option>
                    </select>
                  </div>

                  {/* Sample Templates Quick-Fill */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "4px 0" }}>
                    <span style={{ fontSize: "11px", color: "var(--info)", fontWeight: "bold" }}>샘플 예시:</span>
                    {SAMPLE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.title}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--ivory)", cursor: "pointer" }}
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="지문 제목 (예: 윤동주 — 서시)"
                    value={asgnTitle}
                    onChange={(e) => setAsgnTitle(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--ivory)", fontSize: "14px", fontWeight: "600" }}
                  />
                  <textarea
                    placeholder="학생들이 연습할 맞춤 타자 지문 내용을 입력하세요 (노래가사, 시, 문학작품 등)"
                    value={asgnContent}
                    onChange={(e) => setAsgnContent(e.target.value)}
                    rows={3}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--ivory)", fontSize: "14px", resize: "vertical" }}
                  />

                  <button type="submit" className="button button-primary" disabled={creatingAsgn || !asgnTitle.trim() || !asgnContent.trim()} style={{ padding: "10px" }}>
                    {creatingAsgn ? "출제 중..." : "🚀 맞춤 타자 과제 출제하기"}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Published Custom Assignments List */}
          {assignmentsList.length > 0 && (
            <section style={{ background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px", padding: "24px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "18px", marginTop: 0, fontWeight: "800" }}>📚 선생님이 출제한 맞춤 타자 교재 목록 ({assignmentsList.length}개)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
                {assignmentsList.map((asgn) => (
                  <div key={asgn.id} style={{ background: "var(--ivory)", border: "1px solid var(--line)", borderRadius: "12px", padding: "16px" }}>
                    <span style={{ fontSize: "11px", background: "#58a6ff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>{asgn.category}</span>
                    <h4 style={{ margin: "8px 0 4px", fontSize: "16px" }}>{asgn.title}</h4>
                    <p style={{ fontSize: "13px", opacity: 0.85, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{asgn.content}</p>
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "#2da44e", fontWeight: "bold" }}>
                      학생 완수 현황: {asgn.totalSubmissions}명 완료
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Class List & Student Progress */}
          {loading ? (
            <p style={{ opacity: 0.9 }}>클래스 정보를 불러오고 있습니다...</p>
          ) : classesList.length === 0 ? (
            <div style={{ textTransform: "initial", textAlign: "center", padding: "48px", background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px" }}>
              <span style={{ fontSize: "44px" }}>🏫</span>
              <h3 style={{ marginTop: "16px", fontWeight: "800" }}>등록된 클래스가 없습니다.</h3>
              <p style={{ opacity: 0.85 }}>상단의 폼을 이용해 첫 학급을 생성하고 학생들을 초대해 보세요!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {classesList.map((c) => (
                <article key={c.id} style={{ background: "var(--paper)", border: "2px solid var(--line)", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--info)", fontWeight: "bold", letterSpacing: "0.1em" }}>CLASS</span>
                      <h2 style={{ fontSize: "22px", margin: "4px 0", fontWeight: "800" }}>{c.className}</h2>
                      <span style={{ opacity: 0.85, fontSize: "14px" }}>총 학생 수: <b>{c.totalStudents}명</b> · 반 평균 정확도: <b>{c.avgAccuracy}%</b></span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--ivory)", padding: "8px 14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>초대 코드: <b style={{ color: "var(--info)" }}>{c.inviteCode}</b></span>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => void copyInviteUrl(c.inviteUrl, c.inviteCode)}
                          style={{ padding: "5px 12px", fontSize: "12px" }}
                        >
                          🔗 {copiedCode === c.inviteCode ? "초대 링크 복사됨!" : "초대 링크 복사"}
                        </button>
                      </div>

                      {/* Class Delete Button */}
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={deletingClassId === c.id}
                        onClick={() => void handleDeleteClass(c.id, c.className)}
                        style={{ padding: "8px 14px", fontSize: "13px", color: "var(--danger-ink)", borderColor: "rgba(255,77,141,0.5)" }}
                        title="클래스를 삭제합니다"
                      >
                        🗑️ {deletingClassId === c.id ? "삭제 중..." : "클래스 삭제"}
                      </button>
                    </div>
                  </div>

                  {/* Student Table */}
                  {c.students.length === 0 ? (
                    <div style={{ background: "var(--ivory)", padding: "20px", borderRadius: "12px", textAlign: "center", opacity: 0.85, border: "1px dashed var(--line)" }}>
                      아직 가입한 학생이 없습니다. 위 초대 링크를 복사하여 학생들에게 전달하세요!
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--line)", fontWeight: "bold" }}>
                            <th style={{ padding: "12px 10px" }}>학생 이름</th>
                            <th style={{ padding: "12px 10px" }}>이메일 / 학번</th>
                            <th style={{ padding: "12px 10px" }}>연속 방문</th>
                            <th style={{ padding: "12px 10px" }}>완료 문장</th>
                            <th style={{ padding: "12px 10px" }}>정확도</th>
                            <th style={{ padding: "12px 10px" }}>누적 연습</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.students.map((student) => (
                            <tr key={student.email} style={{ borderBottom: "1px solid var(--line)" }}>
                              <td style={{ padding: "14px 10px", fontWeight: "bold" }}>{student.displayName}</td>
                              <td style={{ padding: "14px 10px", opacity: 0.85 }}>{student.email}</td>
                              <td style={{ padding: "14px 10px" }}>🔥 {student.streakDays}일</td>
                              <td style={{ padding: "14px 10px" }}><b>{student.completedSentences}</b> 문장</td>
                              <td style={{ padding: "14px 10px", color: student.accuracy >= 95 ? "#2da44e" : "#d29922", fontWeight: "bold" }}>{student.accuracy}%</td>
                              <td style={{ padding: "14px 10px" }}>{Math.floor(student.typingSeconds / 60)}분</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
