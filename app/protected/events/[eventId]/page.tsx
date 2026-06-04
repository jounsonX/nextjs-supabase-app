import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { key: "info", label: "정보" },
  { key: "announcements", label: "공지" },
  { key: "settlement", label: "정산" },
  { key: "carpool", label: "카풀" },
] as const;

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const { tab } = await searchParams;
  const activeTab = tab ?? "info";

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex flex-col gap-1">
          <Link
            href="/protected/events"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← 모임 목록
          </Link>
          <h1 className="text-xl font-bold">모임 제목</h1>
          <Badge variant="secondary">open</Badge>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/protected/events/${eventId}/edit`}>수정</Link>
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="flex border-b px-4">
        {TABS.map(({ key, label }) => (
          <Link
            key={key}
            href={`?tab=${key}`}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {activeTab === "info" && (
          <div className="flex flex-col gap-4">
            {/* TODO: Phase 2 — 모임 정보(일시/장소/정원/비용/설명) */}
            <p className="text-muted-foreground text-sm">
              모임 정보가 표시됩니다.
            </p>
            {/* TODO: Phase 2 — 참여 신청/취소 버튼, 참여자 목록 */}
            <Button variant="outline" disabled>
              참여 신청
            </Button>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button asChild size="sm">
                <Link href={`/protected/events/${eventId}/announcements/new`}>
                  + 공지 작성
                </Link>
              </Button>
            </div>
            {/* TODO: Phase 2 — 공지 목록 (핀 고정 우선 정렬) */}
            <p className="text-muted-foreground text-sm">
              공지 목록이 표시됩니다.
            </p>
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="flex flex-col gap-4">
            {/* TODO: Phase 2 — 1인당 금액 표시, 참여자별 완료 체크 */}
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">총 비용: -원</p>
              <p className="text-muted-foreground text-sm">1인당: -원</p>
            </div>
            <p className="text-muted-foreground text-sm">
              정산 현황이 표시됩니다.
            </p>
          </div>
        )}

        {activeTab === "carpool" && (
          <div className="flex flex-col gap-4">
            {/* TODO: Phase 2 — 카풀 목록, 등록 폼, 동승 신청 버튼 */}
            <Button variant="outline" disabled>
              카풀 등록
            </Button>
            <p className="text-muted-foreground text-sm">
              카풀 정보가 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
