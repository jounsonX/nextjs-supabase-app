import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { getEvents } from "@/app/protected/events/actions";

export default async function ProtectedHomePage() {
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
    <div className="flex flex-col gap-6 p-4">
      {/* 내가 주최한 모임 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 주최한 모임</h2>
          <Button asChild size="sm">
            <Link href="/protected/events/new">+ 새 모임</Link>
          </Button>
        </div>
        {hostedEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아직 주최한 모임이 없습니다. 새 모임을 만들어 친구들을 초대해
            보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {hostedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCount={getParticipantCount(event)}
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>

      {/* 내가 참여한 모임 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 참여한 모임</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/protected/events">모임 목록 보기</Link>
          </Button>
        </div>
        {joinedEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아직 참여한 모임이 없습니다. 모임 목록에서 참여하고 싶은 모임을
            찾아보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {joinedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                participantCount={getParticipantCount(event)}
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
