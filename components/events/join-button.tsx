"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  joinEvent,
  cancelParticipation,
} from "@/app/protected/events/[eventId]/actions";
import type {
  ParticipantStatus,
  ParticipationFormState,
} from "@/types/database.types";

const INITIAL_STATE: ParticipationFormState = { success: false, message: "" };

interface JoinButtonProps {
  eventId: string;
  myStatus: ParticipantStatus | null;
  /** 본인 참여 레코드 ID (취소 시 필요) */
  participantId?: string;
}

/**
 * 참여 신청 / 취소 버튼 컴포넌트
 * - myStatus === null: 참여 신청 버튼
 * - myStatus === "pending" | "approved" | "waitlisted": 취소 버튼
 */
export function JoinButton({
  eventId,
  myStatus,
  participantId,
}: JoinButtonProps) {
  const [joinState, joinAction, joinPending] = useActionState(
    joinEvent,
    INITIAL_STATE
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelParticipation,
    INITIAL_STATE
  );

  const isPending = joinPending || cancelPending;

  // 참여 신청
  if (myStatus === null) {
    return (
      <div className="flex flex-col gap-1">
        <form action={joinAction}>
          <input type="hidden" name="event_id" value={eventId} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {joinPending ? "신청 중..." : "참여 신청"}
          </Button>
        </form>
        {joinState.message && (
          <p
            className={`text-center text-xs ${joinState.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
          >
            {joinState.message}
          </p>
        )}
      </div>
    );
  }

  // 취소 가능한 상태 (pending, approved, waitlisted)
  if (
    (myStatus === "pending" ||
      myStatus === "approved" ||
      myStatus === "waitlisted") &&
    participantId
  ) {
    const labelMap: Record<string, string> = {
      pending: "신청 취소 (승인 대기 중)",
      approved: "참여 취소",
      waitlisted: "대기 취소",
    };

    return (
      <div className="flex flex-col gap-1">
        <form action={cancelAction}>
          <input type="hidden" name="participant_id" value={participantId} />
          <Button
            type="submit"
            className="w-full"
            variant={myStatus === "approved" ? "secondary" : "outline"}
            disabled={isPending}
          >
            {cancelPending ? "처리 중..." : labelMap[myStatus]}
          </Button>
        </form>
        {cancelState.message && (
          <p
            className={`text-center text-xs ${cancelState.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
          >
            {cancelState.message}
          </p>
        )}
      </div>
    );
  }

  // 거절/취소됨 — 재신청 안내
  if (myStatus === "rejected" || myStatus === "cancelled") {
    return (
      <div className="flex flex-col gap-1">
        <form action={joinAction}>
          <input type="hidden" name="event_id" value={eventId} />
          <Button
            type="submit"
            className="w-full"
            variant="outline"
            disabled={isPending}
          >
            {joinPending ? "신청 중..." : "재참여 신청"}
          </Button>
        </form>
        {joinState.message && (
          <p
            className={`text-center text-xs ${joinState.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
          >
            {joinState.message}
          </p>
        )}
      </div>
    );
  }

  return null;
}
