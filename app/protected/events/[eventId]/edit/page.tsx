import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent } from "@/app/protected/events/[eventId]/actions";
import { EventEditForm } from "@/components/events/event-edit-form";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) notFound();

  return (
    <div className="p-4">
      <Link
        href={`/protected/events/${eventId}`}
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
      >
        ← 모임 상세
      </Link>

      <h1 className="mb-4 text-xl font-bold">모임 수정</h1>

      <EventEditForm event={event} />
    </div>
  );
}
