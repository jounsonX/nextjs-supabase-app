import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTable } from "@/components/admin/event-table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const allEvents = events ?? [];

  // 각 모임의 승인된 참여자 수를 개별 count 쿼리로 집계
  const eventsWithCount = await Promise.all(
    allEvents.map(async (event) => {
      const { count } = await supabase
        .from("event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "approved");

      return { ...event, participantCount: count ?? 0 };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">모임 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            모임 목록 ({eventsWithCount.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EventTable events={eventsWithCount} />
        </CardContent>
      </Card>
    </div>
  );
}
