"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { ApiError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type ApiRecommendation = components["schemas"]["Recommendation"];

type RecommendationKey = [route: string, drinkId: string];

async function fetchRecommendation([
  ,
  drinkId,
]: RecommendationKey): Promise<ApiRecommendation> {
  const r = await clientApi.GET("/api/users/me/recommendations/{drinkId}", {
    params: { path: { drinkId } },
  });
  if (!r.response.ok)
    throw new ApiError(r.response.status, r.response.statusText);
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
  const { data, isLoading } = useSWR<ApiRecommendation>(
    ["/api/users/me/recommendations", drinkId] satisfies RecommendationKey,
    fetchRecommendation,
    { fallbackData },
  );
  return { recommendation: data, isLoading };
}
