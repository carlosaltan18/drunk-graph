import { createServerApi } from "@/lib/api/server"
import { DrinkBrowseScreen } from "@/components/magicpath/client-browse/DrinkBrowseScreen"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const { search = "", category } = await searchParams
  const api = await createServerApi()

  const { data: drinks } = category
    ? await api.GET("/api/drinks/category/{category}", {
        params: { path: { category }, query: { search, limit: 30 } },
      })
    : await api.GET("/api/drinks", { params: { query: { search, limit: 30 } } })

  return <DrinkBrowseScreen drinks={drinks ?? []} initialSearch={search} initialCategory={category} />
}
