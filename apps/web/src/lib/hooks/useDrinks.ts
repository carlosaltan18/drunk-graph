'use client';
import useSWRInfinite from 'swr/infinite';
import { clientApi } from '@/lib/api/client';
import type { components } from '@generated/api/schema.d.ts';

type ApiDrink = components['schemas']['Drink'];

const PAGE_SIZE = 20;

export function useDrinks(search: string, category: string) {
  const getKey = (page: number, prev: ApiDrink[] | null) => {
    if (prev && prev.length < PAGE_SIZE) return null;
    return `${category !== 'all' ? `/api/drinks/category/${category}` : '/api/drinks'}?search=${search}&page=${page}&limit=${PAGE_SIZE}`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<ApiDrink[]>(
    getKey,
    (key: string) => {
      const url = new URL(key, 'http://x');
      const s = url.searchParams.get('search') ?? '';
      const page = parseInt(url.searchParams.get('page') ?? '0');
      if (category !== 'all') {
        return clientApi
          .GET('/api/drinks/category/{category}', {
            params: { path: { category }, query: { search: s, page, limit: PAGE_SIZE } },
          })
          .then(r => r.data ?? []);
      }
      return clientApi
        .GET('/api/drinks', { params: { query: { search: s, page, limit: PAGE_SIZE } } })
        .then(r => r.data ?? []);
    },
    { revalidateFirstPage: false }
  );

  const drinks = (data ?? []).flat();
  const hasMore = (data?.[data.length - 1]?.length ?? 0) === PAGE_SIZE;
  const loadMore = () => setSize(s => s + 1);

  return { drinks, hasMore, isLoading, isValidating, loadMore };
}
