'use client';
import useSWR from 'swr';
import { adminClientApi } from '@/lib/api/admin-client';
import type { components } from '@generated/admin-api/schema.d.ts';

type ApiDrink = components['schemas']['Drink'];
type DrinkEditRequest = components['schemas']['DrinkEditRequest'];
type PagedDrinks = components['schemas']['PagedResultDrink'];

type AdminDrinksKey = [route: string, placeId: string | null];

function fetchAdminDrinks([, placeId]: AdminDrinksKey): Promise<PagedDrinks> {
  return adminClientApi
    .GET('/api/admin/drinks', { params: { query: { placeId: placeId ?? undefined } } })
    .then(r => r.data!);
}

export function useAdminDrinks(placeId: string | null, fallbackData?: PagedDrinks) {
  const key: AdminDrinksKey = ['/api/admin/drinks', placeId];

  const { data, mutate, isLoading } = useSWR<PagedDrinks>(key, fetchAdminDrinks, { fallbackData });

  const elements: ApiDrink[] = data?.elements ?? [];

  const updateDrink = async (id: string, request: DrinkEditRequest) => {
    const optimistic: PagedDrinks = {
      ...data,
      elements: elements.map(d => (d.id === id ? { ...d, ...request } : d)),
    };
    mutate(optimistic, { revalidate: false });
    await adminClientApi.PUT('/api/admin/drinks/{id}', { params: { path: { id } }, body: request });
    mutate();
  };

  return { drinks: elements, isLoading, updateDrink };
}
