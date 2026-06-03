"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProfileUpdate, ProfileFormState } from "@/types/database.types";

export async function getProfile() {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`프로필 조회 실패: ${error.message}`);
  }

  return profile;
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  const updates: ProfileUpdate = {
    username: formData.get("username") as string | null,
    full_name: formData.get("full_name") as string | null,
    avatar_url: formData.get("avatar_url") as string | null,
    website: formData.get("website") as string | null,
    bio: formData.get("bio") as string | null,
  };

  for (const key of Object.keys(updates) as (keyof ProfileUpdate)[]) {
    if (updates[key] === "") {
      updates[key] = null;
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "이미 사용 중인 사용자 이름입니다." };
    }
    return { success: false, message: `오류가 발생했습니다: ${error.message}` };
  }

  revalidatePath("/protected/profile");
  return { success: true, message: "프로필이 성공적으로 저장됐습니다." };
}
