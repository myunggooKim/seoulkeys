"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type Category = "kpop" | "kdrama" | "movie" | "travel" | "lesson";
type RightsStatus = "original" | "licensed" | "user_supplied" | "permission_pending";

type ContentItem = {
  id: number;
  category: string;
  title: string;
  sourceTitle: string;
  creator: string;
  koreanText: string;
  translation: string;
  audioFemaleUrl: string;
  audioMaleUrl: string;
  rightsStatus: string;
  rightsNote: string;
  published: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type EditorDraft = {
  category: Category;
  title: string;
  sourceTitle: string;
  creator: string;
  koreanText: string;
  translation: string;
  audioFemaleUrl: string;
  audioMaleUrl: string;
  rightsStatus: RightsStatus;
  rightsNote: string;
  published: boolean;
};

const blankDraft: EditorDraft = {
  category: "lesson",
  title: "",
  sourceTitle: "",
  creator: "",
  koreanText: "",
  translation: "",
  audioFemaleUrl: "",
  audioMaleUrl: "",
  rightsStatus: "permission_pending",
  rightsNote: "",
  published: false,
};

const categoryLabels: Record<Category, string> = {
  kpop: "K-POP 가사",
  kdrama: "K-Drama 대사",
  movie: "영화 대사",
  travel: "여행 회화",
  lesson: "일반 레슨",
};

const rightsLabels: Record<RightsStatus, string> = {
  original: "직접 만든 원문",
  licensed: "이용 허락/라이선스 확보",
  user_supplied: "사용자 입력 — 검토 필요",
  permission_pending: "허락 확인 중",
};

function itemToDraft(item: ContentItem): EditorDraft {
  return {
    category: item.category as Category,
    title: item.title,
    sourceTitle: item.sourceTitle,
    creator: item.creator,
    koreanText: item.koreanText,
    translation: item.translation,
    audioFemaleUrl: item.audioFemaleUrl,
    audioMaleUrl: item.audioMaleUrl,
    rightsStatus: item.rightsStatus as RightsStatus,
    rightsNote: item.rightsNote,
    published: item.published,
  };
}

export default function AdminConsole({ initialItems, adminEmail }: { initialItems: ContentItem[]; adminEmail: string }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<EditorDraft>(blankDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("새 콘텐츠를 작성하거나 기존 항목을 선택하세요.");

  const canPublish = draft.rightsStatus === "original" || draft.rightsStatus === "licensed";
  const visibleItems = useMemo(
    () => filter === "all" ? items : items.filter((item) => item.category === filter),
    [filter, items],
  );

  function updateDraft<K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "rightsStatus" && value !== "original" && value !== "licensed" ? { published: false } : {}),
    }));
  }

  function beginNew() {
    setEditingId(null);
    setDraft(blankDraft);
    setMessage("새 콘텐츠를 작성합니다.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function beginEdit(item: ContentItem) {
    setEditingId(item.id);
    setDraft(itemToDraft(item));
    setMessage(`‘${item.title}’ 편집 중`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("저장 중…");
    try {
      const response = await fetch(editingId ? `/api/admin/content/${editingId}` : "/api/admin/content", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json() as { item?: ContentItem; error?: string };
      if (!response.ok || !payload.item) throw new Error(payload.error ?? "저장하지 못했습니다.");

      setItems((current) => {
        const remaining = current.filter((item) => item.id !== payload.item!.id);
        return [payload.item!, ...remaining];
      });
      setEditingId(payload.item.id);
      setDraft(itemToDraft(payload.item));
      setMessage(payload.item.published ? "저장하고 학습 화면에 공개했습니다." : "초안으로 안전하게 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function removeContent(item: ContentItem) {
    if (!window.confirm(`‘${item.title}’을(를) 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    setMessage("삭제 중…");
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "삭제하지 못했습니다.");
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      if (editingId === item.id) beginNew();
      setMessage("콘텐츠를 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/" aria-label="Hangeul Pop home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span>Hangeul Pop</span>
        </Link>
        <nav><Link href="/">학습 화면</Link><Link href="/my">내 진도</Link><Link href="/legal">정책</Link></nav>
      </header>

      <section className="admin-hero">
        <div><p className="section-label">PRIVATE CONTENT STUDIO</p><h1>가사·대사·회화 관리</h1></div>
        <div className="admin-owner"><small>관리 계정</small><b>{adminEmail}</b></div>
      </section>

      <section className="admin-grid">
        <form className="admin-editor" onSubmit={saveContent}>
          <div className="admin-editor-heading">
            <div><p className="section-label">{editingId ? `EDIT #${editingId}` : "NEW CONTENT"}</p><h2>{editingId ? "콘텐츠 수정" : "콘텐츠 추가"}</h2></div>
            <button className="button button-secondary" type="button" onClick={beginNew}>+ 새 항목</button>
          </div>

          <div className="admin-form-row">
            <label>종류<select value={draft.category} onChange={(event) => updateDraft("category", event.target.value as Category)}>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>관리용 제목<input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="예: 여행지에서 길 묻기" /></label>
          </div>
          <div className="admin-form-row">
            <label>작품/출처 제목<input value={draft.sourceTitle} onChange={(event) => updateDraft("sourceTitle", event.target.value)} placeholder="직접 제작이면 비워도 됩니다" /></label>
            <label>가수·작가·제작자<input value={draft.creator} onChange={(event) => updateDraft("creator", event.target.value)} /></label>
          </div>
          <label>한국어 학습 원문<textarea required lang="ko" value={draft.koreanText} onChange={(event) => updateDraft("koreanText", event.target.value)} placeholder="학습자가 따라 입력할 한국어 문장" /></label>
          <label>번역/뜻<textarea value={draft.translation} onChange={(event) => updateDraft("translation", event.target.value)} placeholder="여러 언어 번역은 다음 단계에서 확장할 수 있습니다" /></label>
          <div className="admin-form-row">
            <label>여성 음성 파일 URL<input type="url" value={draft.audioFemaleUrl} onChange={(event) => updateDraft("audioFemaleUrl", event.target.value)} placeholder="https://…/female.mp3" /></label>
            <label>남성 음성 파일 URL<input type="url" value={draft.audioMaleUrl} onChange={(event) => updateDraft("audioMaleUrl", event.target.value)} placeholder="https://…/male.mp3" /></label>
          </div>
          <p className="admin-audio-hint">고정 콘텐츠는 음성을 한 번 생성해 파일로 보관하면 재생 호출 비용이 없습니다. 비워 두면 학습자의 기기 한국어 음성을 사용합니다.</p>
          <div className="admin-form-row">
            <label>권리 상태<select value={draft.rightsStatus} onChange={(event) => updateDraft("rightsStatus", event.target.value as RightsStatus)}>{Object.entries(rightsLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>허락 근거/메모<input value={draft.rightsNote} onChange={(event) => updateDraft("rightsNote", event.target.value)} placeholder="계약명, 이메일 허락일, 보관 위치 등" /></label>
          </div>

          <div className={`publish-control ${canPublish ? "ready" : "blocked"}`}>
            <label><input type="checkbox" checked={draft.published} disabled={!canPublish} onChange={(event) => updateDraft("published", event.target.checked)} /><span>학습 화면에 공개</span></label>
            <p>{canPublish ? "권리 확인이 끝난 원문만 공개할 수 있습니다." : "‘직접 만든 원문’ 또는 ‘라이선스 확보’를 선택해야 공개할 수 있습니다. 지금은 초안으로 저장됩니다."}</p>
          </div>

          <div className="admin-editor-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "처리 중…" : editingId ? "변경 저장" : "콘텐츠 저장"}</button><p aria-live="polite">{message}</p></div>
        </form>

        <aside className="admin-library">
          <div className="admin-library-heading"><div><p className="section-label">LIBRARY</p><h2>콘텐츠 {items.length}개</h2></div><select aria-label="콘텐츠 종류 필터" value={filter} onChange={(event) => setFilter(event.target.value as "all" | Category)}><option value="all">전체</option>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
          <div className="admin-item-list">
            {visibleItems.length ? visibleItems.map((item) => (
              <article className={editingId === item.id ? "selected" : ""} key={item.id}>
                <button className="admin-item-main" type="button" onClick={() => beginEdit(item)}>
                  <span><i>{categoryLabels[item.category as Category] ?? item.category}</i><em className={item.published ? "published" : "draft"}>{item.published ? "공개" : "초안"}</em></span>
                  <b>{item.title}</b><small lang="ko">{item.koreanText}</small>
                </button>
                <button className="admin-delete" type="button" disabled={busy} onClick={() => void removeContent(item)} aria-label={`${item.title} 삭제`}>삭제</button>
              </article>
            )) : <div className="admin-empty"><span>＋</span><b>아직 콘텐츠가 없습니다.</b><p>왼쪽 양식에서 첫 문장을 추가해 보세요.</p></div>}
          </div>
        </aside>
      </section>
    </main>
  );
}
