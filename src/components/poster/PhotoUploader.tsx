"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadPhoto } from "@/hooks/usePosters";

interface Props {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function PhotoUploader({ urls, onChange, max = 3 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPhoto();
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const remaining = max - urls.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${max} photos`);
      return;
    }

    const accepted = list.slice(0, remaining);
    for (const file of accepted) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: only JPG/PNG/WebP allowed`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: max 5 MB`);
        continue;
      }
      try {
        const res = await upload.mutateAsync(file);
        onChange([...urls, res.url]);
      } catch {
        /* toast already shown by hook */
      }
    }
  };

  const remove = (url: string) => onChange(urls.filter((u) => u !== url));

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition",
          dragOver ? "border-primary bg-primary/5" : "border-border",
          urls.length >= max && "opacity-50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={urls.length >= max}
        />

        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          Drag photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-primary underline-offset-2 hover:underline"
            disabled={urls.length >= max}
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {max} photos • JPG / PNG / WebP • max 5 MB each
        </p>

        {upload.isPending && (
          <p className="mt-3 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
          </p>
        )}
      </div>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Uploaded"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 opacity-0 transition group-hover:opacity-100"
                onClick={() => remove(url)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}