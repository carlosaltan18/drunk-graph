"use client";
import type { components } from "@generated/api/schema.d.ts";
import React from "react";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";
import { clientApi } from "@/lib/api/client";

type ApiConsumedDrink = components["schemas"]["ConsumedDrink"];
type PagedConsumedDrink = components["schemas"]["PagedResultConsumedDrink"];

const KEY = "/api/users/me/consumption";
const STATS_KEY = "/api/users/me/stats";

const fetcher = (): Promise<PagedConsumedDrink> =>
  clientApi
    .GET("/api/users/me/consumption", { params: { query: { limit: 100 } } })
    .then((r) => {
      if (!r.response.ok)
        throw new Error(`${r.response.status}: ${r.response.statusText}`);
      if (!r.data)
        throw new Error("Empty response from /api/users/me/consumption");
      return r.data;
    });

export function useConsumption(fallbackElements?: ApiConsumedDrink[]) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally stable — SSR fallback only needs to be built once
  const fallbackData = React.useMemo<PagedConsumedDrink | undefined>(
    () =>
      fallbackElements
        ? {
            elements: fallbackElements,
            total: fallbackElements.length,
            page: 0,
            limit: 100,
          }
        : undefined,
    [],
  );

  const { data, mutate, isLoading } = useSWR<PagedConsumedDrink>(KEY, fetcher, {
    fallbackData,
  });

  const elements: ApiConsumedDrink[] = data?.elements ?? [];

  const logDrink = async (drinkId: string, rating: number) => {
    const optimistic: PagedConsumedDrink = {
      ...data,
      elements: [...elements, { id: drinkId, rating }],
    };
    void mutate(optimistic, { revalidate: false });
    try {
      const res = await clientApi.POST("/api/users/me/consumption", {
        body: { drinkId, rating },
      });
      if (!res.response.ok)
        throw new Error(`${res.response.status}: ${res.response.statusText}`);
      void mutate();
      void globalMutate(STATS_KEY);
    } catch (err) {
      void mutate();
      toast.error(err instanceof Error ? err.message : "Failed to log drink");
    }
  };

  const removeDrink = async (drinkId: string) => {
    const optimistic: PagedConsumedDrink = {
      ...data,
      elements: elements.filter((d) => d.id !== drinkId),
    };
    void mutate(optimistic, { revalidate: false });
    try {
      const res = await clientApi.DELETE(
        "/api/users/me/consumption/{drinkId}",
        { params: { path: { drinkId } } },
      );
      if (!res.response.ok)
        throw new Error(`${res.response.status}: ${res.response.statusText}`);
      void mutate();
    } catch (err) {
      void mutate();
      toast.error(
        err instanceof Error ? err.message : "Failed to remove drink",
      );
    }
  };

  const hasTried = (drinkId: string) => elements.some((d) => d.id === drinkId);

  return { consumption: elements, isLoading, logDrink, removeDrink, hasTried };
}
