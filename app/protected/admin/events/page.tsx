import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">모임 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">모임 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Phase 2 — 모임 테이블, 강제 닫기/취소/삭제 액션 버튼 */}
          <p className="text-muted-foreground text-sm">
            Phase 2에서 모임 관리 UI가 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
