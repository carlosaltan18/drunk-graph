'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiRecommendation = components['schemas']['Recommendation'];

const KEY = '/api/users/me/recommendations';

const fetcher = (): Promise<ApiRecommendation[]> =>
  clientApi.GET('/api/users/me/recommendations', { params: { query: { limit: 20 } } }).then(r => {
    if (r.error) throw new Error(`${r.response.status} ${r.response.statusText}`);
    return r.data!;
  });

export function useRecommendations(fallbackData?: ApiRecommendation[]) {
  const { data, isLoading } = useSWR<ApiRecommendation[]>(KEY, fetcher, { fallbackData });
  return { recommendations: data ?? [], isLoading };
}
