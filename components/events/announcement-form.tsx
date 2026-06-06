"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createAnnouncement } from "@/app/protected/events/[eventId]/actions";
import type { AnnouncementFormState } from "@/types/database.types";

const INITIAL_STATE: AnnouncementFormState = { success: false, message: "" };

interface AnnouncementFormProps {
  eventId: string;
}

/**
 * 공지 작성 폼 컴포넌트
 * createAnnouncement Server Action 연결
 */
export function AnnouncementForm({ eventId }: AnnouncementFormProps) {
  const [state, formAction, isPending] = useActionState(
    createAnnouncement,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* event_id 히든 필드 */}
      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">공지 제목 *</Label>
        <Input
          id="title"
          name="title"
          placeholder="공지 제목을 입력하세요"
          disabled={isPending}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">내용 *</Label>
        <Textarea
          id="content"
          name="content"
          rows={6}
          placeholder="공지 내용을 입력하세요"
          disabled={isPending}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="is_pinned" name="is_pinned" disabled={isPending} />
        <Label htmlFor="is_pinned" className="cursor-pointer">
          상단 고정
        </Label>
      </div>

      {/* 에러 메시지 */}
      {state.message && !state.success && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="mt-2 flex gap-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "등록 중..." : "공지 등록"}
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/protected/events/${eventId}?tab=announcements`}>
            취소
          </Link>
        </Button>
      </div>
    </form>
  );
}
