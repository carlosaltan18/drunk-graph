import { auth, adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DebugPage() {
  if (process.env.NODE_ENV === "production") redirect("/")

  const reqHeaders = await headers()

  const [userSession, adminSession, userToken, adminToken] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }).catch(() => null),
    adminAuth.api.getSession({ headers: reqHeaders }).catch(() => null),
    auth.api.getAccessToken({ body: { providerId: "fusionauth" }, headers: reqHeaders }).catch(() => null),
    adminAuth.api.getAccessToken({ body: { providerId: "fusionauth-admin" }, headers: reqHeaders }).catch(() => null),
  ])

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-mono text-sm">
      <h1 className="text-lg font-bold mb-6 text-zinc-300">Session Debug</h1>

      <div className="grid gap-6">
        <Section title="User session" active={!!userSession}>
          <Row label="email" value={userSession?.user.email} />
          <Row label="role" value={(userSession?.user as { role?: string })?.role} />
          <TokenRow label="fusionauth JWT" token={userToken?.accessToken} />
        </Section>

        <Section title="Admin session" active={!!adminSession} admin>
          <Row label="email" value={adminSession?.user.email} />
          <Row label="role" value={(adminSession?.user as { role?: string })?.role} />
          <TokenRow label="fusionauth-admin JWT" token={adminToken?.accessToken} />
        </Section>
      </div>
    </main>
  )
}

function Section({ title, active, admin, children }: {
  title: string
  active: boolean
  admin?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-lg border p-4 ${
      admin ? "border-amber-700 bg-amber-950/30" : "border-zinc-700 bg-zinc-900"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`font-bold ${admin ? "text-amber-400" : "text-zinc-300"}`}>{title}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          active ? "bg-green-900 text-green-400" : "bg-zinc-800 text-zinc-500"
        }`}>
          {active ? "active" : "no session"}
        </span>
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-zinc-500 w-16 shrink-0">{label}</span>
      <span className="text-zinc-200">{value ?? <span className="text-zinc-600">—</span>}</span>
    </div>
  )
}

function TokenRow({ label, token }: { label: string; token?: string }) {
  if (!token) return (
    <div className="flex gap-3">
      <span className="text-zinc-500 w-16 shrink-0">{label}</span>
      <span className="text-zinc-600">—</span>
    </div>
  )

  return (
    <div className="mt-1">
      <span className="text-zinc-500 text-xs">{label}</span>
      <pre className="mt-1 p-2 bg-zinc-800 rounded text-xs text-green-400 overflow-x-auto whitespace-pre-wrap break-all select-all">
        {token}
      </pre>
    </div>
  )
}
