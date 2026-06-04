"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/events/status-badge";
import type { Event } from "@/types/database.types";

interface EventWithCount extends Event {
  participantCount: number;
}

interface EventTableProps {
  events: EventWithCount[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EventTable({ events }: EventTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>날짜</TableHead>
          <TableHead>참여자</TableHead>
          <TableHead className="w-32">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="max-w-[140px]">
              <span className="line-clamp-1 font-medium">{event.title}</span>
            </TableCell>
            <TableCell>
              <StatusBadge type="event" status={event.status} />
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(event.event_date)}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {event.participantCount}
              {event.max_capacity ? `/${event.max_capacity}` : ""}명
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={event.status === "closed"}
                >
                  마감
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                  disabled={event.status === "cancelled"}
                >
                  취소
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
