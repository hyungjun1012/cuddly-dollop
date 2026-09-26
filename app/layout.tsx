import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 몸 밖의 생각 | 매매일지",
  description: "심리, 가설, 리스크를 시점별로 쌓아가는 개인 매매일지.",
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
