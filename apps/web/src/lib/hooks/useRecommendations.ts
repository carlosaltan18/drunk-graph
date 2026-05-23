'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiRecommendation = components['schemas']['Recommendation'];

const fetcher = () =>
  clientApi.GET('/api/users/me/recommendations', { params: { query: { limit: 20 } } }).then(r => r.data ?? []);

export function useRecommendations(fallbackData?: ApiRecommendation[]) {
  const { data, isLoading } = useSWR<ApiRecommendation[]>('/api/users/me/recommendations', fetcher, { fallbackData });
  return { recommendations: data ?? [], isLoading };
}
