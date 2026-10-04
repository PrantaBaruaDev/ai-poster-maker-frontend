"use client";

import { use } from "react";
import Link from "next/link";
import { usePoster, useRegeneratePoster } from "@/hooks/usePosters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/poster/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { buildDownloadUrl, downloadAsBlob } from "@/lib/utils";
import { toast } from "sonner";


export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: poster, isLoading, isError, error } = usePoster(id);
  const regenerate = useRegeneratePoster(id);

  const download = async () => {
    if (!poster?.generatedImageUrl) return;

    const filename = `poster-${poster.id}.png`;
    const directUrl = buildDownloadUrl(poster.generatedImageUrl, filename);

    if (directUrl === poster.generatedImageUrl) {
      try {
        await downloadAsBlob(poster.generatedImageUrl, filename);
      } catch {
        toast.error("Download failed. Try opening the image in a new tab.");
      }
      return;
    }

    const a = document.createElement("a");
    a.href = directUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button render={ <Link href="/history"/> } nativeButton={false} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to history
        </Button>
        {poster && <StatusBadge status={poster.status} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Preview panel */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-primary/5 to-accent/10">
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {isError && (
                <div className="flex h-full items-center justify-center p-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Could not load poster</AlertTitle>
                    <AlertDescription>{(error as Error)?.message}</AlertDescription>
                  </Alert>
                </div>
              )}

              {poster && poster.status === "GENERATING" && (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
                    <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">Generating your poster…</p>
                    <p className="text-sm text-muted-foreground">
                      This usually takes 5–10 seconds.
                    </p>
                  </div>
                  <Skeleton className="mt-4 aspect-[3/4] w-full max-w-sm rounded-lg opacity-40" />
                </div>
              )}

              {poster && poster.status === "COMPLETED" && poster.generatedImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster.generatedImageUrl}
                  alt="Generated poster"
                  className="h-full w-full object-contain"
                />
              )}

              {poster && poster.status === "FAILED" && (
                <div className="flex h-full items-center justify-center p-6">
                  <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Generation failed</AlertTitle>
                    <AlertDescription>
                      {poster.errorMessage ?? "Something went wrong. Try regenerating."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                disabled={poster?.status !== "COMPLETED" || !poster.generatedImageUrl}
                onClick={download}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>


              <Button
                variant="outline"
                className="w-full"
                disabled={
                  !poster ||
                  poster.status === "GENERATING" ||
                  regenerate.isPending ||
                  (poster.retryCount ?? 0) >= 3
                }
                onClick={() => regenerate.mutate({})}
              >
                {regenerate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate ({poster?.retryCount ?? 0}/3)
              </Button>
              {(poster?.retryCount ?? 0) >= 3 && (
                <p className="text-xs text-muted-foreground">
                  Retry limit reached. Create a new poster to try again.
                </p>
              )}
            </CardContent>
          </Card>

          {poster && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Headline" value={poster.formData.headline} />
                {poster.formData.subheadline && (
                  <Field label="Subheadline" value={poster.formData.subheadline} />
                )}
                <Field label="Name" value={poster.formData.name} />
                <Field label="Designation" value={poster.formData.designation} />
                <Field label="Party" value={poster.formData.party} />
                {poster.formData.district && (
                  <Field label="District" value={poster.formData.district} />
                )}
                {poster.template && (
                  <Field label="Template" value={poster.template.title} />
                )}
              </CardContent>
            </Card>
          )}

          {poster?.status === "GENERATING" && (
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              Auto-refreshing every 2 seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}