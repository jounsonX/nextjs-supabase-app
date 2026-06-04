import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { cn } from "@/lib/utils";
import {
  getDummyHostedEvents,
  getDummyJoinedEvents,
  getDummyEvent,
  getDummyApprovedCount,
  getDummyMyStatus,
} from "@/lib/dummy";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab = tab === "joined" ? "joined" : "hosting";

  const hostedEvents = getDummyHostedEvents();
  const joinedEventIds = getDummyJoinedEvents();
  const joinedEvents = joinedEventIds
    .map((id) => getDummyEvent(id))
    .filter((e) => e !== null);

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
                participantCount={getDummyApprovedCount(event.id)}
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
                participantCount={getDummyApprovedCount(event.id)}
                myStatus={getDummyMyStatus(event.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
