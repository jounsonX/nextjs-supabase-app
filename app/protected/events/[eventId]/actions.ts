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

/** 특정 모임 상세 조회 */
export async function getEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    return null;
  }

  return event;
}

/** 모임 수정 Server Action */
export async function updateEvent(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 권한 확인: 호스트 여부 검증
  const { data: existing, error: fetchError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (fetchError || !existing) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (existing.host_id !== userId) {
    return { success: false, message: "모임을 수정할 권한이 없습니다." };
  }

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

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      location,
      event_date,
      max_capacity,
      cost,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) {
    return {
      success: false,
      message: `모임 수정 실패: ${error.message}`,
    };
  }

  revalidatePath(`/protected/events/${eventId}`);
  revalidatePath("/protected/events");
  revalidatePath("/protected");
  redirect(`/protected/events/${eventId}`);
}

/** 모임 삭제 Server Action */
export async function deleteEvent(eventId: string): Promise<void> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 권한 확인: 호스트 여부 검증
  const { data: existing, error: fetchError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (fetchError || !existing) {
    throw new Error("모임을 찾을 수 없습니다.");
  }

  if (existing.host_id !== userId) {
    throw new Error("모임을 삭제할 권한이 없습니다.");
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error(`모임 삭제 실패: ${error.message}`);
  }

  revalidatePath("/protected/events");
  revalidatePath("/protected");
  redirect("/protected/events");
}

// ─── Task 009 스켈레톤: 참여자 관리 ──────────────────────────────────────────

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

export async function rejectParticipant(
  _prevState: ParticipationFormState,
  _formData: FormData
): Promise<ParticipationFormState> {
  return { success: false, message: "미구현" };
}

// ─── Task 009 스켈레톤: 공지 관리 ────────────────────────────────────────────

export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  _formData: FormData
): Promise<AnnouncementFormState> {
  return { success: false, message: "미구현" };
}

export async function deleteAnnouncement(
  _announcementId: string
): Promise<void> {}

export async function togglePin(_announcementId: string): Promise<void> {}

// ─── Task 010 스켈레톤: 정산 및 카풀 관리 ────────────────────────────────────

export async function togglePayment(_participantId: string): Promise<void> {}

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
