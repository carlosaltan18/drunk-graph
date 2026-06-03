"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { clientApi } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/error";

type ApiRecommendation = components["schemas"]["Recommendation"];

type RecommendationKey = [route: string, drinkId: string];

async function fetchRecommendation([
  ,
  drinkId,
]: RecommendationKey): Promise<ApiRecommendation | null> {
  const r = await clientApi.GET("/api/users/me/recommendations/{drinkId}", {
    params: { path: { drinkId } },
  });
  if (r.response.status === 404) return null;
  if (!r.response.ok) await throwIfError(r.response);
  if (!r.data)
    throw new Error(
      "Empty response from /api/users/me/recommendations/{drinkId}",
    );
  return r.data;
}

export function useRecommendation(
  drinkId: string,
  fallbackData?: ApiRecommendation,
) {
  const swrKey: RecommendationKey = ["/api/users/me/recommendations", drinkId];
  const { data, isLoading } = useSWR<
    ApiRecommendation | null,
    Error,
    RecommendationKey
  >(swrKey, fetchRecommendation, { fallbackData });
  return { recommendation: data, isLoading };
}
