"use client";

import { useQuery } from "@tanstack/react-query";
import { templateApi } from "@/lib/api";
import type { OccasionType } from "@/types/api";

export const templateKeys = {
  all: ["templates"] as const,
  list: (occasion?: OccasionType) => [...templateKeys.all, "list", occasion] as const,
  detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

export function useTemplates(occasion?: OccasionType) {
  return useQuery({
    queryKey: templateKeys.list(occasion),
    queryFn: async () => {
      const { data } = await templateApi.list(occasion);
      return data.templates;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Template ID required");
      const { data } = await templateApi.getById(id);
      return data.template;
    },
    enabled: !!id,
  });
}