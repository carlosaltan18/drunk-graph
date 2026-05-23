'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';

const KEY = '/api/users/me/tastes';

const fetcher = () => clientApi.GET('/api/users/me/tastes').then(r => r.data ?? {});

export function useTastes(fallbackData?: Record<string, number>) {
  const { data, mutate, isLoading } = useSWR<Record<string, number>>(KEY, fetcher, { fallbackData });

  const addTaste = async (flavor: string, weight: number) => {
    mutate({ ...(data ?? {}), [flavor]: weight }, { revalidate: false });
    await clientApi.POST('/api/users/me/tastes', { body: { flavor, weight } });
    mutate();
  };

  const removeTaste = async (flavor: string) => {
    const next = { ...(data ?? {}) };
    delete next[flavor];
    mutate(next, { revalidate: false });
    await clientApi.DELETE('/api/users/me/tastes/{flavor}', { params: { path: { flavor } } });
    mutate();
  };

  return { tastes: data ?? {}, isLoading, addTaste, removeTaste };
}
