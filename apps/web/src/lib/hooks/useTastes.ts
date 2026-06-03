"use client";
import { toast } from "sonner";
import useSWR from "swr";
import { throwIfError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

const KEY = "/api/users/me/tastes";

const fetcher = async () => {
  const r = await clientApi.GET("/api/users/me/tastes");
  await throwIfError(r.response);
  return r.data ?? {};
};

export function useTastes(fallbackData?: Record<string, number>) {
  const { data, mutate, isLoading } = useSWR<Record<string, number>>(
    KEY,
    fetcher,
    { fallbackData },
  );

  const addTaste = async (flavor: string, weight: number) => {
    void mutate({ ...(data ?? {}), [flavor]: weight }, { revalidate: false });
    try {
      const res = await clientApi.POST("/api/users/me/tastes", {
        body: { flavor, weight },
      });
      await throwIfError(res.response);
      void mutate();
    } catch (err) {
      void mutate();
      toast.error(err instanceof Error ? err.message : "Failed to save taste");
    }
  };

  const removeTaste = async (flavor: string) => {
    const next = { ...(data ?? {}) };
    delete next[flavor];
    void mutate(next, { revalidate: false });
    try {
      const res = await clientApi.DELETE("/api/users/me/tastes/{flavor}", {
        params: { path: { flavor } },
      });
      await throwIfError(res.response);
      void mutate();
    } catch (err) {
      void mutate();
      toast.error(
        err instanceof Error ? err.message : "Failed to remove taste",
      );
    }
  };

  return { tastes: data ?? {}, isLoading, addTaste, removeTaste };
}
