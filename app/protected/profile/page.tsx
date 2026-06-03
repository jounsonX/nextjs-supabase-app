import { Suspense } from "react";
import { getProfile } from "./actions";
import { ProfileForm } from "@/components/profile-form";
import { UserIcon } from "lucide-react";

async function ProfileContent() {
  const profile = await getProfile();
  return <ProfileForm profile={profile} />;
}

export default function ProfilePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
          <UserIcon size="16" strokeWidth={2} />
          프로필 정보를 확인하고 수정할 수 있습니다.
        </div>
      </div>

      <div className="flex flex-col items-start gap-2">
        <h2 className="mb-4 text-2xl font-bold">내 프로필</h2>
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            }
          >
            <ProfileContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
