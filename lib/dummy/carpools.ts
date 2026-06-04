import type { Carpool, CarpoolRequest } from "@/types/database.types";

export const DUMMY_CARPOOLS: Carpool[] = [
  {
    id: "carpool-001-1",
    event_id: "event-001",
    driver_id: "user-mbr-001",
    departure: "강남역 2번 출구",
    capacity: 3,
    note: "오전 9시 30분 출발 예정입니다.",
  },
  {
    id: "carpool-001-2",
    event_id: "event-001",
    driver_id: "user-mbr-002",
    departure: "선릉역 1번 출구",
    capacity: 2,
    note: null,
  },
  {
    id: "carpool-004-1",
    event_id: "event-004",
    driver_id: "user-mbr-006",
    departure: "구로디지털단지역 1번 출구",
    capacity: 4,
    note: "오전 6시 출발입니다. 시간 엄수 부탁드립니다.",
  },
];

export const DUMMY_CARPOOL_REQUESTS: CarpoolRequest[] = [
  // carpool-001-1 동승 신청
  {
    id: "creq-001-1-1",
    carpool_id: "carpool-001-1",
    passenger_id: "user-mbr-003",
    status: "accepted",
    requested_at: "2026-05-22T10:00:00Z",
  },
  {
    id: "creq-001-1-2",
    carpool_id: "carpool-001-1",
    passenger_id: "user-mbr-004",
    status: "pending",
    requested_at: "2026-05-23T15:00:00Z",
  },

  // carpool-004-1 동승 신청
  {
    id: "creq-004-1-1",
    carpool_id: "carpool-004-1",
    passenger_id: "user-mbr-003",
    status: "accepted",
    requested_at: "2026-05-26T11:00:00Z",
  },
];

export type CarpoolWithRequests = Carpool & {
  requests: CarpoolRequest[];
  remaining_seats: number;
};

export function getDummyCarpools(eventId: string): CarpoolWithRequests[] {
  const carpools = DUMMY_CARPOOLS.filter((c) => c.event_id === eventId);
  return carpools.map((c) => {
    const requests = DUMMY_CARPOOL_REQUESTS.filter(
      (r) => r.carpool_id === c.id
    );
    const acceptedCount = requests.filter(
      (r) => r.status === "accepted"
    ).length;
    return {
      ...c,
      requests,
      remaining_seats: c.capacity - acceptedCount,
    };
  });
}
