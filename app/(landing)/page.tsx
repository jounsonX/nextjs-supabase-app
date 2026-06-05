import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export default async function HomePage() {
  // 매 요청마다 새 클라이언트 생성 (전역 변수 사용 금지)
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // 로그인된 사용자는 앱으로 리다이렉트
  if (data?.claims) {
    redirect("/protected");
  }

  return <LandingPage />;
}
