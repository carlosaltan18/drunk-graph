"use client";
import type { components } from "@generated/admin-api/schema.d.ts";
import { toast } from "sonner";
import useSWR from "swr";
import { throwIfError } from "@/lib/api/error";
import { adminClientApi } from "@/lib/api/admin-client";

type PlaceRequest = components["schemas"]["PlaceRequest"];
type PagedResultPlace = components["schemas"]["PagedResultPlace"];

const KEY = "/api/admin/places";

const fetcher = async (): Promise<PagedResultPlace> => {
  const r = await adminClientApi.GET("/api/admin/places");
  await throwIfError(r.response);
  if (!r.data) throw new Error("Empty response from /api/admin/places");
  return r.data;
};

export function useAdminPlaces(fallbackData?: PagedResultPlace) {
  const { data, isLoading, mutate } = useSWR<PagedResultPlace>(KEY, fetcher, {
    fallbackData,
  });

  const createPlace = async (request: PlaceRequest) => {
    try {
      const res = await adminClientApi.POST("/api/admin/places", {
        body: request,
      });
      await throwIfError(res.response);
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
