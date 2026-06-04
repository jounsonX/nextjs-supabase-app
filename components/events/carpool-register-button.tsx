"use client";

import { useState } from "react";
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

interface CarpoolRegisterButtonProps {
  eventId: string;
}

export function CarpoolRegisterButton({
  eventId: _eventId,
}: CarpoolRegisterButtonProps) {
  const [open, setOpen] = useState(false);

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
        {/* TODO: Phase 3 — createCarpool Server Action 연결 */}
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="departure">출발지 *</Label>
            <Input
              id="departure"
              name="departure"
              placeholder="출발 장소를 입력하세요"
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

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled>
              등록
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
