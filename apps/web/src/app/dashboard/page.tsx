import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getMe(cookie: string) {
  const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/proxy/me`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json() as Promise<{ sub: string; email: string; name: string }>
}

export default async function DashboardPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  const cookie = reqHeaders.get("cookie") ?? ""
  const me = await getMe(cookie)

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-500">Logged in as {session?.user.email}</p>
      {me ? (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm font-mono">
          <p className="font-semibold text-zinc-700 mb-2">Spring API /me response</p>
          <pre className="text-zinc-500">{JSON.stringify(me, null, 2)}</pre>
        </div>
      ) : (
        <p className="text-sm text-red-500">Failed to reach Spring API</p>
      )}
    </div>
  )
}
