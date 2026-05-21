"use client"

import { useEffect } from "react"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  useEffect(() => {
    authClient.signIn.oauth2({
      providerId: "fusionauth",
      callbackURL: "/dashboard",
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
    </div>
  )
}
