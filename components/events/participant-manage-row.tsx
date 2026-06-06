"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantBadge } from "@/components/events/participant-badge";
import {
  approveParticipant,
  rejectParticipant,
} from "@/app/protected/events/[eventId]/actions";
import type {
  Profile,
  ParticipantStatus,
  ParticipationFormState,
} from "@/types/database.types";

const INITIAL_STATE: ParticipationFormState = { success: false, message: "" };

interface ParticipantManageRowProps {
  participantId: string;
  profile: Profile;
  status: ParticipantStatus;
}

/**
 * 참여자 승인/거절 행 컴포넌트 (호스트 전용)
 * - pending 상태: 승인/거절 버튼 표시
 * - approved 상태: 거절 버튼만 표시
 * - waitlisted 상태: 승인 버튼 표시 (직접 승급)
 */
export function ParticipantManageRow({
  participantId,
  profile,
  status,
}: ParticipantManageRowProps) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveParticipant,
    INITIAL_STATE
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectParticipant,
    INITIAL_STATE
  );

  const isPending = approvePending || rejectPending;

  const showApprove = status === "pending" || status === "waitlisted";
  const showReject = status === "pending" || status === "approved";

  if (!showApprove && !showReject) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <ParticipantBadge profile={profile} status={status} />
        <div className="flex gap-2">
          {showApprove && (
            <form action={approveAction}>
              <input
                type="hidden"
                name="participant_id"
                value={participantId}
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={isPending}
              >
                {approvePending ? "..." : "승인"}
              </Button>
            </form>
          )}
          {showReject && (
            <form action={rejectAction}>
              <input
                type="hidden"
                name="participant_id"
                value={participantId}
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive h-7 text-xs"
                disabled={isPending}
              >
                {rejectPending ? "..." : "거절"}
              </Button>
            </form>
          )}
        </div>
      </div>
      {/* 에러 메시지 표시 */}
      {(approveState.message || rejectState.message) && (
        <p className="text-destructive text-right text-xs">
          {approveState.message || rejectState.message}
        </p>
      )}
    </div>
  );
}
