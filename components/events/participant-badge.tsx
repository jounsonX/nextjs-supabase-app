import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import type { Profile, ParticipantStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface ParticipantBadgeProps {
  profile: Profile;
  status: ParticipantStatus;
  paymentDone?: boolean;
  showStatus?: boolean;
  showPayment?: boolean;
  className?: string;
}

function getInitials(profile: Profile): string {
  const name = profile.full_name ?? profile.username ?? "?";
  return name.charAt(0).toUpperCase();
}

export function ParticipantBadge({
  profile,
  status,
  paymentDone = false,
  showStatus = true,
  showPayment = false,
  className,
}: ParticipantBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={profile.avatar_url ?? undefined}
          alt={profile.full_name ?? ""}
        />
        <AvatarFallback className="text-xs">
          {getInitials(profile)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {profile.full_name ?? profile.username ?? "알 수 없음"}
      </span>
      {showStatus && <StatusBadge type="participant" status={status} />}
      {showPayment && (
        <span
          className={cn(
            "flex items-center gap-0.5 text-xs",
            paymentDone
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          )}
        >
          {paymentDone ? (
            <>
              <Check size={12} />
              납부
            </>
          ) : (
            <>
              <X size={12} />
              미납
            </>
          )}
        </span>
      )}
    </div>
  );
}
