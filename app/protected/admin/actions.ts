"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminStats, Profile, UserRole } from "@/types/database.types";

// ─── Admin 권한 헬퍼 ──────────────────────────────────────────────────────────

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/protected");
  }

  return userId;
}

// ─── 통계 (F013) ──────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00Z`;

  const [totalResult, newResult, activeResult, participantsResult] =
    await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("event_participants")
        .select("payment_done")
        .eq("status", "approved"),
    ]);

  const total = totalResult.count ?? 0;
  const newThisMonth = newResult.count ?? 0;
  const active = activeResult.count ?? 0;

  const approved = participantsResult.data ?? [];
  const paid = approved.filter((p) => p.payment_done).length;
  const settlementRate =
    approved.length > 0 ? Math.round((paid / approved.length) * 100) : 0;

  return {
    total_events: total,
    new_events_this_month: newThisMonth,
    active_events: active,
    settlement_completion_rate: settlementRate,
  };
}

// ─── 사용자 관리 (F014) ───────────────────────────────────────────────────────

export async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, message: `역할 변경 실패: ${error.message}` };
  }

  revalidatePath("/protected/admin/users");
  return { success: true, message: "역할이 변경되었습니다." };
}

// ─── 모임 강제 관리 (F015) ────────────────────────────────────────────────────

export async function forceCloseEvent(
  eventId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from("events")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    return { success: false, message: `모임 마감 실패: ${error.message}` };
  }

  revalidatePath("/protected/admin/events");
  revalidatePath("/protected/events");
  return { success: true, message: "모임이 마감되었습니다." };
}

export async function forceCancelEvent(
  eventId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    return { success: false, message: `모임 취소 실패: ${error.message}` };
  }

  revalidatePath("/protected/admin/events");
  revalidatePath("/protected/events");
  return { success: true, message: "모임이 취소되었습니다." };
}

export async function forceDeleteEvent(
  eventId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, message: `모임 삭제 실패: ${error.message}` };
  }

  revalidatePath("/protected/admin/events");
  revalidatePath("/protected/events");
  return { success: true, message: "모임이 삭제되었습니다." };
}
