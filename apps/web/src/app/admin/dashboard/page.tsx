import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function AdminDashboard() {
  const session = await adminAuth.api.getSession({ headers: await headers() })

  if (session?.user.role !== "admin") redirect("/admin/login")

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-zinc-500">Backoffice — coming soon</p>
    </main>
  )
}
