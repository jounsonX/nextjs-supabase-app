import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { cn } from "@/lib/utils";
import { getEvents } from "@/app/protected/events/actions";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab = tab === "joined" ? "joined" : "hosting";

  const { hostedEvents, joinedEvents } = await getEvents();

  // event_participants(count) 집계값에서 참여자 수 추출
  function getParticipantCount(event: (typeof hostedEvents)[number]): number {
    const raw = event.event_participants;
    if (Array.isArray(raw) && raw.length > 0) {
      const first = raw[0] as { count: number };
      return first.count ?? 0;
    }
    return 0;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">모임 목록</h1>
        {activeTab === "hosting" && (
          <Button asChild size="sm">
            <Link href="/protected/events/new">+ 새 모임</Link>
          </Button>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-4 border-b">
        <Link
          href="?tab=hosting"
          className={cn(
            "pb-2 text-sm font-medium transition-colors",
            activeTab === "hosting"
              ? "border-foreground text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          )}
        >
          주최한 모임
        </Link>
        <Link
          href="?tab=joined"
          className={cn(
            "pb-2 text-sm font-medium transition-colors",
            activeTab === "joined"
              ? "border-foreground text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
          )}
        >
          참여한 모임
        </Link>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "hosting" && (
        <div className="flex flex-col gap-3">
          {hostedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 주최한 모임이 없습니다.
            </p>
          ) : (
            hostedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCount={getParticipantCount(event)}
              />
            ))
          )}
        </div>
      )}
      {activeTab === "joined" && (
        <div className="flex flex-col gap-3">
          {joinedEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              아직 참여한 모임이 없습니다.
            </p>
          ) : (
            joinedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCount={getParticipantCount(event)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
