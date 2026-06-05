import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "MeetUp Manager — 소규모 친목 모임 관리 플랫폼",
  description:
    "5~20명 규모의 소규모 친목 모임을 쉽게 관리하세요. 공지, 참가자, 카풀, 정산까지 한 곳에서.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* 상단 헤더 */}
      <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-primary text-xl font-bold">
            MeetUp Manager
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button asChild size="sm">
              <Link href="/auth/login">로그인</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main>{children}</main>

      {/* 푸터 */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-5xl px-6 text-center text-sm">
          © 2026 MeetUp Manager. 소규모 친목 모임을 위한 올인원 플랫폼.
        </div>
      </footer>
    </div>
  );
}
