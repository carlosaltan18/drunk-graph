'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiRecommendation = components['schemas']['Recommendation'];

type RecommendationKey = [route: string, drinkId: string];

function fetchRecommendation([, drinkId]: RecommendationKey): Promise<ApiRecommendation> {
  return clientApi
    .GET('/api/users/me/recommendations/{drinkId}', { params: { path: { drinkId } } })
    .then(r => r.data!);
}

export function useRecommendation(drinkId: string, fallbackData?: ApiRecommendation) {
  const { data, isLoading } = useSWR<ApiRecommendation>(
    ['/api/users/me/recommendations', drinkId] satisfies RecommendationKey,
    fetchRecommendation,
    { fallbackData }
  );
  return { recommendation: data, isLoading };
}
