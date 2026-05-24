"use client";
import type { components } from "@generated/admin-api/schema.d.ts";
import { toast } from "sonner";
import useSWR from "swr";
import { adminClientApi } from "@/lib/api/admin-client";

type PlaceRequest = components["schemas"]["PlaceRequest"];
type PagedResultPlace = components["schemas"]["PagedResultPlace"];

const KEY = "/api/admin/places";

const fetcher = (): Promise<PagedResultPlace> =>
  adminClientApi.GET("/api/admin/places").then((r) => {
    if (!r.response.ok)
      throw new Error(`${r.response.status}: ${r.response.statusText}`);
    if (!r.data) throw new Error("Empty response from /api/admin/places");
    return r.data;
  });

export function useAdminPlaces(fallbackData?: PagedResultPlace) {
  const { data, isLoading, mutate } = useSWR<PagedResultPlace>(KEY, fetcher, {
    fallbackData,
  });

  const createPlace = async (request: PlaceRequest) => {
    try {
      const res = await adminClientApi.POST("/api/admin/places", {
        body: request,
      });
      if (!res.response.ok)
        throw new Error(`${res.response.status}: ${res.response.statusText}`);
      void mutate();
      toast.success("Venue created successfully");
      return { data: res.data, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create venue";
      toast.error(message);
      return { data: null, error: message };
    }
  };

  return {
    places: data?.elements ?? [],
    total: data?.total ?? 0,
    isLoading,
    createPlace,
  };
}
