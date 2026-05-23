import { createServerApi } from "@/lib/api/server"
import { DrinkDetailScreen } from "@/components/magicpath/client-drink-detail/DrinkDetailScreen"

export default async function DrinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const api = await createServerApi()

  const [{ data: drink }, { data: recommendation }] = await Promise.all([
    api.GET("/api/drinks/{id}", { params: { path: { id } } }),
    api.GET("/api/users/me/recommendations/{drinkId}", { params: { path: { drinkId: id } } }),
  ])

  if (!drink) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Drink not found</div>

  return <DrinkDetailScreen drink={drink} fallbackRecommendation={recommendation ?? undefined} />
}
