import type { Metadata } from "next";

// page.tsx is a client component, so it cannot export metadata itself. This server
// layout exists purely to give /teacher its own canonical — otherwise it inherits
// the root layout's canonical and tells Google it is a duplicate of the homepage.
export const metadata: Metadata = {
  title: "Teacher dashboard — Seoul Keys",
  description: "Create a class, assign Korean typing practice, and track each student's streak, XP, and accuracy.",
  alternates: { canonical: "https://seoulkeys.com/teacher" },
  robots: { index: false, follow: true },
};

export default function TeacherLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
