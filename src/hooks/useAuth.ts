"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, HttpError } from "@/lib/api";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await authApi.me();
        return data.user;
      } catch (err) {
        if (err instanceof HttpError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      qc.setQueryData(AUTH_QUERY_KEY, res.data.user);
      toast.success("Logged in");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      qc.setQueryData(AUTH_QUERY_KEY, res.data.user);
      toast.success("Account created");
      router.push("/dashboard");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      qc.setQueryData(AUTH_QUERY_KEY, null);
      qc.clear();
      toast.success("Logged out");
      router.push("/login");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}