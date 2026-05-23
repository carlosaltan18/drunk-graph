import { createServerApi } from "@/lib/api/server"
import { DrunkGraphHistory } from "@/components/magicpath/client-history/DrunkGraphHistory"

export default async function HistoryPage() {
  const api = await createServerApi()
  const [{ data: consumed }, { data: stats }] = await Promise.all([
    api.GET("/api/users/me/consumption", { params: { query: { limit: 50 } } }),
    api.GET("/api/users/me/stats"),
  ])

  return <DrunkGraphHistory fallbackConsumption={consumed ?? {}} fallbackStats={stats ?? {}} />
}
