export { DUMMY_USERS, CURRENT_USER_ID, getDummyUser } from "./users";
export { DUMMY_EVENTS, getDummyEvent, getDummyHostedEvents } from "./events";
export {
  DUMMY_PARTICIPANTS,
  getDummyParticipants,
  getDummyApprovedCount,
  getDummyMyStatus,
  getDummySettlement,
  getDummyJoinedEvents,
} from "./participants";
export { DUMMY_ANNOUNCEMENTS, getDummyAnnouncements } from "./announcements";
export {
  DUMMY_CARPOOLS,
  DUMMY_CARPOOL_REQUESTS,
  getDummyCarpools,
} from "./carpools";

import type { AdminStats } from "@/types/database.types";
import { DUMMY_EVENTS } from "./events";
import { DUMMY_PARTICIPANTS } from "./participants";

export function getDummyAdminStats(): AdminStats {
  const totalEvents = DUMMY_EVENTS.length;
  const activeEvents = DUMMY_EVENTS.filter((e) => e.status === "open").length;

  // 2026년 6월 이후 생성된 모임 수
  const newEventsThisMonth = DUMMY_EVENTS.filter((e) => {
    const created = new Date(e.created_at);
    return created.getFullYear() === 2026 && created.getMonth() === 4; // 5월 (0-indexed)
  }).length;

  // 전체 approved 참여자 중 payment_done 비율
  const approved = DUMMY_PARTICIPANTS.filter((p) => p.status === "approved");
  const paid = approved.filter((p) => p.payment_done).length;
  const settlementRate =
    approved.length > 0 ? Math.round((paid / approved.length) * 100) : 0;

  return {
    total_events: totalEvents,
    new_events_this_month: newEventsThisMonth,
    active_events: activeEvents,
    settlement_completion_rate: settlementRate,
  };
}
