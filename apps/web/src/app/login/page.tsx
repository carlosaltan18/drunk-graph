"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const signedOut = searchParams.get("signout") === "true"

  useEffect(() => {
    if (signedOut) return
    authClient.signIn.oauth2({
      providerId: "fusionauth",
      callbackURL: "/dashboard",
    })
  }, [signedOut])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      {signedOut ? (
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Signed out</h1>
            <p className="text-sm text-zinc-500">You have been signed out successfully.</p>
          </div>
          <button
            onClick={() => authClient.signIn.oauth2({ providerId: "fusionauth", callbackURL: "/dashboard" })}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      )}
    </div>
  )
}
