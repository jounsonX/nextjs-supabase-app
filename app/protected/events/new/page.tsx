import Link from "next/link";
import { EventCreateForm } from "@/components/events/event-create-form";

export default function NewEventPage() {
  return (
    <div className="p-4">
      <Link
        href="/protected/events"
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
      >
        ← 모임 목록
      </Link>

      <h1 className="mb-4 text-xl font-bold">새 모임 만들기</h1>

      <EventCreateForm />
    </div>
  );
}
