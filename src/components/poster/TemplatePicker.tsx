"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplates } from "@/hooks/useTemplates";
import type { OccasionType, TemplateListItem } from "@/types/api";

const OCCASION_LABELS: Record<OccasionType, string> = {
  VICTORY: "বিজয় দিবস",
  MOURNING: "শোক / স্মরণ",
  CAMPAIGN: "নির্বাচনী প্রচার",
  GREETINGS: "শুভেচ্ছা",
  FESTIVAL: "ঈদ / উৎসব",
};

interface Props {
  value: string | null;
  onChange: (template: TemplateListItem) => void;
}

export function TemplatePicker({ value, onChange }: Props) {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!templates?.length) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No templates available. Ask an admin to seed some.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {templates.map((t) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl border-2 bg-card text-left transition",
              selected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50",
            )}
          >
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
                🎨
              </span>
              {selected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  ✓
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-[family-name:var(--font-headline)] text-sm font-semibold leading-tight">
                {t.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {OCCASION_LABELS[t.occasionType]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}