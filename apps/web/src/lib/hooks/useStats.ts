"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { throwIfError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type UserStats = components["schemas"]["UserStats"];

const KEY = "/api/users/me/stats";
const fetcher = async () => {
  const r = await clientApi.GET("/api/users/me/stats");
  await throwIfError(r.response);
  if (!r.data) throw new Error("Empty response from /api/users/me/stats");
  return r.data;
};

export function useStats(fallbackData?: UserStats) {
  const { data, isLoading } = useSWR<UserStats>(KEY, fetcher, { fallbackData });
  return { stats: data, isLoading };
}
