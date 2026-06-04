import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">사용자 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">가입자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Phase 2 — 가입자 테이블, 역할 변경 드롭다운 */}
          <p className="text-muted-foreground text-sm">
            Phase 2에서 사용자 목록 UI가 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
