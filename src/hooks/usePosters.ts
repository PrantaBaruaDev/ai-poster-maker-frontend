"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { posterApi, uploadApi, HttpError } from "@/lib/api";
import type { PosterFormData, Meta, PosterListItem } from "@/types/api";

export const posterKeys = {
  all: ["posters"] as const,
  detail: (id: string) => [...posterKeys.all, "detail", id] as const,
  history: (page: number, limit: number) =>
    [...posterKeys.all, "history", page, limit] as const,
};

export function usePoster(id: string | undefined) {
  return useQuery({
    queryKey: posterKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Poster ID required");
      const { data } = await posterApi.getById(id);
      return data.poster;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "GENERATING" ? 2000 : false;
    },
    // Stop polling after ~60s of trying
    refetchIntervalInBackground: false,
  });
}

export function usePosterHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: posterKeys.history(page, limit),
    queryFn: async (): Promise<{ posters: PosterListItem[]; meta?: Meta }> => {
      const res = await posterApi.history(page, limit);
      return { posters: res.data.posters, meta: res.meta };
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreatePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posterApi.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: posterKeys.all });
      toast.success("Poster generation started");
      return res.data.posterId;
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegeneratePoster(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { formData?: Partial<PosterFormData> }) =>
      posterApi.regenerate(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posterKeys.detail(id) });
      toast.success("Regeneration started");
    },
    onError: (err: Error) => {
      if (err instanceof HttpError && err.status === 429) {
        toast.error("Retry limit reached for this poster");
      } else {
        toast.error(err.message);
      }
    },
  });
}

export function useDeletePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: posterApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: posterKeys.all });
      toast.success("Poster deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: uploadApi.uploadPhoto,
    onError: (err: Error) => toast.error(err.message),
  });
}