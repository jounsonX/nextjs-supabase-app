import type { EventParticipant } from "@/types/database.types";
import type { SettlementSummary } from "@/types/database.types";
import { CURRENT_USER_ID } from "./users";
import { getDummyEvent } from "./events";

export const DUMMY_PARTICIPANTS: EventParticipant[] = [
  // event-001: 강남 수영 모임 (6명)
  {
    id: "part-001-1",
    event_id: "event-001",
    user_id: CURRENT_USER_ID,
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-20T09:05:00Z",
  },
  {
    id: "part-001-2",
    event_id: "event-001",
    user_id: "user-mbr-001",
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-21T10:00:00Z",
  },
  {
    id: "part-001-3",
    event_id: "event-001",
    user_id: "user-mbr-002",
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-21T11:30:00Z",
  },
  {
    id: "part-001-4",
    event_id: "event-001",
    user_id: "user-mbr-003",
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-22T09:00:00Z",
  },
  {
    id: "part-001-5",
    event_id: "event-001",
    user_id: "user-mbr-004",
    status: "pending",
    payment_done: false,
    joined_at: "2026-05-23T14:00:00Z",
  },
  {
    id: "part-001-6",
    event_id: "event-001",
    user_id: "user-mbr-005",
    status: "waitlisted",
    payment_done: false,
    joined_at: "2026-05-24T16:00:00Z",
  },

  // event-002: 헬스 스터디 그룹 (4명)
  {
    id: "part-002-1",
    event_id: "event-002",
    user_id: CURRENT_USER_ID,
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-22T10:05:00Z",
  },
  {
    id: "part-002-2",
    event_id: "event-002",
    user_id: "user-mbr-002",
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-22T15:00:00Z",
  },
  {
    id: "part-002-3",
    event_id: "event-002",
    user_id: "user-mbr-006",
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-23T09:00:00Z",
  },
  {
    id: "part-002-4",
    event_id: "event-002",
    user_id: "user-mbr-003",
    status: "pending",
    payment_done: false,
    joined_at: "2026-05-24T11:00:00Z",
  },

  // event-003: 친구 소셜 번개 — closed (6명 모두 approved, 전원 납부)
  {
    id: "part-003-1",
    event_id: "event-003",
    user_id: "user-mbr-001",
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-10T11:05:00Z",
  },
  {
    id: "part-003-2",
    event_id: "event-003",
    user_id: CURRENT_USER_ID,
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-11T09:00:00Z",
  },
  {
    id: "part-003-3",
    event_id: "event-003",
    user_id: "user-mbr-004",
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-12T10:00:00Z",
  },
  {
    id: "part-003-4",
    event_id: "event-003",
    user_id: "user-mbr-005",
    status: "approved",
    payment_done: true,
    joined_at: "2026-05-13T14:00:00Z",
  },

  // event-004: 여름 등산 모임 (3명)
  {
    id: "part-004-1",
    event_id: "event-004",
    user_id: CURRENT_USER_ID,
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-25T14:05:00Z",
  },
  {
    id: "part-004-2",
    event_id: "event-004",
    user_id: "user-mbr-006",
    status: "approved",
    payment_done: false,
    joined_at: "2026-05-26T10:00:00Z",
  },
  {
    id: "part-004-3",
    event_id: "event-004",
    user_id: "user-mbr-003",
    status: "pending",
    payment_done: false,
    joined_at: "2026-05-27T09:00:00Z",
  },
];

export function getDummyParticipants(eventId: string): EventParticipant[] {
  return DUMMY_PARTICIPANTS.filter((p) => p.event_id === eventId);
}

export function getDummyApprovedCount(eventId: string): number {
  return DUMMY_PARTICIPANTS.filter(
    (p) => p.event_id === eventId && p.status === "approved"
  ).length;
}

export function getDummyMyStatus(
  eventId: string
): EventParticipant["status"] | null {
  const mine = DUMMY_PARTICIPANTS.find(
    (p) => p.event_id === eventId && p.user_id === CURRENT_USER_ID
  );
  return mine?.status ?? null;
}

export function getDummySettlement(eventId: string): SettlementSummary {
  const event = getDummyEvent(eventId);
  const participants = getDummyParticipants(eventId);
  const approved = participants.filter((p) => p.status === "approved");
  const paidCount = approved.filter((p) => p.payment_done).length;
  const totalCost = event?.cost ?? 0;
  const approvedCount = approved.length;
  const perPerson =
    approvedCount > 0 ? Math.ceil(totalCost / approvedCount) : 0;

  return {
    total_cost: totalCost,
    approved_count: approvedCount,
    per_person: perPerson,
    paid_count: paidCount,
    unpaid_count: approvedCount - paidCount,
  };
}

export function getDummyJoinedEvents() {
  const joinedEventIds = DUMMY_PARTICIPANTS.filter(
    (p) => p.user_id === CURRENT_USER_ID && p.status !== "cancelled"
  ).map((p) => p.event_id);

  return joinedEventIds;
}
