'use client';
import useSWR from 'swr';
import { toast } from 'sonner';
import { adminClientApi } from '@/lib/api/admin-client';
import type { components } from '@generated/admin-api/schema.d.ts';

type Place = components['schemas']['Place'];
type PlaceRequest = components['schemas']['PlaceRequest'];
type PagedResultPlace = components['schemas']['PagedResultPlace'];

const KEY = '/api/admin/places';

const fetcher = (): Promise<PagedResultPlace> =>
  adminClientApi.GET('/api/admin/places').then(r => {
    if (!r.response.ok) throw new Error(`${r.response.status}: ${r.response.statusText}`);
      return r.data!;
  });

export function useAdminPlaces(fallbackData?: PagedResultPlace) {
  const { data, isLoading, error, mutate } = useSWR<PagedResultPlace>(KEY, fetcher, { fallbackData });

  const createPlace = async (request: PlaceRequest) => {
    try {
      const res = await adminClientApi.POST('/api/admin/places', { body: request });
      if (!res.response.ok) throw new Error(`${res.response.status}: ${res.response.statusText}`);
      mutate();
      toast.success('Venue created successfully');
      return { data: res.data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create venue';
      toast.error(message);
      return { data: null, error: message };
    }
  };

  return { 
    places: data?.elements ?? [], 
    total: data?.total ?? 0,
    isLoading, 
    error,
    createPlace
  };
}
