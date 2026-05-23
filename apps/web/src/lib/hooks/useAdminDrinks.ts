'use client';
import useSWR from 'swr';
import { adminClientApi } from '@/lib/api/admin-client';
import type { components } from '@generated/admin-api/schema.d.ts';

type ApiDrink = components['schemas']['Drink'];

const KEY = '/api/admin/drinks';

const fetcher = () => adminClientApi.GET('/api/admin/drinks').then(r => r.data ?? []);

export function useAdminDrinks(fallbackData?: ApiDrink[]) {
  const { data, mutate, isLoading } = useSWR<ApiDrink[]>(KEY, fetcher, { fallbackData });

  const updateDrink = async (id: string, drink: Partial<ApiDrink>) => {
    mutate((prev) => (prev ?? []).map(d => d.id === id ? { ...d, ...drink } : d), { revalidate: false });
    await adminClientApi.PUT('/api/admin/drinks/{id}', { params: { path: { id } }, body: drink as ApiDrink });
    mutate();
  };

  return { drinks: data ?? [], isLoading, updateDrink };
}
