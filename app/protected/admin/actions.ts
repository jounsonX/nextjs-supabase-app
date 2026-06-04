"use server";

import type { AdminStats } from "@/types/database.types";

// TODO: Phase 3 — Supabase 집계 쿼리 구현 (Task 011)

export async function getAdminStats(): Promise<AdminStats> {
  return {
    total_events: 0,
    new_events_this_month: 0,
    active_events: 0,
    settlement_completion_rate: 0,
  };
}

export async function getUsers() {
  return [];
}

export async function updateUserRole(
  _userId: string,
  _role: "admin" | "host" | "member"
): Promise<void> {}

export async function forceCloseEvent(_eventId: string): Promise<void> {}

export async function forceCancelEvent(_eventId: string): Promise<void> {}

export async function forceDeleteEvent(_eventId: string): Promise<void> {}
