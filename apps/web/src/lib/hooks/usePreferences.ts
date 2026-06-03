"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { throwIfError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type User = components["schemas"]["User"];
type UserPreferencesRequest = components["schemas"]["UserPreferencesRequest"];

const KEY = "/api/users/me";
const fetcher = async () => {
  const r = await clientApi.GET("/api/users/me");
  await throwIfError(r.response);
  return r.data as User;
};

export function usePreferences(fallbackData?: User) {
  const { data, mutate, isLoading } = useSWR<User>(KEY, fetcher, {
    fallbackData,
  });

  const updatePreferences = async (prefs: UserPreferencesRequest) => {
    void mutate({ ...(data ?? {}), ...prefs }, { revalidate: false });
    try {
      const res = await clientApi.PUT("/api/users/me", { body: prefs });
      await throwIfError(res.response);
      void mutate();
    } catch (err) {
      void mutate();
      throw err;
    }
  };

  return { preferences: data, isLoading, updatePreferences };
}
