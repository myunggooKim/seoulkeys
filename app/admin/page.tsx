import type { Metadata } from "next";
import Link from "next/link";
import { getAppUser, googleClientId } from "../google-auth";
import { GoogleSignIn } from "../GoogleSignIn";
import { getAdminUser } from "../admin-auth";
import { listAdminContent } from "../../db/content";
import AdminConsole from "./AdminConsole";

export const dynamic = "force-dynamic";

// robots.txt disallows /admin, but a disallowed URL can still be indexed from an
// external link — only a robots meta tag actually keeps it out of the results.
export const metadata: Metadata = {
  title: "Content studio — Seoul Keys",
  description: "Manage Korean learning passages and their publication rights.",
  alternates: { canonical: "https://seoulkeys.com/admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Nullable check so a signed-out visitor gets the sign-in card, not a redirect.
  const identity = await getAppUser();
  const admin = identity ? await getAdminUser() : null;

  if (!admin) {
    return (
      <main className="admin-shell admin-denied">
        <Link className="brand" href="/" aria-label="Seoul Keys home">
          <span className="brand-mark" aria-hidden="true">ㅅ</span>
          <span>Seoul Keys</span>
        </Link>
        <section className="admin-denied-card">
          <p className="section-label">PRIVATE CONTENT STUDIO</p>
          <h1>관리자 권한이 필요합니다.</h1>
          {identity ? (
            <p><b>{identity.email}</b> 계정에는 콘텐츠 관리 권한이 없습니다.</p>
          ) : (
            <>
              <p>구글 계정으로 로그인해 주세요.</p>
              <GoogleSignIn
                clientId={googleClientId()}
                koreanUi
                labelKo="구글 계정으로 로그인"
                labelEn="Sign in with Google"
              />
            </>
          )}
          <Link className="button button-primary" href="/">학습 화면으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  const items = await listAdminContent();

  return <AdminConsole initialItems={items} adminEmail={admin.email} />;
}
