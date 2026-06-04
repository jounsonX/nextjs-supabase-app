import type { Event } from "@/types/database.types";
import { CURRENT_USER_ID } from "./users";

export const DUMMY_EVENTS: Event[] = [
  {
    id: "event-001",
    host_id: CURRENT_USER_ID,
    title: "강남 수영 모임",
    description:
      "강남 스포츠센터에서 함께 수영해요! 초보자도 환영합니다. 수영 후 근처 식당에서 식사도 함께 할 예정입니다.",
    location: "강남 스포츠센터 수영장",
    event_date: "2026-06-15T10:00:00Z",
    max_capacity: 15,
    cost: 30000,
    status: "open",
    created_at: "2026-05-20T09:00:00Z",
    updated_at: "2026-05-20T09:00:00Z",
  },
  {
    id: "event-002",
    host_id: CURRENT_USER_ID,
    title: "헬스 스터디 그룹",
    description:
      "매주 함께 운동하는 헬스 스터디 그룹입니다. 운동 루틴 공유 및 서로 동기부여해요.",
    location: "선릉 헬스클럽",
    event_date: "2026-06-20T18:00:00Z",
    max_capacity: 10,
    cost: 20000,
    status: "open",
    created_at: "2026-05-22T10:00:00Z",
    updated_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "event-003",
    host_id: "user-mbr-001",
    title: "친구 소셜 번개",
    description: "오랜만에 친구들과 만나 맛집 탐방하고 카페에서 수다 떨어요!",
    location: "홍대 맛집 거리",
    event_date: "2026-05-30T17:00:00Z",
    max_capacity: 8,
    cost: 0,
    status: "closed",
    created_at: "2026-05-10T11:00:00Z",
    updated_at: "2026-05-28T09:00:00Z",
  },
  {
    id: "event-004",
    host_id: CURRENT_USER_ID,
    title: "여름 등산 모임",
    description:
      "북한산 등산 모임입니다. 초보자 코스로 진행하며 정상에서 도시락을 먹을 예정입니다.",
    location: "북한산 국립공원 북쪽 매표소",
    event_date: "2026-07-05T07:00:00Z",
    max_capacity: 20,
    cost: 15000,
    status: "open",
    created_at: "2026-05-25T14:00:00Z",
    updated_at: "2026-05-25T14:00:00Z",
  },
  {
    id: "event-005",
    host_id: "user-mbr-001",
    title: "보드게임 파티",
    description: "다양한 보드게임을 즐기는 파티입니다. 카페에서 진행됩니다.",
    location: "신촌 보드게임 카페",
    event_date: "2026-05-10T14:00:00Z",
    max_capacity: 12,
    cost: 10000,
    status: "cancelled",
    created_at: "2026-04-20T16:00:00Z",
    updated_at: "2026-05-05T10:00:00Z",
  },
];

export function getDummyEvent(id: string): Event | null {
  return DUMMY_EVENTS.find((e) => e.id === id) ?? null;
}

export function getDummyHostedEvents(): Event[] {
  return DUMMY_EVENTS.filter((e) => e.host_id === CURRENT_USER_ID);
}
