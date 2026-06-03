"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { clientApi } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/error";

type ApiRecommendation = components["schemas"]["Recommendation"];

const KEY = "/api/users/me/recommendations";

const fetcher = async (): Promise<ApiRecommendation[]> => {
  const r = await clientApi.GET("/api/users/me/recommendations", {
    params: { query: { limit: 20 } },
  });
  await throwIfError(r.response);
  if (!r.data)
    throw new Error("Empty response from /api/users/me/recommendations");
  return r.data;
};

export function useRecommendations(fallbackData?: ApiRecommendation[]) {
  const { data, isLoading } = useSWR<ApiRecommendation[]>(KEY, fetcher, {
    fallbackData,
  });
  return { recommendations: data ?? [], isLoading };
}
