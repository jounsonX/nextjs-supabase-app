import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { getDummyEvent } from "@/lib/dummy";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { eventId } = await params;
  const event = getDummyEvent(eventId);
  if (!event) notFound();

  const localDatetime = event.event_date
    ? new Date(event.event_date).toISOString().slice(0, 16)
    : "";

  return (
    <div className="p-4">
      <Link
        href={`/protected/events/${eventId}`}
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
      >
        ← 모임 상세
      </Link>

      <h1 className="mb-4 text-xl font-bold">모임 수정</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">모임 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Phase 3 — updateEvent Server Action 연결 */}
          <form className="flex flex-col gap-4">
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
              <Label htmlFor="status">상태</Label>
              <Select name="status" defaultValue={event.status}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">공개 (신청 가능)</SelectItem>
                  <SelectItem value="closed">마감</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2 flex gap-2">
              <Button type="submit" className="flex-1">
                변경 저장
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/protected/events/${eventId}`}>취소</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
