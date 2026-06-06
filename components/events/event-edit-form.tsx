"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateEvent,
  deleteEvent,
} from "@/app/protected/events/[eventId]/actions";
import type {
  Event,
  EventFormState,
  EventStatus,
} from "@/types/database.types";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventEditFormProps {
  event: Event;
}

const initialState: EventFormState = { success: false, message: "" };

/** 저장 버튼 — useFormStatus는 form 내부에서만 동작 */
function SaveButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="button"
      disabled={pending}
      className="flex-1"
      onClick={onClick}
    >
      {pending ? "저장 중..." : "변경 저장"}
    </Button>
  );
}

export function EventEditForm({ event }: EventEditFormProps) {
  // updateEvent의 첫 번째 인자(eventId)를 bind로 고정
  const updateEventWithId = updateEvent.bind(null, event.id);
  const [state, formAction] = useActionState(updateEventWithId, initialState);

  // Select는 FormData에 name을 전달하지 않으므로 hidden input으로 관리
  const [status, setStatus] = useState<EventStatus>(event.status);

  // 저장 확인 다이얼로그 상태
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // datetime-local 형식으로 변환 (YYYY-MM-DDTHH:mm)
  const localDatetime = event.event_date
    ? new Date(event.event_date).toISOString().slice(0, 16)
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">모임 정보 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">모임 제목 *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event.title}
              placeholder="모임 이름을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event_date">날짜 / 시간</Label>
            <Input
              id="event_date"
              name="event_date"
              type="datetime-local"
              defaultValue={localDatetime}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">장소</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event.location ?? ""}
              placeholder="모임 장소"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="max_capacity">최대 인원</Label>
              <Input
                id="max_capacity"
                name="max_capacity"
                type="number"
                min={1}
                defaultValue={event.max_capacity ?? ""}
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
                defaultValue={event.cost}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={event.description ?? ""}
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
                <SelectItem value="cancelled">취소됨</SelectItem>
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

          <div className="mt-2 flex gap-2">
            {/* 변경 저장 확인 다이얼로그 */}
            <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <SaveButton onClick={() => setSaveDialogOpen(true)} />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>변경 사항을 저장할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    수정한 모임 정보가 저장됩니다. 계속하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setSaveDialogOpen(false);
                      formRef.current?.requestSubmit();
                    }}
                  >
                    저장
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button asChild variant="outline" className="flex-1">
              <Link href={`/protected/events/${event.id}`}>취소</Link>
            </Button>
          </div>
        </form>

        {/* 모임 삭제 — 별도 form으로 분리하여 제출 충돌 방지 */}
        <div className="mt-4 border-t pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                모임 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>모임을 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  삭제된 모임은 복구할 수 없습니다. 공지, 참여자 정보 등 관련
                  데이터가 모두 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <form action={deleteEvent.bind(null, event.id)}>
                  <AlertDialogAction
                    type="submit"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full"
                  >
                    삭제
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
