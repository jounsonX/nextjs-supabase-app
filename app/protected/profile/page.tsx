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
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <UserIcon size="16" strokeWidth={2} />
          프로필 정보를 확인하고 수정할 수 있습니다.
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">내 프로필</h2>
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
