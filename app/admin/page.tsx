import type { Metadata } from "next";
import Link from "next/link";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getAdminUser } from "../admin-auth";
import { listAdminContent } from "../../db/content";
import AdminConsole from "./AdminConsole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content studio — Hangeul Pop",
  description: "Manage Korean learning passages and their publication rights.",
};

export default async function AdminPage() {
  const identity = await requireChatGPTUser("/admin");
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <main className="admin-shell admin-denied">
        <Link className="brand" href="/" aria-label="Hangeul Pop home">
          <span className="brand-mark" aria-hidden="true">ㅎ</span>
          <span>Hangeul Pop</span>
        </Link>
        <section className="admin-denied-card">
          <p className="section-label">PRIVATE CONTENT STUDIO</p>
          <h1>관리자 권한이 필요합니다.</h1>
          <p><b>{identity.email}</b> 계정에는 콘텐츠 관리 권한이 없습니다.</p>
          <Link className="button button-primary" href="/">학습 화면으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const items = await listAdminContent();

  return <AdminConsole initialItems={items} adminEmail={admin.email} />;
}
