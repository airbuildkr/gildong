import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "gildong.ai — AI 투자 에이전트",
  description:
    "AI 투자 에이전트 '길동'의 매매 판단과 포트폴리오를 실시간으로 따라가는 웹 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        <div className="max-w-content mx-auto px-5 py-8 min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <Navigation />
        </div>
        <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          이 서비스는 AI의 가상 투자 기록이며, 실제 투자 조언이 아닙니다.
        </footer>
      </body>
    </html>
  );
}
