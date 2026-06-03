"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/protected/profile/actions";
import type { Profile, ProfileFormState } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  profile: Profile;
  className?: string;
}

const initialState: ProfileFormState = { success: false, message: "" };

export function ProfileForm({ profile, className }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필 편집</CardTitle>
          <CardDescription>공개 프로필 정보를 수정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="your_username"
                  defaultValue={profile.username ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="홍길동"
                  defaultValue={profile.full_name ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="avatar_url">프로필 사진 URL</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  defaultValue={profile.avatar_url ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={profile.website ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">소개</Label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="자기소개를 입력하세요"
                  defaultValue={profile.bio ?? ""}
                  className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {state.message && (
                <p
                  className={cn(
                    "text-sm",
                    state.success ? "text-green-600" : "text-red-500"
                  )}
                >
                  {state.message}
                </p>
              )}

              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "프로필 저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
