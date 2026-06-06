"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { requestCarpool } from "@/app/protected/events/[eventId]/actions";
import type { CarpoolRequestFormState } from "@/types/database.types";

const INITIAL_STATE: CarpoolRequestFormState = { success: false, message: "" };

interface CarpoolRequestButtonProps {
  carpoolId: string;
  remainingSeats: number;
}

export function CarpoolRequestButton({
  carpoolId,
  remainingSeats,
}: CarpoolRequestButtonProps) {
  const [state, requestAction, isPending] = useActionState(
    requestCarpool,
    INITIAL_STATE
  );

  const isFull = remainingSeats <= 0;

  return (
    <div className="flex flex-col gap-1">
      <form action={requestAction}>
        <input type="hidden" name="carpool_id" value={carpoolId} />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="mt-1 w-full"
          disabled={isFull || isPending || state.success}
        >
          {isPending
            ? "신청 중..."
            : isFull
              ? "자리 없음"
              : state.success
                ? "신청 완료"
                : "동승 신청"}
        </Button>
      </form>
      {state.message && !state.success && (
        <p className="text-destructive text-center text-xs">{state.message}</p>
      )}
    </div>
  );
}
