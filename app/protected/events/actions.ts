"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  EventFormState,
  EventStatus,
  ParticipationFormState,
  AnnouncementFormState,
  CarpoolFormState,
  CarpoolRequestFormState,
} from "@/types/database.types";

/** 내 모임 목록 조회 (호스팅 + 참여) */
export async function getEvents() {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 내가 호스팅하는 모임 (approved 참여자 수만 집계)
  const { data: hostedEvents, error: hostedError } = await supabase
    .from("events")
    .select("*, event_participants(count)")
    .eq("host_id", userId)
    .eq("event_participants.status", "approved")
    .order("created_at", { ascending: false });

  if (hostedError) {
    throw new Error(`호스팅 모임 조회 실패: ${hostedError.message}`);
  }

  // 내가 참여 신청한 event_id 목록
  const { data: participantRows, error: participantError } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", userId)
    .in("status", ["pending", "approved", "waitlisted"]);

  if (participantError) {
    throw new Error(`참여 모임 조회 실패: ${participantError.message}`);
  }

  const participantEventIds = (participantRows ?? []).map((r) => r.event_id);

  // 내가 참여 중인 모임 (호스팅 제외, approved 참여자 수만 집계)
  let joinedEvents: typeof hostedEvents = [];
  if (participantEventIds.length > 0) {
    const { data: joined, error: joinedError } = await supabase
      .from("events")
      .select("*, event_participants(count)")
      .in("id", participantEventIds)
      .neq("host_id", userId)
      .eq("event_participants.status", "approved")
      .order("created_at", { ascending: false });

    if (joinedError) {
      throw new Error(`참여 모임 상세 조회 실패: ${joinedError.message}`);
    }

    joinedEvents = joined ?? [];
  }

  return { hostedEvents: hostedEvents ?? [], joinedEvents };
}

/** 모임 생성 Server Action */
export async function createEvent(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 필수 필드 검증
  const title = (formData.get("title") as string | null)?.trim();
  if (!title) {
    return { success: false, message: "모임 제목은 필수입니다." };
  }

  // 선택 필드 파싱
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const location = (formData.get("location") as string | null)?.trim() || null;
  const eventDateRaw = formData.get("event_date") as string | null;
  const event_date = eventDateRaw?.trim() || null;
  const maxCapacityRaw = formData.get("max_capacity") as string | null;
  const max_capacity =
    maxCapacityRaw && maxCapacityRaw.trim() !== ""
      ? parseInt(maxCapacityRaw, 10)
      : null;
  const costRaw = formData.get("cost") as string | null;
  const cost = costRaw && costRaw.trim() !== "" ? parseInt(costRaw, 10) : 0;
  const statusRaw = formData.get("status") as string | null;
  const status: EventStatus =
    statusRaw === "draft" ||
    statusRaw === "open" ||
    statusRaw === "closed" ||
    statusRaw === "cancelled"
      ? statusRaw
      : "open";

  const { data: newEvent, error } = await supabase
    .from("events")
    .insert({
      host_id: userId,
      title,
      description,
      location,
      event_date,
      max_capacity,
      cost,
      status,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `모임 생성 실패: ${error.message}`,
    };
  }

  revalidatePath("/protected/events");
  revalidatePath("/protected");
  redirect(`/protected/events/${newEvent.id}`);
}

// ─── Task 009~010 스켈레톤 ────────────────────────────────────────────────────

export async function joinEvent(
  _prevState: ParticipationFormState,
  _formData: FormData
): Promise<ParticipationFormState> {
  return { success: false, message: "미구현" };
}

export async function cancelParticipation(
  _prevState: ParticipationFormState,
  _formData: FormData
): Promise<ParticipationFormState> {
  return { success: false, message: "미구현" };
}

export async function approveParticipant(
  _prevState: ParticipationFormState,
  _formData: FormData
): Promise<ParticipationFormState> {
  return { success: false, message: "미구현" };
}

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  _formData: FormData
): Promise<AnnouncementFormState> {
  return { success: false, message: "미구현" };
}

export async function deleteAnnouncement(_id: string): Promise<void> {}

export async function toggleAnnouncementPin(_id: string): Promise<void> {}

export async function togglePaymentDone(
  _participantId: string
): Promise<void> {}

export async function createCarpool(
  _prevState: CarpoolFormState,
  _formData: FormData
): Promise<CarpoolFormState> {
  return { success: false, message: "미구현" };
}

export async function requestCarpool(
  _prevState: CarpoolRequestFormState,
  _formData: FormData
): Promise<CarpoolRequestFormState> {
  return { success: false, message: "미구현" };
}
