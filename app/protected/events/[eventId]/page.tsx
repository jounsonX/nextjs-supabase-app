import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, DollarSign, Pin, Car, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/events/status-badge";
import { CapacityDisplay } from "@/components/events/capacity-display";
import { ParticipantBadge } from "@/components/events/participant-badge";
import { CarpoolRegisterButton } from "@/components/events/carpool-register-button";
import { AnnouncementActions } from "@/components/events/announcement-actions";
import { JoinButton } from "@/components/events/join-button";
import { ParticipantManageRow } from "@/components/events/participant-manage-row";
import { SettlementPaymentButton } from "@/components/events/settlement-payment-button";
import { CarpoolRequestButton } from "@/components/events/carpool-request-button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import {
  getEvent,
  getAnnouncements,
  getCarpools,
} from "@/app/protected/events/[eventId]/actions";
import type {
  EventAnnouncement,
  EventParticipant,
  Profile,
  ParticipantStatus,
} from "@/types/database.types";

type Props = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { key: "info", label: "정보" },
  { key: "announcements", label: "공지" },
  { key: "settlement", label: "정산" },
  { key: "carpool", label: "카풀" },
] as const;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "날짜 미정";
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { eventId } = await params;
  const { tab } = await searchParams;
  const activeTab = tab ?? "info";

  // 모임 데이터 조회
  const event = await getEvent(eventId);
  if (!event) notFound();

  // 현재 로그인 사용자 확인
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const currentUserId = claimsData?.claims?.sub ?? null;
  const isHost = currentUserId !== null && event.host_id === currentUserId;

  // ── 참여자 데이터 (실제 DB) ──────────────────────────────────────────────────
  const { data: participants } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .not("status", "in", '("cancelled","rejected")')
    .order("joined_at", { ascending: true });

  const allParticipants: EventParticipant[] = participants ?? [];
  const approvedParticipants = allParticipants.filter(
    (p) => p.status === "approved"
  );
  const approvedCount = approvedParticipants.length;

  // 현재 사용자의 참여 상태 및 ID
  const myParticipant = currentUserId
    ? (allParticipants.find((p) => p.user_id === currentUserId) ?? null)
    : null;
  const myStatus: ParticipantStatus | null = myParticipant?.status ?? null;

  // 참여자 프로필 일괄 조회
  const participantUserIds = allParticipants.map((p) => p.user_id);
  let profileMap: Record<string, Profile> = {};

  if (participantUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", participantUserIds);

    profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  }

  // ── 공지 데이터 (실제 DB) ────────────────────────────────────────────────────
  const announcements: EventAnnouncement[] = await getAnnouncements(eventId);

  // ── 카풀 데이터 (실제 DB) ────────────────────────────────────────────────────
  const carpools = await getCarpools(eventId);

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex flex-col gap-1 p-4 pb-2">
        <div className="flex items-center justify-between">
          <Link
            href="/protected/events"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← 모임 목록
          </Link>
          {isHost && (
            <Button asChild variant="ghost" size="icon" className="-mt-1 -mr-1">
              <Link href={`/protected/events/${eventId}/edit`}>
                <Pencil size={16} />
              </Link>
            </Button>
          )}
        </div>
        <h1 className="text-xl font-bold">
          {event.title}
          <span className="ml-2 inline-flex shrink-0 align-middle">
            <StatusBadge type="event" status={event.status} />
          </span>
        </h1>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="flex border-b px-4">
        {TABS.map(({ key, label }) => (
          <Link
            key={key}
            href={`?tab=${key}`}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-primary text-primary border-b-2"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {activeTab === "info" && (
          <InfoTab
            event={event}
            eventId={eventId}
            approvedCount={approvedCount}
            myStatus={myStatus}
            myParticipantId={myParticipant?.id}
            isHost={isHost}
            allParticipants={allParticipants}
            profileMap={profileMap}
          />
        )}
        {activeTab === "announcements" && (
          <AnnouncementsTab
            eventId={eventId}
            isHost={isHost}
            announcements={announcements}
          />
        )}
        {activeTab === "settlement" && (
          <SettlementTab
            eventId={eventId}
            isHost={isHost}
            eventCost={event.cost}
            approvedParticipants={approvedParticipants}
            profileMap={profileMap}
          />
        )}
        {activeTab === "carpool" && (
          <CarpoolTab
            eventId={eventId}
            isHost={isHost}
            myStatus={myStatus}
            carpools={carpools}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}

// ─── 정보 탭 ────────────────────────────────────────────────────────────────

function InfoTab({
  event,
  eventId,
  approvedCount,
  myStatus,
  myParticipantId,
  isHost,
  allParticipants,
  profileMap,
}: {
  event: {
    event_date: string | null;
    location: string | null;
    cost: number;
    max_capacity: number | null;
    description: string | null;
  };
  eventId: string;
  approvedCount: number;
  myStatus: ParticipantStatus | null;
  myParticipantId?: string;
  isHost: boolean;
  allParticipants: EventParticipant[];
  profileMap: Record<string, Profile>;
}) {
  const approvedList = allParticipants.filter((p) => p.status === "approved");
  const pendingList = allParticipants.filter((p) => p.status === "pending");
  const waitlistedList = allParticipants.filter(
    (p) => p.status === "waitlisted"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 모임 기본 정보 */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {event.event_date && (
            <div className="flex items-start gap-2">
              <Calendar
                size={16}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <span className="text-sm">{formatDate(event.event_date)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin
                size={16}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-muted-foreground shrink-0" />
            <span className="text-sm">
              {event.cost === 0
                ? "무료"
                : `${event.cost.toLocaleString("ko-KR")}원`}
            </span>
          </div>
          <CapacityDisplay
            current={approvedCount}
            max={event.max_capacity}
            showBar
          />
          {event.description && (
            <>
              <Separator />
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {event.description}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 비호스트: 참여 신청/취소 버튼 */}
      {!isHost && (
        <JoinButton
          eventId={eventId}
          myStatus={myStatus}
          participantId={myParticipantId}
        />
      )}

      {/* 승인된 참여자 목록 */}
      {approvedList.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">
            참여자 ({approvedCount}명)
          </h3>
          <div className="flex flex-col gap-2">
            {approvedList.slice(0, 5).map((p) => {
              const profile = profileMap[p.user_id];
              if (!profile) return null;
              // 호스트: 승인된 참여자에게도 거절 버튼 표시
              if (isHost) {
                return (
                  <ParticipantManageRow
                    key={p.id}
                    participantId={p.id}
                    profile={profile}
                    status={p.status}
                  />
                );
              }
              return (
                <ParticipantBadge
                  key={p.id}
                  profile={profile}
                  status={p.status}
                />
              );
            })}
            {approvedList.length > 5 && (
              <p className="text-muted-foreground text-sm">
                외 {approvedList.length - 5}명
              </p>
            )}
          </div>
        </div>
      )}

      {/* 호스트: 대기 신청자 관리 */}
      {isHost && pendingList.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">
            승인 대기 ({pendingList.length}명)
          </h3>
          <div className="flex flex-col gap-2">
            {pendingList.map((p) => {
              const profile = profileMap[p.user_id];
              if (!profile) return null;
              return (
                <ParticipantManageRow
                  key={p.id}
                  participantId={p.id}
                  profile={profile}
                  status={p.status}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 호스트: 대기자 목록 */}
      {isHost && waitlistedList.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">
            대기자 ({waitlistedList.length}명)
          </h3>
          <div className="flex flex-col gap-2">
            {waitlistedList.map((p) => {
              const profile = profileMap[p.user_id];
              if (!profile) return null;
              return (
                <ParticipantManageRow
                  key={p.id}
                  participantId={p.id}
                  profile={profile}
                  status={p.status}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 공지 탭 ────────────────────────────────────────────────────────────────

function AnnouncementsTab({
  eventId,
  isHost,
  announcements,
}: {
  eventId: string;
  isHost: boolean;
  announcements: EventAnnouncement[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {isHost && (
        <div className="flex justify-end">
          <Button asChild size="sm">
            <Link href={`/protected/events/${eventId}/announcements/new`}>
              + 공지 작성
            </Link>
          </Button>
        </div>
      )}
      {announcements.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 등록된 공지가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {ann.is_pinned && (
                      <Pin size={14} className="text-primary shrink-0" />
                    )}
                    <h4 className="text-sm font-semibold">{ann.title}</h4>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-muted-foreground text-xs">
                      {new Date(ann.created_at).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {/* 호스트 전용: 핀 토글 + 삭제 버튼 */}
                    {isHost && (
                      <AnnouncementActions
                        announcementId={ann.id}
                        isPinned={ann.is_pinned}
                      />
                    )}
                  </div>
                </div>
                <Separator className="my-2" />
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {ann.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 정산 탭 ────────────────────────────────────────────────────────────────

function SettlementTab({
  isHost,
  eventCost,
  approvedParticipants,
  profileMap,
}: {
  eventId: string;
  isHost: boolean;
  eventCost: number;
  approvedParticipants: EventParticipant[];
  profileMap: Record<string, Profile>;
}) {
  const approvedCount = approvedParticipants.length;
  const paidCount = approvedParticipants.filter((p) => p.payment_done).length;
  const perPerson =
    approvedCount > 0 ? Math.ceil(eventCost / approvedCount) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 정산 요약 */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-3 p-4 text-center">
          <div>
            <p className="text-muted-foreground text-xs">총 비용</p>
            <p className="mt-0.5 font-semibold">
              {eventCost.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">1인당</p>
            <p className="text-primary mt-0.5 text-lg font-bold">
              {perPerson.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">납부 현황</p>
            <p className="mt-0.5 font-semibold">
              {paidCount}/{approvedCount}명
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 참여자별 납부 현황 */}
      {approvedParticipants.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          승인된 참여자가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {approvedParticipants.map((p) => {
            const profile = profileMap[p.user_id];
            if (!profile) return null;
            return (
              <div key={p.id} className="flex items-center justify-between">
                <ParticipantBadge
                  profile={profile}
                  status={p.status}
                  paymentDone={p.payment_done}
                  showStatus={false}
                  showPayment
                />
                {isHost && (
                  <SettlementPaymentButton
                    participantId={p.id}
                    paymentDone={p.payment_done}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 카풀 탭 ────────────────────────────────────────────────────────────────

function CarpoolTab({
  eventId,
  isHost,
  myStatus,
  carpools,
  currentUserId,
}: {
  eventId: string;
  isHost: boolean;
  myStatus: ParticipantStatus | null;
  carpools: Array<{
    id: string;
    driver_id: string;
    departure: string;
    capacity: number;
    note: string | null;
    remaining_seats: number;
  }>;
  currentUserId: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {(isHost || myStatus === "approved") && (
          <CarpoolRegisterButton eventId={eventId} />
        )}
      </div>
      {carpools.length === 0 ? (
        <p className="text-muted-foreground text-sm">등록된 카풀이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {carpools.map((carpool) => (
            <Card key={carpool.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Car size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {carpool.departure}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        carpool.remaining_seats === 0
                          ? "text-muted-foreground line-through"
                          : "text-primary"
                      )}
                    >
                      잔여 {carpool.remaining_seats}석
                    </span>
                  </div>
                  {carpool.note && (
                    <p className="text-muted-foreground text-xs">
                      {carpool.note}
                    </p>
                  )}
                  {/* 드라이버 본인 또는 호스트가 드라이버인 경우 신청 버튼 숨김 */}
                  {currentUserId !== carpool.driver_id && (
                    <CarpoolRequestButton
                      carpoolId={carpool.id}
                      remainingSeats={carpool.remaining_seats}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
