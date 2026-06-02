"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWR from "swr";
import { ApiError } from "@/lib/api/error";
import { clientApi } from "@/lib/api/client";

type User = components["schemas"]["User"];
type UserPreferencesRequest = components["schemas"]["UserPreferencesRequest"];

const KEY = "/api/users/me";
const fetcher = () =>
  clientApi.GET("/api/users/me").then((r) => {
    if (!r.response.ok)
      throw new ApiError(r.response.status, r.response.statusText);
    return r.data as User;
  });

export function usePreferences(fallbackData?: User) {
  const { data, mutate, isLoading } = useSWR<User>(KEY, fetcher, {
    fallbackData,
  });

  const updatePreferences = async (prefs: UserPreferencesRequest) => {
    void mutate({ ...(data ?? {}), ...prefs }, { revalidate: false });
    try {
      const res = await clientApi.PUT("/api/users/me", { body: prefs });
      if (!res.response.ok)
        throw new ApiError(res.response.status, res.response.statusText);
      void mutate();
    } catch (err) {
      void mutate();
      throw err;
    }
  };

  return { preferences: data, isLoading, updatePreferences };
}
