import { StatsCard } from "@/components/admin/stats-card";
import { getDummyAdminStats } from "@/lib/dummy";

export default function AdminDashboardPage() {
  const stats = getDummyAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Admin 대시보드</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="전체 모임" value={stats.total_events} />
        <StatsCard label="이번 달 신규" value={stats.new_events_this_month} />
        <StatsCard label="활성 모임" value={stats.active_events} />
        <StatsCard
          label="정산 완료율"
          value={`${stats.settlement_completion_rate}%`}
        />
      </div>
    </div>
  );
}
