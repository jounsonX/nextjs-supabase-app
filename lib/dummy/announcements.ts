import type { EventAnnouncement } from "@/types/database.types";
import { CURRENT_USER_ID } from "./users";

export const DUMMY_ANNOUNCEMENTS: EventAnnouncement[] = [
  // event-001: 강남 수영 모임 공지 2개
  {
    id: "ann-001-1",
    event_id: "event-001",
    author_id: CURRENT_USER_ID,
    title: "수영 모임 주의사항 안내",
    content:
      "수영복과 수영모는 필수 지참입니다. 개인 수건도 챙겨오세요. 물안경은 현장에서 대여 가능합니다. 모임 시작 10분 전까지 도착해 주세요!",
    is_pinned: true,
    created_at: "2026-05-21T09:00:00Z",
    updated_at: "2026-05-21T09:00:00Z",
  },
  {
    id: "ann-001-2",
    event_id: "event-001",
    author_id: CURRENT_USER_ID,
    title: "식사 장소 변경 안내",
    content:
      "수영 후 식사 장소가 '강남 뚝배기 식당'에서 '강남 해물탕 식당'으로 변경되었습니다. 지하철 2호선 강남역 5번 출구에서 도보 3분 거리입니다.",
    is_pinned: false,
    created_at: "2026-06-01T14:00:00Z",
    updated_at: "2026-06-01T14:00:00Z",
  },

  // event-002: 헬스 스터디 그룹 공지 1개
  {
    id: "ann-002-1",
    event_id: "event-002",
    author_id: CURRENT_USER_ID,
    title: "헬스장 방문 시 준비물",
    content:
      "운동화와 편한 운동복을 반드시 착용해 주세요. 수건과 물통은 개인 지참입니다. 헬스장 내 락커는 무료로 사용 가능합니다.",
    is_pinned: false,
    created_at: "2026-05-23T10:00:00Z",
    updated_at: "2026-05-23T10:00:00Z",
  },

  // event-004: 여름 등산 모임 공지 2개
  {
    id: "ann-004-1",
    event_id: "event-004",
    author_id: CURRENT_USER_ID,
    title: "등산 준비물 및 집합 안내",
    content:
      "등산화 또는 운동화, 등산 스틱(선택), 물 1.5L 이상, 도시락 지참해 주세요. 오전 7시 정각에 북한산 국립공원 북쪽 매표소 앞에서 출발합니다.",
    is_pinned: true,
    created_at: "2026-06-01T09:00:00Z",
    updated_at: "2026-06-01T09:00:00Z",
  },
  {
    id: "ann-004-2",
    event_id: "event-004",
    author_id: CURRENT_USER_ID,
    title: "날씨 예보 확인 요청",
    content:
      "당일 날씨 예보를 꼭 확인해 주세요. 우천 시 모임은 연기될 수 있습니다. 전날 저녁에 단체 채널로 최종 안내 드리겠습니다.",
    is_pinned: false,
    created_at: "2026-06-25T16:00:00Z",
    updated_at: "2026-06-25T16:00:00Z",
  },
];

export function getDummyAnnouncements(eventId: string): EventAnnouncement[] {
  const announcements = DUMMY_ANNOUNCEMENTS.filter(
    (a) => a.event_id === eventId
  );
  // 핀 고정 우선 정렬
  return announcements.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
