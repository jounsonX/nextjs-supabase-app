"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const FAB_VISIBLE_PATHS = ["/protected", "/protected/events"];

export function CreateEventFab() {
  const pathname = usePathname();

  if (pathname.startsWith("/protected/admin")) return null;
  if (!FAB_VISIBLE_PATHS.includes(pathname)) return null;

  return (
    <Link
      href="/protected/events/new"
      className={cn(
        "absolute right-4 bottom-20 z-50",
        "flex h-14 w-14 items-center justify-center",
        "bg-primary rounded-full shadow-lg",
        "text-primary-foreground",
        "hover:bg-primary/90 transition-colors"
      )}
      aria-label="모임 만들기"
    >
      <Plus size={24} />
    </Link>
  );
}
