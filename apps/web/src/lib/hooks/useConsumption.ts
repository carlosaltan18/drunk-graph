'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiDrink = components['schemas']['Drink'];

const KEY = '/api/users/me/consumption';

const fetcher = () =>
  clientApi.GET('/api/users/me/consumption', { params: { query: { limit: 100 } } }).then(r => r.data ?? []);

export function useConsumption(fallbackData?: ApiDrink[]) {
  const { data, mutate, isLoading } = useSWR<ApiDrink[]>(KEY, fetcher, { fallbackData });

  const logDrink = async (drinkId: string, rating: number) => {
    const optimistic = [...(data ?? []), { id: drinkId, rating } as ApiDrink];
    mutate(optimistic, { revalidate: false });
    await clientApi.POST('/api/users/me/consumption', { body: { drinkId, rating } });
    mutate();
  };

  const removeDrink = async (drinkId: string) => {
    mutate((prev) => (prev ?? []).filter(d => d.id !== drinkId), { revalidate: false });
    await clientApi.DELETE('/api/users/me/consumption/{drinkId}', { params: { path: { drinkId } } });
    mutate();
  };

  const hasTried = (drinkId: string) => (data ?? []).some(d => d.id === drinkId);

  return { consumption: data ?? [], isLoading, logDrink, removeDrink, hasTried };
}
