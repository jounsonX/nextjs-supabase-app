import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function NewAnnouncementPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <div className="p-4">
      <Link
        href={`/protected/events/${eventId}?tab=announcements`}
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
      >
        ← 공지 목록
      </Link>

      <h1 className="mb-4 text-xl font-bold">공지 작성</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">공지 내용 입력</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Phase 3 — createAnnouncement Server Action 연결 */}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">공지 제목 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="공지 제목을 입력하세요"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                name="content"
                rows={6}
                placeholder="공지 내용을 입력하세요"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="is_pinned" name="is_pinned" />
              <Label htmlFor="is_pinned" className="cursor-pointer">
                상단 고정
              </Label>
            </div>

            <div className="mt-2 flex gap-2">
              <Button type="submit" className="flex-1">
                공지 등록
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/protected/events/${eventId}?tab=announcements`}>
                  취소
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
