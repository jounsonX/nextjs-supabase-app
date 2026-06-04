export type UserRole = "admin" | "host" | "member";

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<Profile, "username" | "full_name" | "avatar_url" | "website" | "bio">
>;

export type ProfileFormState = {
  success: boolean;
  message: string;
};

// ─── Event ───────────────────────────────────────────────────────────────────

export type EventStatus = "draft" | "open" | "closed" | "cancelled";

export type Event = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  max_capacity: number | null;
  cost: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
};

export type EventInsert = Omit<Event, "id" | "created_at" | "updated_at">;
export type EventUpdate = Partial<
  Omit<Event, "id" | "host_id" | "created_at" | "updated_at">
>;

// ─── EventParticipant ────────────────────────────────────────────────────────

export type ParticipantStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "cancelled";

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  payment_done: boolean;
  joined_at: string;
};

export type EventParticipantInsert = Omit<EventParticipant, "id" | "joined_at">;
export type EventParticipantUpdate = Partial<
  Pick<EventParticipant, "status" | "payment_done">
>;

// ─── EventAnnouncement ───────────────────────────────────────────────────────

export type EventAnnouncement = {
  id: string;
  event_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type EventAnnouncementInsert = Omit<
  EventAnnouncement,
  "id" | "created_at" | "updated_at"
>;
export type EventAnnouncementUpdate = Partial<
  Pick<EventAnnouncement, "title" | "content" | "is_pinned">
>;

// ─── Carpool ─────────────────────────────────────────────────────────────────

export type Carpool = {
  id: string;
  event_id: string;
  driver_id: string;
  departure: string;
  capacity: number;
  note: string | null;
};

export type CarpoolInsert = Omit<Carpool, "id">;
export type CarpoolUpdate = Partial<
  Pick<Carpool, "departure" | "capacity" | "note">
>;

// ─── CarpoolRequest ──────────────────────────────────────────────────────────

export type CarpoolRequestStatus = "pending" | "accepted" | "rejected";

export type CarpoolRequest = {
  id: string;
  carpool_id: string;
  passenger_id: string;
  status: CarpoolRequestStatus;
  requested_at: string;
};

export type CarpoolRequestInsert = Omit<CarpoolRequest, "id" | "requested_at">;
export type CarpoolRequestUpdate = Partial<Pick<CarpoolRequest, "status">>;

// ─── Server Action Form States ───────────────────────────────────────────────

export type EventFormState = {
  success: boolean;
  message: string;
  eventId?: string;
};

export type ParticipationFormState = {
  success: boolean;
  message: string;
};

export type AnnouncementFormState = {
  success: boolean;
  message: string;
};

export type CarpoolFormState = {
  success: boolean;
  message: string;
};

export type CarpoolRequestFormState = {
  success: boolean;
  message: string;
};

// ─── Derived / Aggregate Types ───────────────────────────────────────────────

export type SettlementSummary = {
  total_cost: number;
  approved_count: number;
  per_person: number;
  paid_count: number;
  unpaid_count: number;
};

export type CarpoolWithRequests = Carpool & {
  requests: CarpoolRequest[];
  remaining_seats: number;
};

export type AdminStats = {
  total_events: number;
  new_events_this_month: number;
  active_events: number;
  settlement_completion_rate: number;
};
