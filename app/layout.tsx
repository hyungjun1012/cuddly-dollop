import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "가치가치 | 투자 기록",
  description: "생각, 근거, 리스크를 시점별로 쌓아가는 개인 투자 기록.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
