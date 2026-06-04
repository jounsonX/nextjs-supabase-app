"use server";

// Task 008 — 모임 CRUD
export async function getEvent(_eventId: string) {
  return null;
}

export async function updateEvent(
  _eventId: string,
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function deleteEvent(_eventId: string): Promise<void> {}

// Task 009 — 참여자 관리
export async function joinEvent(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function cancelParticipation(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function approveParticipant(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function rejectParticipant(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

// Task 009 — 공지 관리
export async function createAnnouncement(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function deleteAnnouncement(
  _announcementId: string
): Promise<void> {}

export async function togglePin(_announcementId: string): Promise<void> {}

// Task 010 — 정산 관리
export async function togglePayment(_participantId: string): Promise<void> {}

// Task 010 — 카풀 관리
export async function createCarpool(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}

export async function requestCarpool(
  _prevState: unknown,
  _formData: FormData
): Promise<{ success: boolean; message: string }> {
  return { success: false, message: "미구현" };
}
