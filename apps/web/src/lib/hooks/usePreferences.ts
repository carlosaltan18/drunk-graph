'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type User = components['schemas']['User'];
type UserPreferencesRequest = components['schemas']['UserPreferencesRequest'];

const KEY = '/api/users/me';
const fetcher = () => clientApi.GET('/api/users/me').then(r => {
  if (r.error) throw new Error(`${r.response.status} ${r.response.statusText}`);
  return r.data!;
});

export function usePreferences(fallbackData?: User) {
  const { data, mutate, isLoading } = useSWR<User>(KEY, fetcher, { fallbackData });

  const updatePreferences = async (prefs: UserPreferencesRequest) => {
    mutate({ ...(data ?? {}), ...prefs }, { revalidate: false });
    try {
      const res = await clientApi.PUT('/api/users/me', { body: prefs });
      if (res.error) throw new Error(`${res.response.status} ${res.response.statusText}`);
      mutate();
    } catch (err) {
      mutate();
      throw err;
    }
  };

  return { preferences: data, isLoading, updatePreferences };
}
