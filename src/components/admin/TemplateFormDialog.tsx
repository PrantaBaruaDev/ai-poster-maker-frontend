"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminTemplateListItem,
  OccasionType,
} from "@/types/api";
import {
  useCreateTemplate,
  useUpdateTemplate,
} from "@/hooks/useAdmin";

const OCCASIONS: { value: OccasionType; label: string }[] = [
  { value: "VICTORY", label: "বিজয় দিবস (Victory)" },
  { value: "MOURNING", label: "শোক / স্মরণ (Mourning)" },
  { value: "CAMPAIGN", label: "নির্বাচনী প্রচার (Campaign)" },
  { value: "GREETINGS", label: "শুভেচ্ছা (Greetings)" },
  { value: "FESTIVAL", label: "ঈদ / উৎসব (Festival)" },
];

const HTML_KEYS = ["victory", "mourning", "campaign"] as const;

const DEFAULT_LAYOUTS: Record<string, object> = {
  victory: {
    canvas: { width: 1200, height: 1600 },
    photoSlots: [
      { id: "leader1", x: 180, y: 200, w: 380, h: 480, shape: "rect" },
      { id: "leader2", x: 640, y: 200, w: 380, h: 480, shape: "rect" },
    ],
    textSlots: {
      headline: { x: 600, y: 820, align: "center", maxSize: 140 },
    },
    colorScheme: {
      primary: "#006A4E",
      accent: "#F42A41",
      text: "#FFFFFF",
      background: "#0B3D2E",
    },
  },
  mourning: {
    canvas: { width: 1200, height: 1600 },
    photoSlots: [
      { id: "portrait", x: 420, y: 180, w: 360, h: 440, shape: "circle" },
    ],
    textSlots: {
      headline: { x: 600, y: 720, align: "center", maxSize: 110 },
    },
    colorScheme: {
      primary: "#1A1A1A",
      accent: "#C8A951",
      text: "#FFFFFF",
      background: "#000000",
    },
  },
  campaign: {
    canvas: { width: 1200, height: 1600 },
    photoSlots: [
      { id: "leader", x: 120, y: 160, w: 500, h: 620, shape: "rect" },
      { id: "symbol", x: 720, y: 260, w: 340, h: 340, shape: "rect" },
    ],
    textSlots: {
      headline: { x: 600, y: 900, align: "center", maxSize: 130 },
    },
    colorScheme: {
      primary: "#006A4E",
      accent: "#FFD700",
      text: "#FFFFFF",
      background: "#0A2A1F",
    },
  },
};

const formSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  title: z.string().min(1).max(120),
  occasionType: z.enum(["VICTORY", "MOURNING", "CAMPAIGN", "GREETINGS", "FESTIVAL"]),
  thumbnailUrl: z.string().min(1).max(500),
  htmlTemplateKey: z.enum(["victory", "mourning", "campaign"]),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AdminTemplateListItem | null;
}

export function TemplateFormDialog({ open, onOpenChange, template }: Props) {
  const isEdit = !!template;
  const create = useCreateTemplate();
  const update = useUpdateTemplate();

  const [layoutJson, setLayoutJson] = useState("");
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      title: "",
      occasionType: "VICTORY",
      thumbnailUrl: "",
      htmlTemplateKey: "victory",
      isActive: true,
    },
  });

  const htmlKey = watch("htmlTemplateKey");
  const occasionType = watch("occasionType");
  const isActive = watch("isActive");

  // Prefill when the dialog opens
  useEffect(() => {
    if (!open) return;
    if (template) {
      reset({
        slug: template.slug,
        title: template.title,
        occasionType: template.occasionType,
        thumbnailUrl: template.thumbnailUrl,
        htmlTemplateKey: template.htmlTemplateKey as "victory" | "mourning" | "campaign",
        isActive: template.isActive,
      });
      setLayoutJson(JSON.stringify(template.layoutConfig, null, 2));
    } else {
      reset({
        slug: "",
        title: "",
        occasionType: "VICTORY",
        thumbnailUrl: "/templates/new.png",
        htmlTemplateKey: "victory",
        isActive: true,
      });
      setLayoutJson(JSON.stringify(DEFAULT_LAYOUTS.victory, null, 2));
    }
    setLayoutError(null);
  }, [open, template, reset]);

  // When the html template key changes for a NEW template, prefill layout
  useEffect(() => {
    if (isEdit || !open) return;
    const defaultLayout = DEFAULT_LAYOUTS[htmlKey];
    if (defaultLayout) setLayoutJson(JSON.stringify(defaultLayout, null, 2));
  }, [htmlKey, isEdit, open]);

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setLayoutError(null);
      return true;
    } catch (e) {
      setLayoutError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!validateJson(layoutJson)) {
      toast.error("Fix the layout JSON before saving");
      return;
    }

    const layoutConfig = JSON.parse(layoutJson);

    if (isEdit && template) {
      const { slug: _slug, ...body } = { ...values, layoutConfig };
      await update.mutateAsync({ id: template.id, body });
    } else {
      await create.mutateAsync({ ...values, layoutConfig });
    }
    onOpenChange(false);
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes take effect for new poster generations."
              : "Define a new template and its slot configuration."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="eid-greetings"
                disabled={isEdit}
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Slug cannot be changed after creation.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Bangla)</Label>
              <Input id="title" placeholder="ঈদ মোবারক" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select
                value={occasionType}
                onValueChange={(v) =>
                  setValue("occasionType", v as OccasionType, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>HTML template</Label>
              <Select
                value={htmlKey}
                onValueChange={(v) =>
                  setValue(
                    "htmlTemplateKey",
                    v as "victory" | "mourning" | "campaign",
                    { shouldDirty: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTML_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}.hbs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Which renderer file to use.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="/templates/eid.png"
                {...register("thumbnailUrl")}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive templates are hidden from users.
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) =>
                  setValue("isActive", v, { shouldDirty: true })
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="layoutJson">Layout config (JSON)</Label>
              <Textarea
                id="layoutJson"
                rows={16}
                className="font-mono text-xs"
                value={layoutJson}
                onChange={(e) => {
                  setLayoutJson(e.target.value);
                  validateJson(e.target.value);
                }}
              />
              {layoutError ? (
                <p className="text-xs text-destructive">{layoutError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Valid JSON. Pre-filled based on the HTML template.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}