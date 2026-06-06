import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/app/protected/events/[eventId]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/events/announcement-form";

type Props = {
  params: Promise<{ eventId: string }>;
};

/**
 * 공지 작성 페이지
 * - 호스트만 접근 가능 (서버에서 권한 검증)
 */
export default async function NewAnnouncementPage({ params }: Props) {
  const { eventId } = await params;

  // 모임 조회
  const event = await getEvent(eventId);
  if (!event) redirect("/protected/events");

  // 현재 사용자 확인 — 호스트가 아니면 상세 페이지로 리다이렉트
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const currentUserId = claimsData?.claims?.sub ?? null;

  if (!currentUserId || event.host_id !== currentUserId) {
    redirect(`/protected/events/${eventId}?tab=announcements`);
  }

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
          <AnnouncementForm eventId={eventId} />
        </CardContent>
      </Card>
    </div>
  );
}
