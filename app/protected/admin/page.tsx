import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Admin 대시보드</h1>

      {/* TODO: Phase 2 — 실제 통계 카드/차트 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "전체 모임", value: "-" },
          { label: "이번 달 신규", value: "-" },
          { label: "활성 모임", value: "-" },
          { label: "정산 완료율", value: "-" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-muted-foreground text-xs">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
