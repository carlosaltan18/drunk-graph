"use client"

import { adminAuthClient } from "@/lib/auth-client"

export function SignInAsAdminButton() {
  function signInAsAdmin() {
    adminAuthClient.signIn.oauth2({
      providerId: "fusionauth-admin",
      callbackURL: "/admin/dashboard",
    })
  }

  return (
    <button
      onClick={signInAsAdmin}
      className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
    >
      Sign in as admin
    </button>
  )
}
