"use client";
import type { components } from "@generated/api/schema.d.ts";
import useSWRInfinite from "swr/infinite";
import { clientApi } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/error";

type ApiDrink = components["schemas"]["Drink"];
type PagedDrinks = components["schemas"]["PagedResultDrink"];

const PAGE_SIZE = 20;

type DrinkKey = [route: string, search: string, page: number, category: string];

function loadedCount(p: PagedDrinks) {
  return (p.page ?? 0) * (p.limit ?? PAGE_SIZE) + (p.elements?.length ?? 0);
}

async function fetchPage([
  ,
  search,
  page,
  category,
]: DrinkKey): Promise<PagedDrinks> {
  if (category !== "all") {
    const r = await clientApi.GET("/api/drinks/category/{category}", {
      params: {
        path: { category },
        query: { search, page, limit: PAGE_SIZE },
      },
    });
    if (!r.response.ok) await throwIfError(r.response);
    if (!r.data) throw new Error("Empty response from /api/drinks/category");
    return r.data;
  }
  const r = await clientApi.GET("/api/drinks", {
    params: { query: { search, page, limit: PAGE_SIZE } },
  });
  if (!r.response.ok) await throwIfError(r.response);
  if (!r.data) throw new Error("Empty response from /api/drinks");
  return r.data;
}

export function useDrinks(
  search: string,
  category: string,
  initialPage?: PagedDrinks,
) {
  const getKey = (page: number, prev: PagedDrinks | null): DrinkKey | null => {
    if (prev && loadedCount(prev) >= (prev.total ?? 0)) return null;
    return ["/api/drinks", search, page, category];
  };

  const fallbackData = initialPage ? [initialPage] : undefined;

  const { data, setSize, isLoading, isValidating } =
    useSWRInfinite<PagedDrinks>(getKey, fetchPage, {
      revalidateFirstPage: false,
      fallbackData,
    });

  const drinks: ApiDrink[] = (data ?? []).flatMap((p) => p.elements ?? []);
  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage
    ? loadedCount(lastPage) < (lastPage.total ?? 0)
    : false;

  return {
    drinks,
    hasMore,
    isLoading,
    isValidating,
    loadMore: () => setSize((s) => s + 1),
  };
}
