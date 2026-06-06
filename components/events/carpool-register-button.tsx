"use client";

import { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCarpool } from "@/app/protected/events/[eventId]/actions";
import type { CarpoolFormState } from "@/types/database.types";

const INITIAL_STATE: CarpoolFormState = { success: false, message: "" };

interface CarpoolRegisterButtonProps {
  eventId: string;
}

export function CarpoolRegisterButton({ eventId }: CarpoolRegisterButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, createAction, isPending] = useActionState(
    createCarpool,
    INITIAL_STATE
  );

  // 등록 성공 시 다이얼로그 닫기 (redirect가 발생하지 않는 경우 대비)
  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          + 카풀 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>카풀 등록</DialogTitle>
        </DialogHeader>
        <form action={createAction} className="flex flex-col gap-4">
          <input type="hidden" name="event_id" value={eventId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="departure">출발지 *</Label>
            <Input
              id="departure"
              name="departure"
              placeholder="출발 장소를 입력하세요"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacity">좌석 수 *</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">메모</Label>
            <Textarea
              id="note"
              name="note"
              rows={3}
              placeholder="추가 안내사항 (선택)"
            />
          </div>

          {state.message && !state.success && (
            <p className="text-destructive text-sm">{state.message}</p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
