import { CalendarDays, Users, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "모임 생성 & 관리",
    description:
      "일정, 장소, 정원, 참가비를 한 곳에서 설정하고 모임 상태를 쉽게 관리하세요.",
  },
  {
    icon: Users,
    title: "참가자 관리",
    description:
      "참가 신청을 승인하거나 거절하고, 대기자를 자동으로 승급시킬 수 있습니다.",
  },
  {
    icon: Car,
    title: "카풀 & 정산",
    description:
      "카풀 등록과 동승 신청을 관리하고, 참가비를 자동으로 1/n 계산해 정산하세요.",
  },
];

export function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* 히어로 섹션 */}
      <section className="py-28 text-center">
        <Badge variant="secondary" className="mb-6">
          베타 서비스
        </Badge>
        <h1 className="mb-5 text-5xl font-bold tracking-tight">
          친목 모임, 이제 더 쉽게
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-xl leading-relaxed">
          5~20명 규모의 소규모 모임을 한 곳에서 관리하세요.
          <br />
          일정, 참가자, 카풀, 정산까지 모두 해결합니다.
        </p>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">주요 기능</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Icon size={24} />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
