import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { AdminDrinkCreator } from "@/components/magicpath/admin-drink-creator/AdminDrinkCreator"

export default async function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reqHeaders = await headers()
  const session = await adminAuth.api.getSession({ headers: reqHeaders })
  if (session?.user.role !== "admin") redirect("/admin/login")

  return <AdminDrinkCreator placeId={id} userEmail={session.user.email} />
}
