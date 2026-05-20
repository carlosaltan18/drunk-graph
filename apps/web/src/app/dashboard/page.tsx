import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-500">Logged in as {session?.user.email}</p>
    </div>
  )
}
