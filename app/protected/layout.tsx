import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { BottomNav } from "@/components/bottom-nav";
import { CreateEventFab } from "@/components/create-event-fab";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b px-4">
        <Link href="/protected" className="text-primary text-lg font-bold">
          MeetUp
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 pb-14">
        <Suspense>{children}</Suspense>
      </main>

      <Suspense>
        <CreateEventFab />
      </Suspense>
      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  );
}
