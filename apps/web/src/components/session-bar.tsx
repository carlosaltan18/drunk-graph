"use client"

import { useRouter } from "next/navigation"
import { signOutUser, signOutAdmin } from "@/lib/actions/auth"

type Props = {
  email: string
  role: "user" | "admin"
  otherSession: { email: string; role: "user" | "admin" } | null
}

export default function SessionBar({ email, role, otherSession }: Props) {
  const router = useRouter()

  async function signOut() {
    if (role === "admin") await signOutAdmin()
    else await signOutUser()
  }

  function switchSession() {
    router.push(otherSession?.role === "admin" ? "/admin/dashboard" : "/dashboard")
    router.refresh()
  }

  const isAdmin = role === "admin"

  return (
    <div className={`w-full px-4 py-2 flex items-center gap-3 text-sm ${
      isAdmin
        ? "bg-amber-400 text-amber-950"
        : "bg-zinc-100 text-zinc-600 border-b border-zinc-200"
    }`}>
      {isAdmin && <span className="font-bold tracking-widest text-xs">⚠ BACKOFFICE</span>}
      <span className={`font-medium ${isAdmin ? "text-amber-900" : "text-zinc-800"}`}>{email}</span>

      <div className="ml-auto flex items-center gap-2">
        {otherSession && (
          <button
            onClick={switchSession}
            className={`text-xs px-2 py-1 rounded font-medium ${
              isAdmin
                ? "bg-amber-300 hover:bg-amber-200 text-amber-950"
                : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
            }`}
          >
            {otherSession.role === "admin" ? "Switch to backoffice ↗" : "Switch to user app ↗"}
          </button>
        )}
        <button
          onClick={signOut}
          className={`text-xs px-2 py-1 rounded font-medium ${
            isAdmin
              ? "bg-amber-300 hover:bg-amber-200 text-amber-950"
              : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
          }`}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
