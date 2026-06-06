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

// ─── 유틸리티 ─────────────────────────────────────────────────────────────────

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

/** 모임의 현재 승인된 참여자 수 조회 */
async function getApprovedCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<number> {
  const { count } = await supabase
    .from("event_participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved");

  return count ?? 0;
}

// ─── 모임 수정/삭제 ────────────────────────────────────────────────────────────

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

// ─── 참여 관리 (F007 · F008) ──────────────────────────────────────────────────

/**
 * 참여 신청 Server Action (F007)
 * - 정원이 꽉 찬 경우 waitlisted 상태로 자동 처리
 * - 이미 신청한 경우 에러 반환
 */
export async function joinEvent(
  _prevState: ParticipationFormState,
  formData: FormData
): Promise<ParticipationFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const eventId = formData.get("event_id") as string | null;

  if (!eventId) {
    return { success: false, message: "모임 정보가 없습니다." };
  }

  // 모임 정보 조회 (정원, 상태 확인)
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, host_id, max_capacity, status")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  // 호스트는 본인 모임에 참여 신청 불가
  if (event.host_id === userId) {
    return {
      success: false,
      message: "본인이 주최하는 모임에는 참여 신청할 수 없습니다.",
    };
  }

  // 모집 중인 모임만 신청 가능
  if (event.status !== "open") {
    return { success: false, message: "현재 모집 중인 모임이 아닙니다." };
  }

  // 중복 신청 확인 (cancelled · rejected 제외)
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .in("status", ["pending", "approved", "waitlisted"])
    .maybeSingle();

  if (existing) {
    return { success: false, message: "이미 참여 신청한 모임입니다." };
  }

  // 정원 초과 여부 확인 → waitlisted 처리
  let participantStatus: "pending" | "waitlisted" = "pending";
  if (event.max_capacity !== null) {
    const approvedCount = await getApprovedCount(supabase, eventId);
    if (approvedCount >= event.max_capacity) {
      participantStatus = "waitlisted";
    }
  }

  const { error: insertError } = await supabase
    .from("event_participants")
    .insert({
      event_id: eventId,
      user_id: userId,
      status: participantStatus,
    });

  if (insertError) {
    return {
      success: false,
      message: `참여 신청 실패: ${insertError.message}`,
    };
  }

  revalidatePath(`/protected/events/${eventId}`);

  if (participantStatus === "waitlisted") {
    return {
      success: true,
      message: "정원이 초과되어 대기자 명단에 등록되었습니다.",
    };
  }

  return { success: true, message: "참여 신청이 완료되었습니다." };
}

/**
 * 참여 취소 Server Action (F007)
 * - 본인만 가능
 * - approved 상태였던 경우: waitlist 첫 번째 사람 자동 승급
 */
export async function cancelParticipation(
  _prevState: ParticipationFormState,
  formData: FormData
): Promise<ParticipationFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const participantId = formData.get("participant_id") as string | null;

  if (!participantId) {
    return { success: false, message: "참여 정보가 없습니다." };
  }

  // 본인 참여 기록 확인
  const { data: participant, error: fetchError } = await supabase
    .from("event_participants")
    .select("id, event_id, user_id, status")
    .eq("id", participantId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !participant) {
    return { success: false, message: "참여 정보를 찾을 수 없습니다." };
  }

  const wasApproved = participant.status === "approved";

  // 취소 처리
  const { error: cancelError } = await supabase
    .from("event_participants")
    .update({ status: "cancelled" })
    .eq("id", participantId);

  if (cancelError) {
    return {
      success: false,
      message: `참여 취소 실패: ${cancelError.message}`,
    };
  }

  // 승인 상태였던 경우: 대기자 자동 승급
  if (wasApproved) {
    await promoteFirstWaitlisted(supabase, participant.event_id);
  }

  revalidatePath(`/protected/events/${participant.event_id}`);
  return { success: true, message: "참여가 취소되었습니다." };
}

/**
 * 참여자 승인 Server Action (F008)
 * - 호스트만 가능
 * - 정원 초과 여부 재확인
 */
export async function approveParticipant(
  _prevState: ParticipationFormState,
  formData: FormData
): Promise<ParticipationFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const participantId = formData.get("participant_id") as string | null;

  if (!participantId) {
    return { success: false, message: "참여 정보가 없습니다." };
  }

  // 참여자 정보 + 모임 정보 조회
  const { data: participant, error: fetchError } = await supabase
    .from("event_participants")
    .select("id, event_id, status")
    .eq("id", participantId)
    .single();

  if (fetchError || !participant) {
    return { success: false, message: "참여 정보를 찾을 수 없습니다." };
  }

  // 호스트 권한 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id, max_capacity")
    .eq("id", participant.event_id)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { success: false, message: "참여자를 승인할 권한이 없습니다." };
  }

  // 정원 재확인
  if (event.max_capacity !== null) {
    const approvedCount = await getApprovedCount(
      supabase,
      participant.event_id
    );
    if (approvedCount >= event.max_capacity) {
      return {
        success: false,
        message: "정원이 초과되어 승인할 수 없습니다.",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ status: "approved" })
    .eq("id", participantId);

  if (updateError) {
    return {
      success: false,
      message: `승인 실패: ${updateError.message}`,
    };
  }

  revalidatePath(`/protected/events/${participant.event_id}`);
  return { success: true, message: "참여자가 승인되었습니다." };
}

/**
 * 참여자 거절 Server Action (F008)
 * - 호스트만 가능
 * - 승인 상태였던 경우 waitlist 자동 승급
 */
export async function rejectParticipant(
  _prevState: ParticipationFormState,
  formData: FormData
): Promise<ParticipationFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const participantId = formData.get("participant_id") as string | null;

  if (!participantId) {
    return { success: false, message: "참여 정보가 없습니다." };
  }

  // 참여자 정보 조회
  const { data: participant, error: fetchError } = await supabase
    .from("event_participants")
    .select("id, event_id, status")
    .eq("id", participantId)
    .single();

  if (fetchError || !participant) {
    return { success: false, message: "참여 정보를 찾을 수 없습니다." };
  }

  // 호스트 권한 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", participant.event_id)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { success: false, message: "참여자를 거절할 권한이 없습니다." };
  }

  const wasApproved = participant.status === "approved";

  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ status: "rejected" })
    .eq("id", participantId);

  if (updateError) {
    return {
      success: false,
      message: `거절 실패: ${updateError.message}`,
    };
  }

  // 승인 상태였던 참여자를 거절하는 경우 waitlist 자동 승급
  if (wasApproved) {
    await promoteFirstWaitlisted(supabase, participant.event_id);
  }

  revalidatePath(`/protected/events/${participant.event_id}`);
  return { success: true, message: "참여 신청이 거절되었습니다." };
}

/**
 * 대기자 목록 첫 번째 사람 자동 승급 유틸리티 (F008)
 * - joined_at 기준 가장 먼저 대기한 사람을 approved 로 변경
 */
async function promoteFirstWaitlisted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<void> {
  // 정원 확인
  const { data: event } = await supabase
    .from("events")
    .select("max_capacity")
    .eq("id", eventId)
    .single();

  // 정원 없는 모임은 waitlist 승급 불필요
  if (!event?.max_capacity) return;

  const approvedCount = await getApprovedCount(supabase, eventId);

  // 현재 승인된 인원이 정원 미만일 때만 승급
  if (approvedCount >= event.max_capacity) return;

  // 대기자 중 가장 먼저 신청한 사람 조회
  const { data: firstWaiting } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("status", "waitlisted")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstWaiting) return;

  await supabase
    .from("event_participants")
    .update({ status: "approved" })
    .eq("id", firstWaiting.id);
}

// ─── 참여자 조회 ──────────────────────────────────────────────────────────────

/**
 * 모임의 참여자 목록 조회 (profiles join 포함)
 */
export async function getParticipants(eventId: string) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: participants, error } = await supabase
    .from("event_participants")
    .select("*, profiles(id, username, full_name, avatar_url)")
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(`참여자 조회 실패: ${error.message}`);
  }

  return participants ?? [];
}

// ─── 공지 관리 (F005 · F006) ──────────────────────────────────────────────────

/**
 * 모임의 공지 목록 조회 (F006)
 * - 핀 고정 공지가 상단에 노출
 * - 같은 pin 상태 내에서는 최신순 정렬
 */
export async function getAnnouncements(eventId: string) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: announcements, error } = await supabase
    .from("event_announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("is_pinned", { ascending: false }) // 핀 고정 우선 (true > false)
    .order("created_at", { ascending: false }); // 최신순

  if (error) {
    throw new Error(`공지 조회 실패: ${error.message}`);
  }

  return announcements ?? [];
}

/**
 * 공지 작성 Server Action (F005)
 * - 호스트만 가능
 */
export async function createAnnouncement(
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const eventId = formData.get("event_id") as string | null;

  if (!eventId) {
    return { success: false, message: "모임 정보가 없습니다." };
  }

  // 호스트 권한 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { success: false, message: "공지를 작성할 권한이 없습니다." };
  }

  // 필드 검증
  const title = (formData.get("title") as string | null)?.trim();
  const content = (formData.get("content") as string | null)?.trim();

  if (!title) {
    return { success: false, message: "공지 제목은 필수입니다." };
  }
  if (!content) {
    return { success: false, message: "공지 내용은 필수입니다." };
  }

  // 체크박스: "on"이면 true, 없으면 false
  const is_pinned = formData.get("is_pinned") === "on";

  const { error: insertError } = await supabase
    .from("event_announcements")
    .insert({
      event_id: eventId,
      author_id: userId,
      title,
      content,
      is_pinned,
    });

  if (insertError) {
    return {
      success: false,
      message: `공지 작성 실패: ${insertError.message}`,
    };
  }

  revalidatePath(`/protected/events/${eventId}`);
  redirect(`/protected/events/${eventId}?tab=announcements`);
}

/**
 * 공지 삭제 Server Action (F005)
 * - 호스트 또는 작성자만 가능 (RLS로도 보호)
 */
export async function deleteAnnouncement(
  announcementId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 공지 정보 조회 (모임 호스트 확인을 위해 event_id 포함)
  const { data: announcement, error: fetchError } = await supabase
    .from("event_announcements")
    .select("id, event_id, author_id")
    .eq("id", announcementId)
    .single();

  if (fetchError || !announcement) {
    return { success: false, message: "공지를 찾을 수 없습니다." };
  }

  // 작성자 또는 호스트 권한 검증
  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", announcement.event_id)
    .single();

  const isAuthor = announcement.author_id === userId;
  const isHost = event?.host_id === userId;

  if (!isAuthor && !isHost) {
    return { success: false, message: "공지를 삭제할 권한이 없습니다." };
  }

  const { error: deleteError } = await supabase
    .from("event_announcements")
    .delete()
    .eq("id", announcementId);

  if (deleteError) {
    return {
      success: false,
      message: `공지 삭제 실패: ${deleteError.message}`,
    };
  }

  revalidatePath(`/protected/events/${announcement.event_id}`);
  return { success: true, message: "공지가 삭제되었습니다." };
}

/**
 * 공지 핀 고정/해제 토글 Server Action (F006)
 * - 호스트만 가능
 */
export async function togglePin(
  announcementId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 공지 조회
  const { data: announcement, error: fetchError } = await supabase
    .from("event_announcements")
    .select("id, event_id, is_pinned")
    .eq("id", announcementId)
    .single();

  if (fetchError || !announcement) {
    return { success: false, message: "공지를 찾을 수 없습니다." };
  }

  // 호스트 권한 검증
  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", announcement.event_id)
    .single();

  if (event?.host_id !== userId) {
    return { success: false, message: "핀을 변경할 권한이 없습니다." };
  }

  const newPinState = !announcement.is_pinned;

  const { error: updateError } = await supabase
    .from("event_announcements")
    .update({
      is_pinned: newPinState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", announcementId);

  if (updateError) {
    return {
      success: false,
      message: `핀 변경 실패: ${updateError.message}`,
    };
  }

  revalidatePath(`/protected/events/${announcement.event_id}`);
  return {
    success: true,
    message: newPinState ? "공지가 고정되었습니다." : "핀이 해제되었습니다.",
  };
}

// ─── 정산 관리 (F009) ────────────────────────────────────────────────────────

/**
 * 참여자 납부 상태 토글 Server Action (F009)
 * - 호스트만 가능
 */
export async function togglePayment(
  participantId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  // 참여자 정보 조회 (event_id 포함)
  const { data: participant, error: fetchError } = await supabase
    .from("event_participants")
    .select("id, event_id, payment_done")
    .eq("id", participantId)
    .single();

  if (fetchError || !participant) {
    return { success: false, message: "참여자 정보를 찾을 수 없습니다." };
  }

  // 호스트 권한 검증
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", participant.event_id)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  if (event.host_id !== userId) {
    return { success: false, message: "납부 상태를 변경할 권한이 없습니다." };
  }

  const newPaymentState = !participant.payment_done;

  const { error: updateError } = await supabase
    .from("event_participants")
    .update({ payment_done: newPaymentState })
    .eq("id", participantId);

  if (updateError) {
    return {
      success: false,
      message: `납부 상태 변경 실패: ${updateError.message}`,
    };
  }

  revalidatePath(`/protected/events/${participant.event_id}`);
  return {
    success: true,
    message: newPaymentState
      ? "납부 완료로 표시되었습니다."
      : "납부 취소되었습니다.",
  };
}

// ─── 카풀 관리 (F010) ────────────────────────────────────────────────────────

/**
 * 모임의 카풀 목록 조회 (carpool_requests join 포함)
 */
export async function getCarpools(eventId: string) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: carpools, error } = await supabase
    .from("carpools")
    .select("*, carpool_requests(id, status, passenger_id)")
    .eq("event_id", eventId)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`카풀 조회 실패: ${error.message}`);
  }

  // 잔여 좌석 계산
  return (carpools ?? []).map((carpool) => {
    const requests = carpool.carpool_requests ?? [];
    const acceptedCount = requests.filter(
      (r: { status: string }) => r.status === "accepted"
    ).length;
    return {
      ...carpool,
      remaining_seats: carpool.capacity - acceptedCount,
    };
  });
}

/**
 * 카풀 등록 Server Action (F010)
 * - 호스트 또는 승인된 참여자만 가능
 */
export async function createCarpool(
  _prevState: CarpoolFormState,
  formData: FormData
): Promise<CarpoolFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const eventId = formData.get("event_id") as string | null;

  if (!eventId) {
    return { success: false, message: "모임 정보가 없습니다." };
  }

  // 필수 필드 검증
  const departure = (formData.get("departure") as string | null)?.trim();
  if (!departure) {
    return { success: false, message: "출발지는 필수입니다." };
  }

  const capacityRaw = formData.get("capacity") as string | null;
  const capacity =
    capacityRaw && capacityRaw.trim() !== "" ? parseInt(capacityRaw, 10) : 0;

  if (!capacity || capacity < 1) {
    return { success: false, message: "좌석 수는 1 이상이어야 합니다." };
  }

  const note = (formData.get("note") as string | null)?.trim() || null;

  // 권한 검증: 호스트 또는 승인된 참여자
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, message: "모임을 찾을 수 없습니다." };
  }

  const isHost = event.host_id === userId;

  if (!isHost) {
    // 승인된 참여자 여부 확인
    const { data: participant } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();

    if (!participant) {
      return { success: false, message: "카풀을 등록할 권한이 없습니다." };
    }
  }

  const { error: insertError } = await supabase.from("carpools").insert({
    event_id: eventId,
    driver_id: userId,
    departure,
    capacity,
    note,
  });

  if (insertError) {
    return {
      success: false,
      message: `카풀 등록 실패: ${insertError.message}`,
    };
  }

  revalidatePath(`/protected/events/${eventId}`);
  redirect(`/protected/events/${eventId}?tab=carpool`);
}

/**
 * 카풀 동승 신청 Server Action (F010)
 * - 선착순 즉시 accepted 처리
 * - 좌석 초과 시 거절
 * - 드라이버 본인 신청 불가
 */
export async function requestCarpool(
  _prevState: CarpoolRequestFormState,
  formData: FormData
): Promise<CarpoolRequestFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;
  const carpoolId = formData.get("carpool_id") as string | null;

  if (!carpoolId) {
    return { success: false, message: "카풀 정보가 없습니다." };
  }

  // 카풀 정보 조회
  const { data: carpool, error: carpoolError } = await supabase
    .from("carpools")
    .select("id, event_id, driver_id, capacity")
    .eq("id", carpoolId)
    .single();

  if (carpoolError || !carpool) {
    return { success: false, message: "카풀 정보를 찾을 수 없습니다." };
  }

  // 드라이버 본인 신청 방지
  if (carpool.driver_id === userId) {
    return {
      success: false,
      message: "본인이 등록한 카풀에는 신청할 수 없습니다.",
    };
  }

  // 현재 accepted 건수 집계 → 잔여 좌석 확인
  const { count: acceptedCount } = await supabase
    .from("carpool_requests")
    .select("*", { count: "exact", head: true })
    .eq("carpool_id", carpoolId)
    .eq("status", "accepted");

  const remaining = carpool.capacity - (acceptedCount ?? 0);

  if (remaining <= 0) {
    return { success: false, message: "자리가 없습니다." };
  }

  // 중복 신청 확인 (pending/accepted 상태)
  const { data: existing } = await supabase
    .from("carpool_requests")
    .select("id")
    .eq("carpool_id", carpoolId)
    .eq("passenger_id", userId)
    .in("status", ["pending", "accepted"])
    .maybeSingle();

  if (existing) {
    return { success: false, message: "이미 동승 신청한 카풀입니다." };
  }

  const { error: insertError } = await supabase
    .from("carpool_requests")
    .insert({
      carpool_id: carpoolId,
      passenger_id: userId,
      status: "accepted",
    });

  if (insertError) {
    return {
      success: false,
      message: `동승 신청 실패: ${insertError.message}`,
    };
  }

  revalidatePath(`/protected/events/${carpool.event_id}`);
  return { success: true, message: "동승 신청이 완료되었습니다." };
}
