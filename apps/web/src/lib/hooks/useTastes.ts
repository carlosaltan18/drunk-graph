'use client';
import useSWR from 'swr';
import { toast } from 'sonner';
import { clientApi } from '@/lib/api/client';

const KEY = '/api/users/me/tastes';

const fetcher = () => clientApi.GET('/api/users/me/tastes').then(r => {
  if (!r.response.ok) throw new Error(`${r.response.status}: ${r.response.statusText}`);
  return r.data ?? {};
});

export function useTastes(fallbackData?: Record<string, number>) {
  const { data, mutate, isLoading } = useSWR<Record<string, number>>(KEY, fetcher, { fallbackData });

  const addTaste = async (flavor: string, weight: number) => {
    mutate({ ...(data ?? {}), [flavor]: weight }, { revalidate: false });
    try {
      const res = await clientApi.POST('/api/users/me/tastes', { body: { flavor, weight } });
      if (!res.response.ok) throw new Error(`${res.response.status}: ${res.response.statusText}`);
      mutate();
    } catch (err) {
      mutate();
      toast.error(err instanceof Error ? err.message : 'Failed to save taste');
    }
  };

  const removeTaste = async (flavor: string) => {
    const next = { ...(data ?? {}) };
    delete next[flavor];
    mutate(next, { revalidate: false });
    try {
      const res = await clientApi.DELETE('/api/users/me/tastes/{flavor}', { params: { path: { flavor } } });
      if (!res.response.ok) throw new Error(`${res.response.status}: ${res.response.statusText}`);
      mutate();
    } catch (err) {
      mutate();
      toast.error(err instanceof Error ? err.message : 'Failed to remove taste');
    }
  };

  return { tastes: data ?? {}, isLoading, addTaste, removeTaste };
}
