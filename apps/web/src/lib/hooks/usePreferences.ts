'use client';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type UserPreferencesRequest = components['schemas']['UserPreferencesRequest'];

export function usePreferences() {
  const updatePreferences = async (prefs: UserPreferencesRequest) => {
    await clientApi.PUT('/api/users/me', { body: prefs });
  };

  return { updatePreferences };
}
