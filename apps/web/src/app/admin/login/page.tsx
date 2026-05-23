import { auth, adminAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SignInAsAdminButton } from "@/app/admin/login/actions"

export default async function AdminLoginPage() {
  const reqHeaders = await headers()

  const [userSession, adminSession] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    adminAuth.api.getSession({ headers: reqHeaders }),
  ])

  if (adminSession) redirect("/admin/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Backoffice</h1>
          <p className="text-sm text-zinc-500">Admin access only</p>
        </div>

        {userSession && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            Signed in as <span className="font-medium text-zinc-900">{userSession.user.email}</span> (regular user)
          </div>
        )}

        <SignInAsAdminButton />
      </div>
    </div>
  )
}
