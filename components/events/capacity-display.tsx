import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapacityDisplayProps {
  current: number;
  max: number | null;
  showBar?: boolean;
  className?: string;
}

export function CapacityDisplay({
  current,
  max,
  showBar = false,
  className,
}: CapacityDisplayProps) {
  const ratio = max ? current / max : 0;
  const isNearFull = max !== null && ratio >= 0.8;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className={cn(
          "flex items-center gap-1 text-sm",
          isNearFull
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground"
        )}
      >
        <Users size={14} />
        <span>
          {max !== null ? `${current}/${max}명` : `${current}명 (제한 없음)`}
        </span>
      </div>
      {showBar && max !== null && (
        <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isNearFull ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(ratio * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
