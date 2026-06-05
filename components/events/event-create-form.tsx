"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createEvent } from "@/app/protected/events/actions";
import type { EventFormState, EventStatus } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const initialState: EventFormState = { success: false, message: "" };

/** 제출 버튼 — useFormStatus는 form 내부에서만 동작 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-2">
      {pending ? "생성 중..." : "모임 만들기"}
    </Button>
  );
}

export function EventCreateForm() {
  const [state, formAction] = useActionState(createEvent, initialState);
  // Select는 name 속성을 FormData에 전달하지 않으므로 hidden input으로 관리
  const [status, setStatus] = useState<EventStatus>("open");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">모임 정보 입력</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">모임 제목 *</Label>
            <Input
              id="title"
              name="title"
              placeholder="모임 이름을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event_date">날짜 / 시간</Label>
            <Input id="event_date" name="event_date" type="datetime-local" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">장소</Label>
            <Input id="location" name="location" placeholder="모임 장소" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="max_capacity">최대 인원</Label>
              <Input
                id="max_capacity"
                name="max_capacity"
                type="number"
                min={1}
                placeholder="인원 수"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost">참가비 (원)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min={0}
                placeholder="0"
                defaultValue={0}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="모임에 대한 설명을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-trigger">상태</Label>
            {/* Select는 FormData에 name을 전달하지 않으므로 hidden input 사용 */}
            <input type="hidden" name="status" value={status} />
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EventStatus)}
            >
              <SelectTrigger id="status-trigger">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">공개 (신청 가능)</SelectItem>
                <SelectItem value="closed">마감</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.message && (
            <p
              className={cn(
                "text-sm",
                state.success ? "text-green-600" : "text-red-500"
              )}
            >
              {state.message}
            </p>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
