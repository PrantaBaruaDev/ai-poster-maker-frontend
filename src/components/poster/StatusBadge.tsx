import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PosterStatus } from "@/types/api";

const CONFIG: Record<PosterStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  GENERATING: {
    label: "Generating",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  COMPLETED: {
    label: "Ready",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

export function StatusBadge({ status }: { status: PosterStatus }) {
  const cfg = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}