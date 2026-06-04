import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { CapacityDisplay } from "./capacity-display";
import type { Event, ParticipantStatus } from "@/types/database.types";

interface EventCardProps {
  event: Event;
  participantCount: number;
  myStatus?: ParticipantStatus | null;
  variant?: "default" | "compact";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "날짜 미정";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCost(cost: number): string {
  if (cost === 0) return "무료";
  return `${cost.toLocaleString("ko-KR")}원`;
}

export function EventCard({
  event,
  participantCount,
  myStatus,
  variant = "default",
}: EventCardProps) {
  return (
    <Link href={`/protected/events/${event.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            {/* 상태 배지 + 날짜 */}
            <div className="flex items-center justify-between">
              <StatusBadge type="event" status={event.status} />
              {event.event_date && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Calendar size={12} />
                  {formatDate(event.event_date)}
                </span>
              )}
            </div>

            {/* 모임 제목 */}
            <h3 className="line-clamp-1 font-semibold">{event.title}</h3>

            {variant === "default" && event.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {event.description}
              </p>
            )}

            {/* 장소 */}
            {event.location && (
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin size={14} />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}

            {/* 하단: 정원 + 비용 + 내 상태 */}
            <div className="flex items-center justify-between pt-1">
              <CapacityDisplay
                current={participantCount}
                max={event.max_capacity}
              />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {formatCost(event.cost)}
                </span>
                {myStatus && (
                  <StatusBadge type="participant" status={myStatus} />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
