"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { ApiError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type ApiRecommendation = components["schemas"]["Recommendation"];

const KEY = "/api/users/me/recommendations";

const fetcher = (): Promise<ApiRecommendation[]> =>
  clientApi
    .GET("/api/users/me/recommendations", { params: { query: { limit: 20 } } })
    .then((r) => {
      if (!r.response.ok)
        throw new ApiError(r.response.status, r.response.statusText);
      if (!r.data)
        throw new Error("Empty response from /api/users/me/recommendations");
      return r.data;
    });

export function useRecommendations(fallbackData?: ApiRecommendation[]) {
  const { data, isLoading } = useSWR<ApiRecommendation[]>(KEY, fetcher, {
    fallbackData,
  });
  return { recommendations: data ?? [], isLoading };
}
