'use client';
import useSWR from 'swr';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type User = components['schemas']['User'];
type UserPreferencesRequest = components['schemas']['UserPreferencesRequest'];

const KEY = '/api/users/me';
const fetcher = () => clientApi.GET('/api/users/me').then(r => r.data!);

export function usePreferences(fallbackData?: User) {
  const { data, mutate, isLoading } = useSWR<User>(KEY, fetcher, { fallbackData });

  const updatePreferences = async (prefs: UserPreferencesRequest) => {
    mutate({ ...(data ?? {}), ...prefs }, { revalidate: false });
    await clientApi.PUT('/api/users/me', { body: prefs });
    mutate();
  };

  return { preferences: data, isLoading, updatePreferences };
}
