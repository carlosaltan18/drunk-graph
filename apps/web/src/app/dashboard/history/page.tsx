import { createServerApi } from "@/lib/api/server"
import { DrunkGraphHistory } from "@/components/magicpath/client-history/DrunkGraphHistory"

export default async function HistoryPage() {
  const api = await createServerApi()
  const { data: drinks } = await api.GET("/api/users/me/consumption", {
    params: { query: { limit: 50 } },
  })

  return <DrunkGraphHistory drinks={drinks ?? []} />
}
