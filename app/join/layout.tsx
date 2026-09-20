import type { Metadata } from "next";

// /join is meaningless without a class code in the query string, so every crawlable
// variant of it is the same empty "enter your code" shell. Indexing it would just
// feed Search Console more duplicates; noindex keeps it out while staying reachable.
export const metadata: Metadata = {
  title: "Join a class — Seoul Keys",
  description: "Enter your class code to join your teacher's Seoul Keys class.",
  alternates: { canonical: "https://seoulkeys.com/join" },
  robots: { index: false, follow: true },
};

export default function JoinLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
