import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProtectedHomePage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 주최한 모임</h2>
          <Button asChild size="sm">
            <Link href="/protected/events/new">+ 새 모임</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              아직 주최한 모임이 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              새 모임을 만들어 친구들을 초대해 보세요.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">내가 참여한 모임</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/protected/events">모임 목록 보기</Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">
              아직 참여한 모임이 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              모임 목록에서 참여하고 싶은 모임을 찾아보세요.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
