"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/app/protected/profile/actions";
import type { Profile, ProfileFormState } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ROLE_LABEL: Record<string, string> = {
  admin: "관리자",
  host: "호스트",
  member: "회원",
};

const ROLE_VARIANT: Record<string, BadgeProps["variant"]> = {
  admin: "destructive",
  host: "default",
  member: "secondary",
};

const initialState: ProfileFormState = { success: false, message: "" };

export function ProfileForm({ profile, className }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? "");

  const role = profile.role ?? "member";
  const roleLabel = ROLE_LABEL[role] ?? role;
  const roleVariant = ROLE_VARIANT[role] ?? "secondary";
  const fallback =
    (profile.username ?? profile.full_name ?? "?")[0]?.toUpperCase() ?? "?";

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
              {/* 아바타 미리보기 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview} alt="프로필 미리보기" />
                  <AvatarFallback className="text-lg">
                    {fallback}
                  </AvatarFallback>
                </Avatar>
                <div className="text-muted-foreground text-sm">
                  아래 URL을 입력하면 미리보기가 업데이트됩니다.
                </div>
              </div>

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
                  value={avatarPreview}
                  onChange={(e) => setAvatarPreview(e.target.value)}
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
                <Textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="자기소개를 입력하세요"
                  defaultValue={profile.bio ?? ""}
                />
              </div>

              {/* 계정 역할 (읽기 전용) */}
              <div className="grid gap-2">
                <Label>계정 역할</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={roleVariant}>{roleLabel}</Badge>
                  <span className="text-muted-foreground text-xs">
                    역할은 관리자에 의해 변경됩니다.
                  </span>
                </div>
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
