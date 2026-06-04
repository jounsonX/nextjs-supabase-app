import Link from "next/link";
import { ShieldX } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { DUMMY_USERS, CURRENT_USER_ID } from "@/lib/dummy";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 현재 사용자의 역할 확인 (더미 데이터 기반)
  const currentUser = DUMMY_USERS.find((u) => u.id === CURRENT_USER_ID);
  const isAdmin = currentUser?.role === "admin";

  // 관리자가 아닌 경우 접근 거부 UI 표시
  if (!isAdmin) {
    return (
      <div className="bg-background fixed inset-0 z-[100] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <ShieldX className="text-muted-foreground mx-auto h-12 w-12" />
          <h2 className="text-lg font-semibold">접근 권한이 없습니다</h2>
          <p className="text-muted-foreground text-sm">
            Admin 전용 페이지입니다.
          </p>
          <Link href="/protected">
            <Button variant="outline">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    // fixed inset-0으로 뷰포트 전체를 덮어 BottomNav/Header 완전히 가림
    <div className="bg-background fixed inset-0 z-[100] flex">
      {/* 왼쪽 사이드바 */}
      <aside className="bg-muted/40 flex w-60 flex-shrink-0 flex-col border-r">
        <div className="flex h-14 items-center border-b px-5">
          <Link
            href="/protected/admin"
            className="text-primary text-lg font-bold"
          >
            MeetUp Admin
          </Link>
        </div>
        <AdminNav />
      </aside>

      {/* 오른쪽 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-background sticky top-0 z-40 flex h-14 items-center justify-end border-b px-6">
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
