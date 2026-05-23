import { adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { createAdminApi } from "@/lib/api/admin"
import { AdminDrinkEditor } from "@/components/magicpath/admin-venue-list/AdminDrinkEditor"

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await adminAuth.api.getSession({ headers: await headers() })

  const api = await createAdminApi()
  const [{ data: places }, { data: drinks }] = await Promise.all([
    api.GET("/api/admin/places"),
    api.GET("/api/admin/drinks"),
  ])

  const place = places?.find(p => p.id === id)
  const placeDrinks = (drinks ?? []).filter(d => d.placeId === id)

  return (
    <AdminDrinkEditor
      place={place ?? { id, name: id }}
      drinks={placeDrinks}
      userEmail={session!.user.email}
    />
  )
}
