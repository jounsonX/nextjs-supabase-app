import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTable } from "@/components/admin/event-table";
import { DUMMY_EVENTS, getDummyApprovedCount } from "@/lib/dummy";

export default function AdminEventsPage() {
  // 각 모임의 승인된 참여자 수를 계산하여 테이블에 전달
  const eventsWithCount = DUMMY_EVENTS.map((event) => ({
    ...event,
    participantCount: getDummyApprovedCount(event.id),
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">모임 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            모임 목록 ({DUMMY_EVENTS.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EventTable events={eventsWithCount} />
        </CardContent>
      </Card>
    </div>
  );
}
