"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TemplatePicker } from "@/components/poster/TemplatePicker";
import {
  PhotoUploader,
  type UploadedPhoto,
} from "@/components/poster/PhotoUploader";
import { useCreatePoster } from "@/hooks/usePosters";
import { useTemplate } from "@/hooks/useTemplates";
import { Loader2, Wand2 } from "lucide-react";
import type { TemplateListItem } from "@/types/api";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  designation: z.string().trim().min(1, "Required").max(80),
  party: z.string().trim().min(1, "Required").max(120),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  headline: z.string().trim().min(1, "Required").max(100),
  subheadline: z.string().trim().max(80).optional().or(z.literal("")),
  slogan: z.string().trim().max(80).optional().or(z.literal("")),
  tribute: z.string().trim().max(200).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_MAX_PHOTOS = 3;

export default function CreatePage() {
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateListItem | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const create = useCreatePoster();

  // Fetch template detail to learn how many photo slots it accepts.
  // The list endpoint only returns lightweight fields.
  const { data: templateDetail } = useTemplate(template?.id);
  const maxPhotos =
    templateDetail?.layoutConfig?.photoSlots?.length ?? DEFAULT_MAX_PHOTOS;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      designation: "",
      party: "",
      district: "",
      headline: "",
      subheadline: "",
      slogan: "",
      tribute: "",
    },
  });

  const handleTemplateChange = (next: TemplateListItem) => {
    // Only clear photos when the template actually changes.
    // This prevents silent over-limit submissions.
    if (template && template.id !== next.id && photos.length > 0) {
      setPhotos([]);
    }
    setTemplate(next);
  };

  const onSubmit = async (values: FormValues) => {
    if (!template) return;

    const res = await create.mutateAsync({
      templateId: template.id,
      formData: {
        name: values.name,
        designation: values.designation,
        party: values.party,
        ...(values.district && { district: values.district }),
        headline: values.headline,
        ...(values.subheadline && { subheadline: values.subheadline }),
        ...(values.slogan && { slogan: values.slogan }),
        ...(values.tribute && { tribute: values.tribute }),
      },
      photoUrls: photos.map((p) => p.url),
      photoPublicIds: photos.map((p) => p.publicId),
    });

    router.push(`/preview/${res.data.posterId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Poster</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a template, fill the details, upload photos, and let AI design the layout.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose a template</CardTitle>
              <CardDescription>
                Match the occasion you&apos;re designing for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplatePicker
                value={template?.id ?? null}
                onChange={handleTemplateChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Poster details</CardTitle>
              <CardDescription>
                These appear on the poster exactly as you type them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">
                  Headline <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="headline"
                  rows={2}
                  placeholder="মহান বিজয় দিবস"
                  className="font-[family-name:var(--font-headline)] text-lg"
                  {...register("headline")}
                />
                {errors.headline && (
                  <p className="text-xs text-destructive">
                    {errors.headline.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Input
                    id="subheadline"
                    placeholder="১৬ ডিসেম্বর"
                    {...register("subheadline")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    placeholder="টেক ব্যাক বাংলাদেশ"
                    {...register("slogan")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tribute">Tribute line (mourning posters)</Label>
                <Textarea
                  id="tribute"
                  rows={2}
                  placeholder="আমরা তাকে কৃতজ্ঞতার সঙ্গে স্মরণ করি।"
                  {...register("tribute")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requester info</CardTitle>
              <CardDescription>
                Shown on the poster and in the footer credit line.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="মোঃ করিম উদ্দিন"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">
                  Designation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designation"
                  placeholder="সাধারণ সম্পাদক"
                  {...register("designation")}
                />
                {errors.designation && (
                  <p className="text-xs text-destructive">
                    {errors.designation.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="party">
                  Party / Organization <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="party"
                  placeholder="বাংলাদেশ আওয়ামী লীগ"
                  {...register("party")}
                />
                {errors.party && (
                  <p className="text-xs text-destructive">
                    {errors.party.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District / Union</Label>
                <Input
                  id="district"
                  placeholder="ঢাকা"
                  {...register("district")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
              <CardDescription>
                Add up to {maxPhotos} photo{maxPhotos === 1 ? "" : "s"}. The first
                is the main portrait.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={photos}
                onChange={setPhotos}
                max={maxPhotos}
              />
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!template || create.isPending}
              >
                {create.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate poster
                  </>
                )}
              </Button>
              {!template && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Pick a template to continue
                </p>
              )}
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Generation usually takes 5–10 seconds. You can tweak and
                regenerate up to 3 times.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}