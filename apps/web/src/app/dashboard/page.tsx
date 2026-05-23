import { createServerApi } from "@/lib/api/server"
import { ClientRecommendationFeed } from "@/components/magicpath/client-recommendation-feed/ClientRecommendationFeed"

export default async function DashboardPage() {
  const api = await createServerApi()
  const [{ data: recommendations }, { data: tastes }] = await Promise.all([
    api.GET("/api/users/me/recommendations", { params: { query: { limit: 20 } } }),
    api.GET("/api/users/me/tastes"),
  ])

  const hasTastes = tastes && Object.keys(tastes).length > 0

  return (
    <ClientRecommendationFeed
      fallbackRecommendations={recommendations ?? []}
      fallbackHasTastes={hasTastes ?? false}
    />
  )
}
