import Link from "next/link";
import { LayoutDashboard, Users, CalendarDays } from "lucide-react";

const ADMIN_NAV = [
  { href: "/protected/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/protected/admin/users", label: "사용자 관리", icon: Users },
  { href: "/protected/admin/events", label: "모임 관리", icon: CalendarDays },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* 데스크톱 사이드바 */}
      <aside className="bg-muted/40 hidden w-56 flex-shrink-0 border-r md:flex md:flex-col">
        <div className="p-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Admin
          </p>
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* 모바일 상단 탭 */}
      <div className="flex flex-1 flex-col">
        <nav className="flex border-b md:hidden">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
