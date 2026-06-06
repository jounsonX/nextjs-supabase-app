"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { togglePayment } from "@/app/protected/events/[eventId]/actions";

interface SettlementPaymentButtonProps {
  participantId: string;
  paymentDone: boolean;
}

export function SettlementPaymentButton({
  participantId,
  paymentDone,
}: SettlementPaymentButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await togglePayment(participantId);
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? "..." : paymentDone ? "납부 취소" : "납부 확인"}
    </Button>
  );
}
