"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { ApiError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type UserStats = components["schemas"]["UserStats"];

const KEY = "/api/users/me/stats";
const fetcher = () =>
  clientApi.GET("/api/users/me/stats").then((r) => {
    if (!r.response.ok)
      throw new ApiError(r.response.status, r.response.statusText);
    if (!r.data) throw new Error("Empty response from /api/users/me/stats");
    return r.data;
  });

export function useStats(fallbackData?: UserStats) {
  const { data, isLoading } = useSWR<UserStats>(KEY, fetcher, { fallbackData });
  return { stats: data, isLoading };
}
