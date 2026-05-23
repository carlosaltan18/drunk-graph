'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiRecommendation = components['schemas']['Recommendation'];

export function useRecommendation(drinkId: string, fallbackData?: ApiRecommendation) {
  const { data, isLoading } = useSWR<ApiRecommendation>(
    `/api/users/me/recommendations/${drinkId}`,
    () => clientApi.GET('/api/users/me/recommendations/{drinkId}', { params: { path: { drinkId } } }).then(r => r.data!),
    { fallbackData }
  );
  return { recommendation: data, isLoading };
}
