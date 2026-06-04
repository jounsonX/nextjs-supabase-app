import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen">
      {/* 왼쪽 사이드바 */}
      <aside className="bg-muted/40 flex w-60 flex-shrink-0 flex-col border-r">
        <div className="flex h-14 items-center border-b px-5">
          <Link href="/admin" className="text-primary text-lg font-bold">
            MeetUp Admin
          </Link>
        </div>
        <AdminNav />
      </aside>

      {/* 오른쪽 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col">
        <header className="bg-background sticky top-0 z-40 flex h-14 items-center justify-end border-b px-6">
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
