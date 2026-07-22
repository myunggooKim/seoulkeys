import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Hangeul Pop — Learn Korean typing through play";
const description = "Practice Hangul home keys, words, puzzles, long-form typing, and licensed K-POP challenges in short daily sessions.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    applicationName: "Hangeul Pop",
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Hangeul Pop",
      images: [{ url: "/og.png", width: 1731, height: 909, alt: "Hangeul Pop Korean typing practice" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
