import { adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { createAdminApi } from "@/lib/api/admin"
import { AdminVenueList } from "@/components/magicpath/admin-venue-list/AdminVenueList"

export default async function AdminDashboard() {
  const session = await adminAuth.api.getSession({ headers: await headers() })

  const api = await createAdminApi()
  const { data: places } = await api.GET("/api/admin/places")

  return <AdminVenueList places={places ?? []} userEmail={session!.user.email} />
}
