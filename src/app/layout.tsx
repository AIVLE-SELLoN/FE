import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SELLoN",
  description: "멀티채널 이상 탐지 및 개선 자동화 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
