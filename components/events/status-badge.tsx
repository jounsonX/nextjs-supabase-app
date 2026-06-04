import { Badge } from "@/components/ui/badge";
import type { EventStatus, ParticipantStatus } from "@/types/database.types";

type EventStatusBadgeProps = { type: "event"; status: EventStatus };
type ParticipantStatusBadgeProps = {
  type: "participant";
  status: ParticipantStatus;
};
type StatusBadgeProps = EventStatusBadgeProps | ParticipantStatusBadgeProps;

const EVENT_STATUS_MAP: Record<
  EventStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  open: { label: "모집 중", variant: "default" },
  closed: { label: "마감", variant: "secondary" },
  draft: { label: "초안", variant: "outline" },
  cancelled: { label: "취소됨", variant: "destructive" },
};

const PARTICIPANT_STATUS_MAP: Record<
  ParticipantStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  approved: { label: "승인", variant: "default" },
  pending: { label: "대기", variant: "secondary" },
  waitlisted: { label: "대기자", variant: "outline" },
  rejected: { label: "거절", variant: "destructive" },
  cancelled: { label: "취소", variant: "destructive" },
};

export function StatusBadge(props: StatusBadgeProps) {
  const map =
    props.type === "event" ? EVENT_STATUS_MAP : PARTICIPANT_STATUS_MAP;
  const { label, variant } = map[props.status as keyof typeof map];

  return <Badge variant={variant}>{label}</Badge>;
}
