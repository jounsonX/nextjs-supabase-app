"use client";

import { useState, useTransition } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
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
import {
  togglePin,
  deleteAnnouncement,
} from "@/app/protected/events/[eventId]/actions";

interface AnnouncementActionsProps {
  announcementId: string;
  isPinned: boolean;
}

/**
 * 공지 핀 토글 및 삭제 버튼 (호스트 전용)
 * Client Component — 낙관적 UI 및 pending 상태 표시
 */
export function AnnouncementActions({
  announcementId,
  isPinned,
}: AnnouncementActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [pinState, setPinState] = useState(isPinned);

  // 핀 토글 처리
  function handleTogglePin() {
    startTransition(async () => {
      // 낙관적 업데이트: 서버 응답 전에 UI 먼저 반영
      setPinState((prev) => !prev);
      const result = await togglePin(announcementId);
      if (!result.success) {
        // 실패 시 원래 상태로 복원
        setPinState((prev) => !prev);
      }
    });
  }

  // 삭제 처리
  function handleDelete() {
    startTransition(async () => {
      await deleteAnnouncement(announcementId);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {/* 핀 토글 버튼 */}
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={handleTogglePin}
        disabled={isPending}
        title={pinState ? "핀 해제" : "상단 고정"}
      >
        {pinState ? (
          <PinOff size={13} className="text-primary" />
        ) : (
          <Pin size={13} className="text-muted-foreground" />
        )}
      </Button>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            disabled={isPending}
            title="공지 삭제"
          >
            <Trash2
              size={13}
              className="text-muted-foreground hover:text-destructive"
            />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 공지는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
