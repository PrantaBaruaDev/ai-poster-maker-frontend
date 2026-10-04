"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { posterKeys } from "./usePosters";
import type { CreateTemplateBody, UpdateTemplateBody } from "@/types/api";

export const adminKeys = {
  templates: ["admin", "templates"] as const,
  posters: (flagged: boolean | undefined, page: number, limit: number) =>
    ["admin", "posters", { flagged, page, limit }] as const,
};

export function useAdminTemplates() {
  return useQuery({
    queryKey: adminKeys.templates,
    queryFn: async () => {
      const res = await adminApi.listTemplates();
      return res.data.templates;
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTemplateBody) => adminApi.createTemplate(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.templates });
      toast.success("Template created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTemplateBody }) =>
      adminApi.updateTemplate(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.templates });
      toast.success("Template updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeactivateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.templates });
      toast.success("Template deactivated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminPosters(opts: {
  flagged?: boolean;
  page?: number;
  limit?: number;
} = {}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  return useQuery({
    queryKey: adminKeys.posters(opts.flagged, page, limit),
    queryFn: async () => {
      const res = await adminApi.listPosters({ ...opts, page, limit });
      return { posters: res.data.posters, meta: res.meta };
    },
    placeholderData: (prev) => prev,
  });
}

export function useSetPosterFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isFlagged,
      reason,
    }: {
      id: string;
      isFlagged: boolean;
      reason?: string;
    }) => adminApi.setPosterFlag(id, isFlagged, reason),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "posters"] });
      toast.success(vars.isFlagged ? "Poster flagged" : "Poster unflagged");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminDeletePoster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePoster(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "posters"] });
      qc.invalidateQueries({ queryKey: posterKeys.all });
      toast.success("Poster deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}