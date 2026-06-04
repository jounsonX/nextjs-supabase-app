"use server";

import type {
  EventFormState,
  ParticipationFormState,
  AnnouncementFormState,
  CarpoolFormState,
  CarpoolRequestFormState,
} from "@/types/database.types";

// TODO: Phase 3 — Supabase 쿼리 구현 (Task 008)

export async function getEvents() {
  return [];
}

export async function getEventById(_id: string) {
  return null;
}

export async function createEvent(
  _prevState: EventFormState,
  _formData: FormData
): Promise<EventFormState> {
  return { success: false, message: "미구현" };
}

export async function updateEvent(
  _id: string,
  _prevState: EventFormState,
  _formData: FormData
): Promise<EventFormState> {
  return { success: false, message: "미구현" };
}

export async function deleteEvent(_id: string): Promise<void> {}

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
