"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/events/status-badge";
import {
  forceCloseEvent,
  forceCancelEvent,
} from "@/app/protected/admin/actions";
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

function EventActionButtons({ event }: { event: EventWithCount }) {
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    startTransition(async () => {
      await forceCloseEvent(event.id);
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await forceCancelEvent(event.id);
    });
  };

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={
              isPending ||
              event.status === "closed" ||
              event.status === "cancelled"
            }
          >
            마감
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모임을 마감하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{event.title}&rdquo; 모임을 강제 마감합니다. 이 작업은
              되돌리기 어렵습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={isPending}>
              마감 확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive h-7 px-2 text-xs"
            disabled={isPending || event.status === "cancelled"}
          >
            취소
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모임을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{event.title}&rdquo; 모임을 강제 취소합니다. 이 작업은
              되돌리기 어렵습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              취소 확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
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
              <EventActionButtons event={event} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
