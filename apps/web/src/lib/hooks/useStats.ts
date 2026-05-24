'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type UserStats = components['schemas']['UserStats'];

const KEY = '/api/users/me/stats';
const fetcher = () => clientApi.GET('/api/users/me/stats').then(r => {
  if (!r.response.ok) throw new Error(`${r.response.status}: ${r.response.statusText}`);
  return r.data!;
});

export function useStats(fallbackData?: UserStats) {
  const { data, isLoading } = useSWR<UserStats>(KEY, fetcher, { fallbackData });
  return { stats: data, isLoading };
}
