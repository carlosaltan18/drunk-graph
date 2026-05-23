import { notFound } from "next/navigation"
import { createServerApi } from "@/lib/api/server"
import { DrinkDetailScreen } from "@/components/magicpath/client-drink-detail/DrinkDetailScreen"

export default async function DrinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const api = await createServerApi()

  const [{ data: drink }, { data: recommendation }, { data: consumption }] = await Promise.all([
    api.GET("/api/drinks/{id}", { params: { path: { id } } }),
    api.GET("/api/users/me/recommendations/{drinkId}", { params: { path: { drinkId: id } } }),
    api.GET("/api/users/me/consumption", { params: { query: { limit: 100 } } }),
  ])

  if (!drink) notFound()

  return <DrinkDetailScreen drink={drink} fallbackRecommendation={recommendation ?? undefined} fallbackConsumption={consumption ?? undefined} />
}
