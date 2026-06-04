import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEventPage() {
  return (
    <div className="p-4">
      <Link
        href="/protected/events"
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
      >
        ← 모임 목록
      </Link>

      <h1 className="mb-4 text-xl font-bold">새 모임 만들기</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">모임 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Phase 2 — createEvent Server Action 연결 */}
          <form className="flex flex-col gap-4">
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
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="모임에 대한 설명을 입력하세요"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">상태</Label>
              <select
                id="status"
                name="status"
                defaultValue="open"
                className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <option value="open">공개 (신청 가능)</option>
                <option value="closed">마감</option>
              </select>
            </div>

            <Button type="submit" className="mt-2">
              모임 만들기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
