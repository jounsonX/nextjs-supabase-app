import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, DollarSign, Pin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/events/status-badge";
import { CapacityDisplay } from "@/components/events/capacity-display";
import { ParticipantBadge } from "@/components/events/participant-badge";
import { cn } from "@/lib/utils";
import {
  getDummyEvent,
  getDummyParticipants,
  getDummyAnnouncements,
  getDummyCarpools,
  getDummySettlement,
  getDummyMyStatus,
  getDummyApprovedCount,
  getDummyUser,
  CURRENT_USER_ID,
} from "@/lib/dummy";

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

  const event = getDummyEvent(eventId);
  if (!event) notFound();

  const isHost = event.host_id === CURRENT_USER_ID;
  const myStatus = getDummyMyStatus(eventId);
  const approvedCount = getDummyApprovedCount(eventId);

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex flex-col gap-1">
          <Link
            href="/protected/events"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← 모임 목록
          </Link>
          <h1 className="text-xl font-bold">{event.title}</h1>
          <StatusBadge type="event" status={event.status} />
        </div>
        {isHost && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/protected/events/${eventId}/edit`}>수정</Link>
          </Button>
        )}
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
            isHost={isHost}
          />
        )}
        {activeTab === "announcements" && (
          <AnnouncementsTab eventId={eventId} isHost={isHost} />
        )}
        {activeTab === "settlement" && (
          <SettlementTab eventId={eventId} isHost={isHost} />
        )}
        {activeTab === "carpool" && <CarpoolTab eventId={eventId} />}
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
  isHost,
}: {
  event: ReturnType<typeof getDummyEvent> & object;
  eventId: string;
  approvedCount: number;
  myStatus: ReturnType<typeof getDummyMyStatus>;
  isHost: boolean;
}) {
  const participants = getDummyParticipants(eventId);
  const approved = participants.filter((p) => p.status === "approved");

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

      {/* 참여 신청 버튼 */}
      {!isHost && (
        <div>
          {myStatus === null && (
            <Button className="w-full" disabled>
              참여 신청 (Phase 3 연결 예정)
            </Button>
          )}
          {myStatus === "pending" && (
            <Button className="w-full" variant="outline" disabled>
              신청 취소 (승인 대기 중)
            </Button>
          )}
          {myStatus === "approved" && (
            <Button className="w-full" variant="secondary" disabled>
              참여 중 (취소: Phase 3 연결 예정)
            </Button>
          )}
          {myStatus === "waitlisted" && (
            <Button className="w-full" variant="outline" disabled>
              대기자 등록됨
            </Button>
          )}
        </div>
      )}

      {/* 참여자 목록 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          참여자 ({approvedCount}명)
        </h3>
        {approved.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아직 승인된 참여자가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {approved.slice(0, 5).map((p) => {
              const profile = getDummyUser(p.user_id);
              if (!profile) return null;
              return (
                <ParticipantBadge
                  key={p.id}
                  profile={profile}
                  status={p.status}
                />
              );
            })}
            {approved.length > 5 && (
              <p className="text-muted-foreground text-sm">
                외 {approved.length - 5}명
              </p>
            )}
          </div>
        )}
      </div>

      {/* 호스트: 신청자 관리 */}
      {isHost &&
        (() => {
          const pending = participants.filter((p) => p.status === "pending");
          if (pending.length === 0) return null;
          return (
            <div>
              <h3 className="mb-2 text-sm font-semibold">
                승인 대기 ({pending.length}명)
              </h3>
              <div className="flex flex-col gap-2">
                {pending.map((p) => {
                  const profile = getDummyUser(p.user_id);
                  if (!profile) return null;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between"
                    >
                      <ParticipantBadge profile={profile} status={p.status} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          disabled
                        >
                          거절
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

// ─── 공지 탭 ────────────────────────────────────────────────────────────────

function AnnouncementsTab({
  eventId,
  isHost,
}: {
  eventId: string;
  isHost: boolean;
}) {
  const announcements = getDummyAnnouncements(eventId);

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
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {new Date(ann.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
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
  eventId,
  isHost,
}: {
  eventId: string;
  isHost: boolean;
}) {
  const settlement = getDummySettlement(eventId);
  const participants = getDummyParticipants(eventId).filter(
    (p) => p.status === "approved"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 정산 요약 */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-3 p-4 text-center">
          <div>
            <p className="text-muted-foreground text-xs">총 비용</p>
            <p className="mt-0.5 font-semibold">
              {settlement.total_cost.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">1인당</p>
            <p className="text-primary mt-0.5 text-lg font-bold">
              {settlement.per_person.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">납부 현황</p>
            <p className="mt-0.5 font-semibold">
              {settlement.paid_count}/{settlement.approved_count}명
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 참여자별 납부 현황 */}
      {participants.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          승인된 참여자가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {participants.map((p) => {
            const profile = getDummyUser(p.user_id);
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled
                  >
                    {p.payment_done ? "납부 취소" : "납부 확인"}
                  </Button>
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

function CarpoolTab({ eventId }: { eventId: string }) {
  const carpools = getDummyCarpools(eventId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" disabled>
          + 카풀 등록 (Phase 3 연결 예정)
        </Button>
      </div>
      {carpools.length === 0 ? (
        <p className="text-muted-foreground text-sm">등록된 카풀이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {carpools.map((carpool) => {
            const driver = getDummyUser(carpool.driver_id);
            return (
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
                    {driver && (
                      <ParticipantBadge
                        profile={driver}
                        status="approved"
                        showStatus={false}
                      />
                    )}
                    {carpool.note && (
                      <p className="text-muted-foreground text-xs">
                        {carpool.note}
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 w-full"
                      disabled={carpool.remaining_seats === 0}
                    >
                      {carpool.remaining_seats === 0
                        ? "자리 없음"
                        : "동승 신청 (Phase 3 연결 예정)"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
